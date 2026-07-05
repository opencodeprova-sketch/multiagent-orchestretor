import asyncio
import logging
import re
import uuid
from pathlib import Path

from config import settings
from opencode_sync import sync_mcp_server, sync_plugin, sync_agent, sync_memory, sync_global_rules, sync_skill, read_memory, read_global_rules, read_global_memory, sync_global_memory, read_project_rules, sync_project_rules
from models import (
    ActivityStatus,
    AgentActivity,
    AgentState,
    AgentStats,
    ChatMessageOut,
    CommandProposal,
    WsEventType,
)
from opencode_runner import (
    OpencodeRunner,
    get_opencode_config,
    get_projects_list,
    get_project_files,
    get_mcp_servers_state,
    get_plugins_state,
    get_skills_state,
    now_chat_time,
    now_time,
    save_project_state,
)
from websocket_manager import WebSocketManager

logger = logging.getLogger(__name__)

# Pattern per rilevare azioni/decisioni degli agenti nella chat
ACTION_PATTERNS = [
    re.compile(r"(?:^|\s)(?:run|esegui|execute|lancia)\s*[:\-]?\s*(.+)$", re.IGNORECASE),
    re.compile(r"`(opencode[^`]+)`"),
    re.compile(r"\bopencode\s+run\b(.+)", re.IGNORECASE),
    re.compile(r"\bACTION:\s*(.+)$", re.IGNORECASE | re.MULTILINE),
]

# Trigger diretti dall'utente
USER_RUN_PREFIX = re.compile(r"^/(?:run|opencode)\s+(.+)", re.IGNORECASE | re.DOTALL)
# Comandi diretti /goal, /caveman, ecc.
USER_COMMAND_PREFIX = re.compile(r"^/(\w+)(?:\s+(.*))?$", re.IGNORECASE | re.DOTALL)


def _default_agents() -> dict[str, AgentState]:
    """Crea agenti con nomi reali OpenCode, stato pulito."""
    specs = [
        ("coordinator", "Coordinator", "#f97316", [
            "In attesa di task...",
        ]),
        ("architect", "Architect", "#3b82f6", [
            "In attesa di task...",
        ]),
        ("coder", "Coder", "#22c55e", [
            "In attesa di task...",
        ]),
        ("tester", "Tester", "#a855f7", [
            "In attesa di task...",
        ]),
        ("direttore", "Direttore", "#ef4444", [
            "In attesa di task...",
        ]),
    ]
    agents: dict[str, AgentState] = {}
    for agent_id, name, color, tasks in specs:
        agents[agent_id] = AgentState(
            id=agent_id,
            name=name,
            color=color,
            progress=0,
            status="idle",
            activities=[AgentActivity(label=t, status=ActivityStatus.PENDING) for t in tasks],
            stats=AgentStats(completed=0, in_progress=0, waiting=0),
            spark_data=[0] * 12,
        )
    return agents


class Orchestrator:
  """Gestisce chat inter-agente, decisioni e esecuzione CLI opencode."""

  def __init__(self, ws: WebSocketManager, runner: OpencodeRunner) -> None:
      self.ws = ws
      self.runner = runner
      self.agents = _default_agents()
      self.chat_history: list[ChatMessageOut] = []
      self.pending_commands: dict[str, CommandProposal] = {}
      self.project_progress = 0
      self._running_tasks: dict[str, asyncio.Task] = {}
      self._discussion_lock = asyncio.Lock()
      self.full_auto = settings.full_auto
      self.human_approval = settings.human_approval
      self.autonomy_level = "medium"
      self.last_sync = now_chat_time()
      self.mcp_servers: dict[str, bool] = {
          "Filesystem": False, "Git": False, "SQL": False, "Docker": False,
      }
      self.plugins: dict[str, bool] = {
          "Linter": False, "Formatter": False, "Prettier": False, "ESLint": False,
      }
      self.skills: dict[str, bool] = {
          "ponytail": False,
          "graphify": False,
          "humanizer-it": False,
          "ui-ux-pro-max": False,
          "frontend-design": False,
          "caveman": False,
          "mcp-builder": False,
          "remotion-best-practices": False,
          "customize-opencode": False,
      }

  async def initialize(self) -> None:
      opencode_ok = await self.runner.verify_installation()
      await self.ws.broadcast(
          WsEventType.CONNECTION_STATUS,
          {
            "opencode_installed": opencode_ok,
              "opencode_bin": self.runner.binary,
              "connections": self.ws.connection_count,
          },
      )
      # Auto-sync config OpenCode all'avvio
      try:
          config = get_opencode_config()
          await self.ws.broadcast(WsEventType.SYNC_UPDATE, {
              "config": config,
              "last_sync": self.last_sync,
              "message": "Config OpenCode caricata",
          })
      except Exception as e:
          logger.error("Auto-sync config failed: %s", e)
      await self._broadcast_agents()
      await self._broadcast_chat_snapshot()
      await self._broadcast_settings()

  def _settings_payload(self) -> dict:
      return {
          "full_auto": self.full_auto,
          "human_approval": self.human_approval,
          "autonomy_level": self.autonomy_level,
          "last_sync": self.last_sync,
      }

  async def _broadcast_settings(self) -> None:
      await self.ws.broadcast(WsEventType.SETTINGS_UPDATE, self._settings_payload())

  async def _handle_sync(self) -> None:
      opencode_ok = await self.runner.verify_installation()
      self.last_sync = now_chat_time()
      await self.ws.broadcast(
          WsEventType.CONNECTION_STATUS,
          {
              "opencode_installed": opencode_ok,
              "opencode_bin": self.runner.binary,
              "last_sync": self.last_sync,
              "message": "Sincronizzazione completata",
          },
      )
      await self._broadcast_settings()

  async def handle_message(self, data: dict) -> None:
      event_type = data.get("type", "")
      payload = data.get("payload", {})

      if event_type == WsEventType.PING:
          await self.ws.broadcast(WsEventType.PONG, {"ts": now_time()})
          return

      if event_type == WsEventType.CHAT_MESSAGE:
          await self.on_chat_message(payload.get("sender", "Utente"), payload.get("text", ""), payload.get("recipient", "all"))
          return

      if event_type == WsEventType.START_ORCHESTRATION:
          project_path = payload.get("project_path")
          if project_path:
              settings.project_dir = Path(project_path)
          await self.start_orchestration(payload.get("task", "Avvia orchestrazione del progetto"))
          return

      if event_type == WsEventType.EXECUTE_COMMAND:
          await self.execute_command(
              payload.get("agent_id", "coder"),
              payload.get("command", "run"),
              payload.get("args", []),
              payload.get("cwd"),
              approved=payload.get("approved", False),
          )
          return

      if event_type == WsEventType.APPROVE_COMMAND:
          await self.approve_command(payload.get("proposal_id", ""))
          return

      if event_type == WsEventType.REJECT_COMMAND:
          await self.reject_command(payload.get("proposal_id", ""), payload.get("reason", ""))
          return

      if event_type == WsEventType.UPDATE_SETTINGS:
          if "full_auto" in payload:
              self.full_auto = bool(payload["full_auto"])
          if "human_approval" in payload:
              self.human_approval = bool(payload["human_approval"])
          if "autonomy_level" in payload:
              self.autonomy_level = str(payload["autonomy_level"])
          await self._broadcast_settings()
          return

      if event_type == WsEventType.SYNC_REQUEST:
          await self._handle_sync()
          return

      if event_type == WsEventType.CREATE_AGENT:
          await self._handle_create_agent(payload)
          return

      if event_type == WsEventType.TOGGLE_MCP:
          name = payload.get("name", "")
          enabled = bool(payload.get("enabled", False))
          self.mcp_servers[name] = enabled
          # Deep sync: write to opencode.json
          try:
              sync_mcp_server(name, enabled)
              await self._add_log("System", f"MCP '{name}' {'abilitato' if enabled else 'disabilitato'} in OpenCode")
          except Exception as e:
              logger.error("Deep sync MCP failed: %s", e)
              await self.ws.broadcast(WsEventType.ERROR, {"message": f"Sync MCP fallita: {e}"})
          await self.ws.broadcast(WsEventType.MCP_UPDATE, {name: enabled})
          return

      if event_type == WsEventType.TOGGLE_PLUGIN:
          name = payload.get("name", "")
          enabled = bool(payload.get("enabled", False))
          self.plugins[name] = enabled
          # Deep sync: write to opencode.json
          try:
              sync_plugin(name, enabled)
              await self._add_log("System", f"Plugin '{name}' {'abilitato' if enabled else 'disabilitato'} in OpenCode")
          except Exception as e:
              logger.error("Deep sync plugin failed: %s", e)
              await self.ws.broadcast(WsEventType.ERROR, {"message": f"Sync plugin fallita: {e}"})
          await self.ws.broadcast(WsEventType.PLUGIN_UPDATE, {name: enabled})
          return

      if event_type == WsEventType.TOGGLE_SKILL:
          name = payload.get("name", "")
          enabled = bool(payload.get("enabled", False))
          self.skills[name] = enabled
          try:
              sync_skill(name, enabled)
              await self.ws.broadcast(WsEventType.SKILL_UPDATE, {name: enabled})
              await self._add_log("System", f"Skill '{name}' {'abilitata' if enabled else 'disabilitata'}")
          except Exception as e:
              logger.error("Deep sync skill failed: %s", e)
              await self.ws.broadcast(WsEventType.ERROR, {"message": f"Sync skill fallita: {e}"})
          return

      if event_type == WsEventType.UPDATE_MEMORY:
          key = payload.get("key", "context")
          content = payload.get("content", "")
          try:
              sync_memory(key, content, settings.project_dir)
              await self._add_log("System", f"Memoria '{key}' salvata nel workspace")
          except Exception as e:
              logger.error("Deep sync memory failed: %s", e)
          return

      if event_type == WsEventType.UPDATE_GLOBAL_RULES:
          content = payload.get("content", "")
          try:
              sync_global_rules(content)
              await self._add_log("System", "Regole globali aggiornate in AGENTS.md")
          except Exception as e:
              logger.error("Deep sync global rules failed: %s", e)
          return

      if event_type == WsEventType.GET_MEMORY:
          try:
              project_memory = read_memory("context", settings.project_dir)
              global_rules = read_global_rules()
              global_memory = read_global_memory()
              project_rules = read_project_rules(settings.project_dir)
              await self.ws.broadcast(WsEventType.MEMORY_DATA, {
                  "project_memory": project_memory,
                  "global_rules": global_rules,
                  "global_memory": global_memory,
                  "project_rules": project_rules,
              })
          except Exception as e:
              logger.error("Read memory failed: %s", e)
              await self.ws.broadcast(WsEventType.ERROR, {"message": f"Lettura memoria fallita: {e}"})
          return

      if event_type == WsEventType.UPDATE_GLOBAL_MEMORY:
          content = payload.get("content", "")
          try:
              sync_global_memory(content)
              await self._add_log("System", "Memoria globale aggiornata in MEMORY.md")
          except Exception as e:
              logger.error("Sync global memory failed: %s", e)
          return

      if event_type == WsEventType.UPDATE_PROJECT_RULES:
          content = payload.get("content", "")
          try:
              sync_project_rules(content, settings.project_dir)
              await self._add_log("System", "Regole progetto salvate in docs/project-rules.md")
          except Exception as e:
              logger.error("Sync project rules failed: %s", e)
          return

      if event_type == WsEventType.INTERRUPT_AGENT:
          agent_id = payload.get("agent_id", "")
          await self._interrupt_agent(agent_id)
          return

      if event_type == WsEventType.NEW_PROJECT:
          await self._handle_new_project(payload)
          return

      # ── Nuovi handlers filesystem ──────────────────────────────────

      if event_type == WsEventType.SYNC_FROM_OPENCODE:
          """Legge config reale OpenCode da disco e sincronizza completo stato."""
          logger.info("DEBUG: ===== SYNC_FROM_OPENCODE RICEVUTO DAL FRONTEND =====")
          try:
              # 1. Leggi MCP servers
              mcp_state = get_mcp_servers_state()
              logger.info("DEBUG: MCP state letto da disco: %s", mcp_state)
              self.mcp_servers = mcp_state
              await self.ws.broadcast(WsEventType.MCP_UPDATE, self.mcp_servers)
              logger.info("DEBUG: MCP_UPDATE broadcast inviato")
              
              # 2. Leggi plugins
              plugin_state = get_plugins_state()
              logger.info("DEBUG: Plugin state letto da disco: %s", plugin_state)
              self.plugins = plugin_state
              await self.ws.broadcast(WsEventType.PLUGIN_UPDATE, self.plugins)
              logger.info("DEBUG: PLUGIN_UPDATE broadcast inviato")
              
              # 3. Leggi skills
              skill_state = get_skills_state()
              logger.info("DEBUG: Skill state letto da disco: %s", skill_state)
              self.skills = skill_state
              await self.ws.broadcast(WsEventType.SKILL_UPDATE, self.skills)
              logger.info("DEBUG: SKILL_UPDATE broadcast inviato")
              
              # 4. Leggi agenti, memoria e regole
              config = get_opencode_config()
              logger.info("DEBUG: Config letta: %d agenti, %d skill", len(config["agents"]), len(config["skills"]))
              
              #manda SYNC_UPDATE con la config completa al frontend
              self.last_sync = now_chat_time()
              await self.ws.broadcast(WsEventType.SYNC_UPDATE, {
                  "config": config,
                  "last_sync": self.last_sync,
              })
              logger.info("DEBUG: SYNC_UPDATE broadcast inviato")
              
              # Log successo
              await self._add_log("System", 
                  f"🔄 Sincronizzazione completata: {len(mcp_state)} MCP, "
                  f"{len(plugin_state)} plugin, {len(skill_state)} skill, "
                  f"{len(config['agents'])} agenti")
              logger.info("DEBUG: Sincronizzazione completata con successo")
              
          except Exception as e:
              logger.error("Sync from OpenCode failed: %s", e, exc_info=True)
              await self.ws.broadcast(WsEventType.ERROR, 
                  {"message": f"Errore sincronizzazione OpenCode: {e}"})
          return

      if event_type == WsEventType.GET_PROJECTS_LIST:
          """Scansiona disco e invia lista progetti."""
          projects = get_projects_list()
          await self.ws.broadcast(WsEventType.PROJECTS_LIST, {"projects": projects})
          return

      if event_type == WsEventType.GET_PROJECT_FILES:
          """Elenca file del progetto corrente."""
          files = get_project_files()
          project_name = settings.project_dir.name if settings.project_dir else ""
          project_path = str(settings.project_dir) if settings.project_dir else ""
          await self.ws.broadcast(WsEventType.PROJECT_FILES, {
              "name": project_name,
              "path": project_path,
              "files": files,
          })
          return

      if event_type == WsEventType.SWITCH_PROJECT:
          """Carica progetto da disco. Accetta path completo o nome cartella."""
          project_name = payload.get("name", "")
          logger.info("SWITCH_PROJECT ricevuto: name=%s", project_name)
          if not project_name:
              return
          # Se è un path assoluto, usalo direttamente
          target = Path(project_name)
          if not target.is_absolute():
              # Altrimenti cerca nella parent del progetto corrente
              target = settings.project_dir.parent / project_name
          logger.info("SWITCH_PROJECT target: %s (exists=%s)", target, target.is_dir())
          if not target.is_dir():
              await self.ws.broadcast(WsEventType.ERROR, {"message": f"Cartella non trovata: {target}"})
              return
          state_file = target / "project_state.json"
          settings.project_dir = target
          # Se esiste project_state.json, carica lo stato
          if state_file.exists():
              import json as _json
              data = _json.loads(state_file.read_text(encoding="utf-8"))
              for agent_id, agent_data in data.get("agents", {}).items():
                  if agent_id in self.agents:
                      for k, v in agent_data.items():
                          if k != "id":
                              setattr(self.agents[agent_id], k, v)
              self.project_progress = data.get("project_progress", 0)
              self.chat_history.clear()
              for msg in data.get("chat_history", []):
                  self.chat_history.append(ChatMessageOut(**msg))
              await self._broadcast_agents()
              await self._broadcast_chat_snapshot()
          # Invia sempre i file del progetto
          files = get_project_files(target)
          await self.ws.broadcast(WsEventType.PROJECT_FILES, {
              "name": target.name,
              "path": str(target),
              "files": files,
          })
          await self.ws.broadcast(WsEventType.SAVE_PROJECT_ACK, {"path": str(target)})
          await self.on_chat_message("System", f"Progetto aperto: {target.name} ({len(files)} elementi)")
          return

      if event_type == WsEventType.SAVE_PROJECT:
          """Salva stato su disco con dati dal frontend."""
          data = payload.get("data", {})
          await self._handle_save_project(data if data else None)
          return

      await self.ws.broadcast(WsEventType.ERROR, {"message": f"Evento sconosciuto: {event_type}"})

  async def on_chat_message(self, sender: str, text: str, recipient: str = "all", *, process_actions: bool = True) -> None:
      text = text.strip()
      if not text:
          return

      msg = ChatMessageOut(
          id=str(uuid.uuid4()),
          sender=sender,
          sender_color=settings.agent_colors.get(sender, "#8a96b4"),
          text=text,
          time=now_chat_time(),
          recipient=recipient,
      )
      self.chat_history.append(msg)
      await self.ws.broadcast(WsEventType.CHAT_BROADCAST, msg.model_dump())

      # Comando diretto utente: /run <messaggio>
      user_run = USER_RUN_PREFIX.match(text)
      if sender == "Utente" and user_run:
          target_id = recipient if recipient and recipient != "all" else "coder"
          target_name = target_id.capitalize()
          await self._propose_or_run(target_id, target_name, user_run.group(1).strip(), reason=f"Comando diretto utente → {target_id}")
          return

      # Comando diretto /goal, /caveman, ecc.
      user_cmd = USER_COMMAND_PREFIX.match(text)
      if sender == "Utente" and user_cmd:
          cmd_name = user_cmd.group(1)
          cmd_args = user_cmd.group(2) or ""
          target_id = recipient if recipient and recipient != "all" else "coder"
          target_name = target_id.capitalize()
          await self._propose_or_run(target_id, target_name, f"{cmd_name} {cmd_args}".strip(), reason=f"Comando /{cmd_name} → {target_id}")
          return

      if sender == "Utente":
          # Se il destinatario è un agente specifico, esegui solo con quello
          target_agent = None
          if recipient and recipient != "all":
              target_agent = self._find_agent_by_name(recipient) or self.agents.get(recipient)
          
          if target_agent:
              await self._run_single_agent(target_agent, text)
          else:
              await self._agent_discussion(text)
          return

      # Messaggio di un agente: verifica se contiene un'azione
      if process_actions:
          action = self._extract_action(text)
          if action:
              agent = self._find_agent_by_name(sender)
              agent_id = agent.id if agent else "coder"
              await self._propose_or_run(agent_id, sender, action, reason=f"Decisione agente {sender}")

  async def start_orchestration(self, task: str) -> None:
      await self.on_chat_message("Manager", f"Nuovo task di progetto: {task}")
      await self._agent_discussion(task)

  async def _agent_discussion(self, user_task: str) -> None:
      async with self._discussion_lock:
          # Usa il COORDINATORE come agente principale
          # Il coordinatore delegherà internamente agli specialisti (coder, tester, ecc.)
          # grazie alle sue regole in agents/coordinatore.md
          agent_id = "coordinator"
          agent_name = "Coordinator"
          agent = self.agents.get(agent_id)
          if not agent:
              # Fallback: crea il coordinator se non esiste
              agent = AgentState(
                  id=agent_id, name=agent_name, color="#f97316",
                  status="idle", activities=[], stats=AgentStats(),
                  spark_data=[0]*12,
              )
              self.agents[agent_id] = agent

          # Aggiorna activities per mostrare lavoro in corso
          agent.activities = [
              AgentActivity(label=f"Pianificazione: {user_task[:60]}...", status=ActivityStatus.RUNNING),
              AgentActivity(label="Delega agli specialisti...", status=ActivityStatus.PENDING),
          ]
          agent.status = "working"
          agent.progress = 5
          agent.stats.in_progress += 1
          await self._broadcast_agents()

          await self.on_chat_message("System", f"🤖 Coordinator sta elaborando: {user_task}", process_actions=False)

          # Eseguire con opencode run --agent coordinator
          # Il coordinator carica le sue regole e delega internamente
          output_lines: list[str] = []

          async def collect_output(aid: str, stream: str, line: str) -> None:
              output_lines.append(line)
              await self.ws.broadcast(
                  WsEventType.TERMINAL_OUTPUT,
                  {"agent_id": aid, "stream": stream, "line": line, "time": now_time()},
              )
              await self._add_log(agent_name, line, stream=stream, agent_id=aid)
              # Aggiorna activity con ultimo output
              if output_lines:
                  agent.activities[0].label = f"Elaborando: {line[:60]}"
                  await self._broadcast_agents()

          try:
              exit_code = await self.runner.run_message(
                  agent_id, user_task, cwd=settings.project_dir, on_output=collect_output,
                  opencode_agent="coordinator", auto_approve=self.full_auto,
              )
          except Exception as exc:
              logger.exception("Agent execution failed")
              agent.status = "error"
              agent.activities = [AgentActivity(label=f"Errore: {exc}", status=ActivityStatus.ERROR)]
              agent.stats.in_progress = max(0, agent.stats.in_progress - 1)
              await self._broadcast_agents()
              await self.on_chat_message("System", f"❌ Errore: {exc}", process_actions=False)
              return

          # Aggiorna activities con risultato
          if exit_code == 0:
              agent.activities = [
                  AgentActivity(label=f"Task completato: {user_task[:50]}", status=ActivityStatus.OK),
                  AgentActivity(label=f"Output: {len(output_lines)} righe", status=ActivityStatus.OK),
              ]
              agent.status = "operational"
              agent.progress = min(100, agent.progress + 25)
              agent.stats.completed += 1
              agent.stats.in_progress = max(0, agent.stats.in_progress - 1)
              if agent.spark_data:
                  agent.spark_data = agent.spark_data[1:] + [agent.progress]
          else:
              agent.activities = [
                  AgentActivity(label=f"Task fallito (exit {exit_code})", status=ActivityStatus.ERROR),
              ]
              agent.status = "error"
              agent.stats.in_progress = max(0, agent.stats.in_progress - 1)
              agent.stats.waiting += 1

          # Mandare risultato in chat
          status_text = "✅ completato" if exit_code == 0 else f"❌ fallito (exit {exit_code})"
          result_text = "\n".join(output_lines[-15:]) if output_lines else "(nessun output)"
          await self.on_chat_message(
              agent_name,
              f"Task {status_text}: {user_task}\n\n{result_text}",
              process_actions=False,
          )

          await self._broadcast_agents()

  async def _run_single_agent(self, agent: AgentState, user_task: str) -> None:
      """Esegue un task con un agente specifico, caricando le sue regole OpenCode."""
      agent_id = agent.id
      agent_name = agent.name

      # Aggiorna activities per mostrare lavoro in corso
      agent.activities = [
          AgentActivity(label=f"Elaborando: {user_task[:60]}...", status=ActivityStatus.RUNNING),
      ]
      agent.status = "working"
      agent.progress = max(5, agent.progress)
      agent.stats.in_progress += 1
      await self._broadcast_agents()

      await self.on_chat_message("System", f"🤖 {agent_name} sta elaborando: {user_task}", process_actions=False)

      # Eseguire con opencode run --agent <agent_id>
      output_lines: list[str] = []

      async def collect_output(aid: str, stream: str, line: str) -> None:
          output_lines.append(line)
          await self.ws.broadcast(
              WsEventType.TERMINAL_OUTPUT,
              {"agent_id": aid, "stream": stream, "line": line, "time": now_time()},
          )
          await self._add_log(agent_name, line, stream=stream, agent_id=aid)
          if output_lines:
              agent.activities[0].label = f"Elaborando: {line[:60]}"
              await self._broadcast_agents()

          try:
              exit_code = await self.runner.run_message(
                  agent_id, user_task, cwd=settings.project_dir, on_output=collect_output,
                  opencode_agent=agent_id, auto_approve=self.full_auto,
              )
          except Exception as exc:
              logger.exception("Agent execution failed")
              agent.status = "error"
              agent.activities = [AgentActivity(label=f"Errore: {exc}", status=ActivityStatus.ERROR)]
              agent.stats.in_progress = max(0, agent.stats.in_progress - 1)
              await self._broadcast_agents()
              await self.on_chat_message("System", f"❌ Errore {agent_name}: {exc}", process_actions=False)
              return

      # Aggiorna stato
      if exit_code == 0:
          agent.activities = [
              AgentActivity(label=f"Task completato: {user_task[:50]}", status=ActivityStatus.OK),
          ]
          agent.status = "operational"
          agent.progress = min(100, agent.progress + 25)
          agent.stats.completed += 1
          agent.stats.in_progress = max(0, agent.stats.in_progress - 1)
          if agent.spark_data:
              agent.spark_data = agent.spark_data[1:] + [agent.progress]
      else:
          agent.activities = [
              AgentActivity(label=f"Task fallito (exit {exit_code})", status=ActivityStatus.ERROR),
          ]
          agent.status = "error"
          agent.stats.in_progress = max(0, agent.stats.in_progress - 1)
          agent.stats.waiting += 1

      status_text = "✅ completato" if exit_code == 0 else f"❌ fallito (exit {exit_code})"
      result_text = "\n".join(output_lines[-15:]) if output_lines else "(nessun output)"
      await self.on_chat_message(
          agent_name,
          f"Task {status_text}: {user_task}\n\n{result_text}",
          process_actions=False,
      )
      await self._broadcast_agents()

  def _extract_action(self, text: str) -> str | None:
      for pattern in ACTION_PATTERNS:
          match = pattern.search(text)
          if match:
              action = match.group(1).strip().strip("`\"'")
              if action.lower().startswith("opencode run"):
                  action = action[len("opencode run") :].strip()
              return action
      return None

  def _find_agent_by_name(self, name: str) -> AgentState | None:
      for agent in self.agents.values():
          if agent.name.lower() == name.lower():
              return agent
      return None

  async def _propose_or_run(self, agent_id: str, agent_name: str, message: str, reason: str) -> None:
      proposal = CommandProposal(
          id=str(uuid.uuid4()),
          agent_id=agent_id,
          agent_name=agent_name,
          command="run",
          args=[message],
          reason=reason,
      )

      needs_approval = self.human_approval and not self.full_auto

      if needs_approval:
          self.pending_commands[proposal.id] = proposal
          await self.ws.broadcast(WsEventType.COMMAND_PROPOSAL, proposal.model_dump())
          await self.on_chat_message("System", f"In attesa approvazione per: opencode run \"{message[:80]}\"")
          return

      await self.execute_command(agent_id, "run", [message], approved=True)

  async def approve_command(self, proposal_id: str) -> None:
      proposal = self.pending_commands.pop(proposal_id, None)
      if not proposal:
          return
      await self.execute_command(proposal.agent_id, proposal.command, proposal.args, approved=True)

  async def reject_command(self, proposal_id: str, reason: str) -> None:
      proposal = self.pending_commands.pop(proposal_id, None)
      if proposal:
          await self.on_chat_message("Utente", f"Comando rifiutato: {reason or 'nessuna spiegazione'}")

  async def _interrupt_agent(self, agent_id: str) -> None:
      task = self._running_tasks.get(agent_id)
      if task and not task.done():
          task.cancel()
          agent = self.agents.get(agent_id)
          name = agent.name if agent else agent_id
          await self._set_agent_status(agent_id, "idle")
          await self._add_log(name, "⛔ Lavoro interrotto dall'utente", agent_id=agent_id)
          await self.ws.broadcast(
              WsEventType.COMMAND_STATUS,
              {"agent_id": agent_id, "status": "interrupted"},
          )
      else:
          await self.ws.broadcast(
              WsEventType.ERROR,
              {"agent_id": agent_id, "message": "Nessun lavoro in corso da interrompere"},
          )
          await self.on_chat_message("Utente", f"Comando rifiutato: {reason or 'nessuna spiegazione'}")

  async def execute_command(
      self,
      agent_id: str,
      command: str,
      args: list[str],
      cwd: str | None = None,
      approved: bool = False,
  ) -> None:
      if self.human_approval and not self.full_auto and not approved:
          await self.ws.broadcast(WsEventType.ERROR, {"message": "Comando richiede approvazione"})
          return

      agent = self.agents.get(agent_id)
      agent_name = agent.name if agent else agent_id
      work_dir = Path(cwd) if cwd else settings.project_dir

      cmd_display = f"opencode {command} {' '.join(args)}"
      await self.ws.broadcast(
          WsEventType.COMMAND_STATUS,
          {"agent_id": agent_id, "status": "running", "command": cmd_display},
      )
      await self._set_agent_status(agent_id, "working")
      await self._add_log(agent_name, f"Esecuzione: {cmd_display}", agent_id=agent_id)

      async def on_output(aid: str, stream: str, line: str) -> None:
          await self.ws.broadcast(
              WsEventType.TERMINAL_OUTPUT,
              {"agent_id": aid, "stream": stream, "line": line, "time": now_time()},
          )
          await self._add_log(agent_name, line, stream=stream, agent_id=aid)
          await self._bump_progress(agent_id)

      task = asyncio.create_task(self._run_and_finalize(agent_id, command, args, work_dir, on_output))
      # Cancel any prior task for same agent
      old = self._running_tasks.get(agent_id)
      if old and not old.done():
          old.cancel()
      self._running_tasks[agent_id] = task
      task.add_done_callback(lambda t: self._running_tasks.pop(agent_id, None))

  async def _run_and_finalize(
      self,
      agent_id: str,
      command: str,
      args: list[str],
      work_dir: Path,
      on_output,
  ) -> None:
      agent = self.agents.get(agent_id)
      agent_name = agent.name if agent else agent_id

      try:
          if command == "run" and args:
              message = args[0]
              extra = args[1:] if len(args) > 1 else None
              exit_code = await self.runner.run_message(agent_id, message, cwd=work_dir, extra_args=extra, on_output=on_output, opencode_agent=agent_id, auto_approve=self.full_auto)
          else:
              exit_code = await self.runner.run(agent_id, [command, *args], cwd=work_dir, on_output=on_output)
      except asyncio.CancelledError:
          await self._set_agent_status(agent_id, "idle")
          await self._add_log(agent_name, "⏹️ Comando cancellato", agent_id=agent_id)
          return
      except Exception as exc:
          logger.exception("Command failed")
          await self.ws.broadcast(WsEventType.ERROR, {"message": str(exc), "agent_id": agent_id})
          await self._set_agent_status(agent_id, "error")
          return

      status = "completed" if exit_code == 0 else "error"
      await self.ws.broadcast(
          WsEventType.COMMAND_STATUS,
          {"agent_id": agent_id, "status": status, "exit_code": exit_code},
      )

      if exit_code == 0:
          await self._set_agent_status(agent_id, "operational")
          await self._mark_activity_ok(agent_id)
          self.project_progress = min(100, self.project_progress + 8)
      else:
          await self._set_agent_status(agent_id, "error")
          await self._mark_activity_error(agent_id)

      await self._broadcast_agents()
      await self.on_chat_message(agent_name, f"Comando completato (exit {exit_code}).")

  async def _set_agent_status(self, agent_id: str, status: str) -> None:
      agent = self.agents.get(agent_id)
      if agent:
          agent.status = status  # type: ignore[assignment]
          await self.ws.broadcast(
              WsEventType.AGENT_UPDATE,
              {"agent_id": agent_id, **agent.model_dump()},
          )

  async def _bump_progress(self, agent_id: str) -> None:
      agent = self.agents.get(agent_id)
      if agent and agent.progress < 95:
          agent.progress = min(95, agent.progress + 3)
          if agent.spark_data:
              agent.spark_data = agent.spark_data[1:] + [agent.progress]
          agent.stats.in_progress = max(1, agent.stats.in_progress)
          await self.ws.broadcast(
              WsEventType.AGENT_UPDATE,
              {"agent_id": agent_id, **agent.model_dump()},
          )

  async def _mark_activity_ok(self, agent_id: str) -> None:
      agent = self.agents.get(agent_id)
      if not agent:
          return
      for act in agent.activities:
          if act.status in (ActivityStatus.PENDING, ActivityStatus.RUNNING):
              act.status = ActivityStatus.OK
              agent.stats.completed += 1
              agent.stats.in_progress = max(0, agent.stats.in_progress - 1)
              agent.stats.waiting = max(0, agent.stats.waiting - 1)
              agent.progress = min(100, agent.progress + 15)
              break

  async def _mark_activity_error(self, agent_id: str) -> None:
      agent = self.agents.get(agent_id)
      if not agent:
          return
      for act in agent.activities:
          if act.status in (ActivityStatus.PENDING, ActivityStatus.RUNNING):
              act.status = ActivityStatus.ERROR
              break

  async def _add_log(self, agent_name: str, message: str, stream: str = "stdout", agent_id: str | None = None) -> None:
      color = settings.agent_colors.get(agent_name, "#8a96b4")
      prefix = "[stderr] " if stream == "stderr" else ""
      await self.ws.broadcast(
          WsEventType.LOG_ENTRY,
          {
              "time": now_time(),
              "agent": agent_name,
              "color": color,
              "msg": f"{prefix}{message}",
              "agent_id": agent_id,
          },
      )

  async def _broadcast_agents(self) -> None:
      for agent_id, agent in self.agents.items():
          await self.ws.broadcast(
              WsEventType.AGENT_UPDATE,
              {"agent_id": agent_id, **agent.model_dump()},
          )

  async def _broadcast_chat_snapshot(self) -> None:
      for msg in self.chat_history:
          await self.ws.broadcast(WsEventType.CHAT_BROADCAST, msg.model_dump())

  async def _handle_new_project(self, payload: dict | None = None) -> None:
      """Reset orchestrator state for a fresh workspace + crea cartella."""
      import datetime as _dt

      self.agents = _default_agents()
      self.chat_history.clear()
      self.pending_commands.clear()
      self.project_progress = 0

      # Crea cartella progetto
      name = (payload or {}).get("name", "").strip()
      base_path = (payload or {}).get("path", "").strip()
      
      if base_path:
          base = Path(base_path)
      else:
          base = settings.project_dir.parent
      
      project_name = name if name else f"project_{_dt.datetime.now().strftime('%Y%m%d_%H%M%S')}"
      new_dir = base / project_name
      new_dir.mkdir(parents=True, exist_ok=True)
      (new_dir / ".opencode").mkdir(exist_ok=True)
      settings.project_dir = new_dir

      await self.ws.broadcast(WsEventType.NEW_PROJECT_RESET, {"project_dir": str(new_dir)})
      await self._broadcast_agents()
      await self.on_chat_message("System", f"Nuovo progetto creato: {new_dir.name}")

  async def _handle_save_project(self, data: dict | None = None) -> None:
      """Save current state to project_state.json (usa dati payload o stato interno)."""
      if data is None:
          data = {
              "agents": {k: v.model_dump() for k, v in self.agents.items()},
              "chat_history": [m.model_dump() for m in self.chat_history],
              "project_progress": self.project_progress,
              "settings": self._settings_payload(),
          }
      path = save_project_state(data)
      await self.ws.broadcast(WsEventType.SAVE_PROJECT_ACK, {"path": str(path)})
      await self.on_chat_message("System", f"Progetto salvato: {path.name}")

  async def _handle_create_agent(self, payload: dict) -> None:
      """Create a new agent dynamically and broadcast to all clients."""
      name = payload.get("name", "").strip()
      role = payload.get("role", "").strip()
      task = payload.get("task", "").strip()

      if not name:
          await self.ws.broadcast(WsEventType.ERROR, {"message": "Nome agente mancante"})
          return

      agent_id = name.lower().replace(" ", "_")
      colors = ["#06b6d4", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444"]
      color = colors[len(self.agents) % len(colors)]

      agent = AgentState(
          id=agent_id,
          name=name,
          color=color,
          progress=0,
          status="idle",
          activities=[AgentActivity(label=role or "In attesa", status=ActivityStatus.PENDING)],
          stats=AgentStats(completed=0, in_progress=0, waiting=1),
          spark_data=[0] * 12,
      )
      self.agents[agent_id] = agent

      # Deep sync: write agent .md file to OpenCode config
      try:
          sync_agent(agent_id, name, role, task, color)
          await self._add_log("System", f"Agente '{name}' sincronizzato con OpenCode")
      except Exception as e:
          logger.error("Deep sync agent failed: %s", e)

      await self.ws.broadcast(
          WsEventType.AGENT_CREATED,
          {"agent_id": agent_id, **agent.model_dump()},
      )
      await self._broadcast_agents()

      if task:
          await self.on_chat_message("System", f"Nuovo agente '{name}' creato. Task: {task}")
      else:
          await self.on_chat_message("System", f"Nuovo agente '{name}' creato. Ruolo: {role}")

  async def broadcast_metrics_loop(self, stop_event: asyncio.Event) -> None:
      while not stop_event.is_set():
          from metrics import collect_metrics

          # Calcola progresso dalla media degli agenti
          if self.agents:
              self.project_progress = int(
                  sum(a.progress for a in self.agents.values()) / len(self.agents)
              )

          metrics = collect_metrics(self.project_progress)
          await self.ws.broadcast(WsEventType.SYSTEM_METRICS, metrics.model_dump())
          try:
              await asyncio.wait_for(stop_event.wait(), timeout=settings.metrics_interval_sec)
          except asyncio.TimeoutError:
              continue
