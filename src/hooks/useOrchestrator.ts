import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AgentState,
  AppSettings,
  AutonomyLevel,
  ChatMessage,
  CommandProposal,
  LogEntry,
  OpenCodeConfig,
  OrchestratorState,
  ProjectInfo,
  SystemMetrics,
} from '../types/orchestrator';
import { WS_EVENT } from '../types/orchestrator';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/ws';
const MAX_LOGS = 200;

const DEFAULT_SKILLS = [
  'ponytail', 'graphify', 'humanizer-it', 'ui-ux-pro-max',
  'frontend-design', 'caveman', 'mcp-builder', 'remotion-best-practices', 'customize-opencode',
] as const;

const defaultSettings: AppSettings = {
  full_auto: true,
  human_approval: false,
  autonomy_level: 'medium',
  last_sync: '--:--',
};

const defaultMetrics: SystemMetrics = {
  cpu_percent: 23,
  memory_percent: 31,
  memory_used_gb: 3.23,
  memory_total_gb: 16,
  tokens_per_min: 0,
  api_calls: 0,
  project_progress: 55,
};

function generateSummaryReport(payload: Record<string, unknown>): string {
  const agentId = String(payload.agent_id ?? 'sconosciuto');
  const status = String(payload.status ?? 'unknown');
  const exitCode = payload.exit_code ?? -1;
  const command = String(payload.command ?? 'opencode run');
  
  const statusLabel = exitCode === 0 ? '✅ SUCCESSO' : '❌ FALLITO';
  const severity = exitCode === 0 ? 'Nessuna' : 'Alta - Richiede analisi';
  
  return [
    '═══════════════════════════════════════',
    '📋 REPORT ESECUZIONE COMANDO',
    '═══════════════════════════════════════',
    `🎯 Obiettivo: ${command}`,
    `🤖 Agente: ${agentId}`,
    `📊 Risultato: ${statusLabel} (exit code: ${exitCode})`,
    `⚠️ Criticità: ${severity}`,
    status === 'completed' && exitCode === 0 
      ? '✓ Task completato correttamente. Output disponibile nei log.'
      : '✗ Task fallito. Controlla terminal_output per dettagli errore.',
    '═══════════════════════════════════════',
    `⏱ ${new Date().toLocaleTimeString('it-IT')}`,
  ].join('\n');
}

export function useOrchestrator() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<OrchestratorState>({
    connected: false,
    opencodeInstalled: false,
    opencodeBin: 'opencode',
    settings: defaultSettings,
    agents: {},
    messages: [],
    logs: [],
    metrics: null,
    pendingProposal: null,
    lastError: null,
    mcpServers: {
      Filesystem: false,
      Git: false,
      SQL: false,
      Docker: false,
    },
    plugins: {
      Linter: false,
      Formatter: false,
      Prettier: false,
      ESLint: false,
    },
    skills: Object.fromEntries(DEFAULT_SKILLS.map((k) => [k, false])),
    projects: [],
    opencodeConfig: null,
    projectInfo: null,
    projectMemory: '# Memoria del Progetto\n\nCaricamento...',
    globalRules: '# Regole Globali\n\nCaricamento...',
    globalMemory: '# Memoria Globale\n\nCaricamento...',
    projectRules: '# Regole del Progetto\n\nCaricamento...',
  });

  const send = useCallback((type: string, payload: Record<string, unknown> = {}) => {
    console.log('[SEND]', type, payload, 'WS state:', wsRef.current?.readyState);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify({ type, payload });
      console.log('[SEND] Inviando:', msg);
      wsRef.current.send(msg);
      return true;
    }
    console.log('[SEND] ERROR: WebSocket non OPEN (readyState =', wsRef.current?.readyState, ')');
    setState((s) => ({ ...s, lastError: 'Backend non connesso' }));
    return false;
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setState((s) => ({ ...s, connected: true, lastError: null }));
      ws.send(JSON.stringify({ type: WS_EVENT.PING, payload: {} }));
      // Auto-sync con OpenCode all'avvio
      ws.send(JSON.stringify({ type: WS_EVENT.SYNC_FROM_OPENCODE, payload: {} }));
    };

    ws.onclose = () => {
      setState((s) => ({ ...s, connected: false }));
      reconnectRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      setState((s) => ({ ...s, lastError: 'Errore connessione WebSocket' }));
      ws.close();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as { type: string; payload: Record<string, unknown> };
      const { type, payload } = data;
      console.log('[WS]', type, payload);

      switch (type) {
        case 'connection_status':
          setState((s) => ({
            ...s,
            opencodeInstalled: Boolean(payload.opencode_installed),
            opencodeBin: String(payload.opencode_bin ?? s.opencodeBin),
            settings: payload.last_sync
              ? { ...s.settings, last_sync: String(payload.last_sync) }
              : s.settings,
            lastError: null,
          }));
          break;

        case 'settings_update':
          setState((s) => ({
            ...s,
            settings: {
              full_auto: Boolean(payload.full_auto ?? s.settings.full_auto),
              human_approval: Boolean(payload.human_approval ?? s.settings.human_approval),
              autonomy_level: (payload.autonomy_level as AutonomyLevel) ?? s.settings.autonomy_level,
              last_sync: String(payload.last_sync ?? s.settings.last_sync),
            },
          }));
          break;

        case 'chat_broadcast':
          setState((s) => ({
            ...s,
            messages: [...s.messages, payload as unknown as ChatMessage],
          }));
          break;

        case 'agent_update': {
          const agent = payload as unknown as AgentState & { agent_id: string };
          const { agent_id, ...rest } = agent;
          setState((s) => ({
            ...s,
            agents: { ...s.agents, [agent_id]: { ...rest, id: agent_id } as AgentState },
          }));
          break;
        }

        case 'log_entry':
          setState((s) => ({
            ...s,
            logs: [...s.logs, { ...payload, agent_id: payload.agent_id } as unknown as LogEntry].slice(-MAX_LOGS),
          }));
          break;

        case 'terminal_output': {
          setState((s) => {
            const agentId = String(payload.agent_id ?? 'System');
            const agentColor = s.agents[agentId]?.color ?? '#8a96b4';
            const agentName = s.agents[agentId]?.name ?? agentId;
            return {
              ...s,
              logs: [
                ...s.logs,
                {
                  time: String(payload.time ?? ''),
                  agent: agentName,
                  color: agentColor,
                  msg: String(payload.line ?? ''),
                  agent_id: agentId,
                },
              ].slice(-MAX_LOGS),
            };
          });
          break;
        }

        case 'system_metrics':
          setState((s) => ({
            ...s,
            metrics: payload as unknown as SystemMetrics,
          }));
          break;

        case 'command_proposal':
          setState((s) => ({
            ...s,
            pendingProposal: payload as unknown as CommandProposal,
          }));
          break;

        case 'command_status':
          if (payload.status === 'completed' || payload.status === 'error') {
            const report = generateSummaryReport(payload);
            setState((s) => ({
              ...s,
              pendingProposal: null,
              logs: [
                ...s.logs,
                {
                  time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                  agent: 'System',
                  color: '#f97316',
                  msg: report,
                  agent_id: 'system-report',
                },
              ].slice(-MAX_LOGS),
            }));
          }
          break;

        case 'new_project_reset':
          setState((s) => ({
            ...s,
            agents: {},
            messages: [],
            logs: [],
            metrics: { ...s.metrics!, project_progress: 0 },
            pendingProposal: null,
            lastError: null,
          }));
          break;

        case 'sync_update':
          setState((s) => ({
            ...s,
            opencodeConfig: payload.config as OpenCodeConfig,
            settings: payload.last_sync
              ? { ...s.settings, last_sync: String(payload.last_sync) }
              : s.settings,
            lastError: null,
          }));
          break;

        case 'projects_list':
          setState((s) => ({
            ...s,
            projects: (payload.projects as string[]) ?? [],
          }));
          break;

        case 'project_files':
          console.log('DEBUG_FILES:', payload);
          setState((s) => ({
            ...s,
            projectInfo: {
              name: String(payload.name ?? ''),
              path: String(payload.path ?? ''),
              files: (payload.files as ProjectInfo['files']) ?? [],
            },
          }));
          break;

        case 'memory_data':
          setState((s) => ({
            ...s,
            projectMemory: String(payload.project_memory ?? s.projectMemory),
            globalRules: String(payload.global_rules ?? s.globalRules),
            globalMemory: String(payload.global_memory ?? s.globalMemory),
            projectRules: String(payload.project_rules ?? s.projectRules),
          }));
          break;

        case 'save_project_ack':
          console.log('Project saved:', payload.path);
          break;

        case 'agent_created': {
          const agent = payload as unknown as AgentState & { agent_id: string };
          const { agent_id, ...rest } = agent;
          setState((s) => ({
            ...s,
            agents: { ...s.agents, [agent_id]: { ...rest, id: agent_id } as AgentState },
          }));
          break;
        }

        case 'mcp_update':
          console.log('DEBUG: Received MCP_UPDATE:', payload);
          setState((s) => ({
            ...s,
            mcpServers: { ...s.mcpServers, ...payload as Record<string, boolean> },
          }));
          break;

        case 'plugin_update':
          console.log('DEBUG: Received PLUGIN_UPDATE:', payload);
          setState((s) => ({
            ...s,
            plugins: { ...s.plugins, ...payload as Record<string, boolean> },
          }));
          break;

        case 'skill_update':
          console.log('DEBUG: Received SKILL_UPDATE:', payload);
          setState((s) => ({
            ...s,
            skills: { ...s.skills, ...payload as Record<string, boolean> },
          }));
          break;

        case 'error':
          setState((s) => ({
            ...s,
            lastError: String(payload.message ?? 'Errore sconosciuto'),
          }));
          break;

        default:
          break;
      }
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendChat = useCallback(
    (text: string, recipient = 'all') => {
      return send(WS_EVENT.CHAT_MESSAGE, { sender: 'Utente', text, recipient });
    },
    [send],
  );

  const startOrchestration = useCallback(
    (task: string) => send(WS_EVENT.START_ORCHESTRATION, { task }),
    [send],
  );

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      setState((s) => ({
        ...s,
        settings: { ...s.settings, ...patch },
      }));
      return send(WS_EVENT.UPDATE_SETTINGS, patch as Record<string, unknown>);
    },
    [send],
  );

  const newProject = useCallback(() => send(WS_EVENT.NEW_PROJECT, {}), [send]);

  const loadMemory = useCallback(
    () => send(WS_EVENT.GET_MEMORY, {}),
    [send],
  );

  const saveMemory = useCallback(
    (content: string) => send(WS_EVENT.UPDATE_MEMORY, { key: 'context', content }),
    [send],
  );

  const saveGlobalRules = useCallback(
    (content: string) => send(WS_EVENT.UPDATE_GLOBAL_RULES, { content }),
    [send],
  );

  const saveGlobalMemory = useCallback(
    (content: string) => send(WS_EVENT.UPDATE_GLOBAL_MEMORY, { content }),
    [send],
  );

  const saveProjectRules = useCallback(
    (content: string) => send(WS_EVENT.UPDATE_PROJECT_RULES, { content }),
    [send],
  );

  const interruptAgent = useCallback(
    (agentId: string) => send(WS_EVENT.INTERRUPT_AGENT, { agent_id: agentId }),
    [send],
  );

  const saveProject = useCallback(() => {
    setState((s) => {
      const payload: Record<string, unknown> = {
        agents: s.agents,
        chat_history: s.messages,
        project_progress: s.metrics?.project_progress ?? 0,
        settings: s.settings,
      };
      // Invio diretto via ref per evitare stale closure
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: WS_EVENT.SAVE_PROJECT, payload: { data: payload } }));
      }
      return s;
    });
  }, []);

  const createNewProject = useCallback(() => send(WS_EVENT.NEW_PROJECT, {}), [send]);

  const syncFromOpencode = useCallback(
    () => send(WS_EVENT.SYNC_FROM_OPENCODE, {}),
    [send],
  );

  const getProjectsList = useCallback(
    () => send(WS_EVENT.GET_PROJECTS_LIST, {}),
    [send],
  );

  const switchProject = useCallback(
    (name: string) => send(WS_EVENT.SWITCH_PROJECT, { name }),
    [send],
  );

  const getProjectFiles = useCallback(
    () => send(WS_EVENT.GET_PROJECT_FILES, {}),
    [send],
  );

  const executeCommand = useCallback(
    (agent_id: string, command: string, args: string[] = [], approved = false) =>
      send(WS_EVENT.EXECUTE_COMMAND, { agent_id, command, args, approved }),
    [send],
  );

  const createAgent = useCallback(
    (name: string, role: string, task: string) =>
      send(WS_EVENT.CREATE_AGENT, { name, role, task }),
    [send],
  );

  const toggleMcp = useCallback(
    (name: string, enabled: boolean) => send(WS_EVENT.TOGGLE_MCP, { name, enabled }),
    [send],
  );

  const togglePlugin = useCallback(
    (name: string, enabled: boolean) => send(WS_EVENT.TOGGLE_PLUGIN, { name, enabled }),
    [send],
  );

  const toggleSkill = useCallback(
    (name: string, enabled: boolean) => send(WS_EVENT.TOGGLE_SKILL, { name, enabled }),
    [send],
  );

  const requestSync = useCallback(() => send(WS_EVENT.SYNC_REQUEST, {}), [send]);

  const approveCommand = useCallback(
    (proposalId: string) => send(WS_EVENT.APPROVE_COMMAND, { proposal_id: proposalId }),
    [send],
  );

  const rejectCommand = useCallback(
    (proposalId: string, reason: string) =>
      send(WS_EVENT.REJECT_COMMAND, { proposal_id: proposalId, reason }),
    [send],
  );

  const agentsList = Object.values(state.agents).sort((a, b) => a.name.localeCompare(b.name));

  const recentActivities = state.logs
    .slice(-5)
    .reverse()
    .map((l) => ({
      agent: l.agent,
      action: l.msg,
      time: l.time,
      color: l.color,
    }));

  return {
    ...state,
    agentsList,
    metrics: state.metrics ?? defaultMetrics,
    recentActivities,
    mcpServers: state.mcpServers,
    plugins: state.plugins,
    skills: state.skills,
    projects: state.projects,
    opencodeConfig: state.opencodeConfig,
    projectInfo: state.projectInfo,
    toggleMcp,
    togglePlugin,
    toggleSkill,
    sendChat,
    startOrchestration,
    updateSettings,
    requestSync,
    syncFromOpencode,
    getProjectsList,
    switchProject,
    getProjectFiles,
    approveCommand,
    rejectCommand,
    newProject,
    loadMemory,
    saveMemory,
    saveGlobalRules,
    saveGlobalMemory,
    saveProjectRules,
    interruptAgent,
    saveProject,
    createNewProject,
    executeCommand,
    createAgent,
    send,
  };
}
