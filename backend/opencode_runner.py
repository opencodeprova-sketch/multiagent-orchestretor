import asyncio
import json
import logging
import shutil
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Awaitable, Callable

from config import settings

logger = logging.getLogger(__name__)

CREATE_NO_WINDOW = 0x08000000 if sys.platform == "win32" else 0

BLOCKED_PATTERNS = ["..", "C:\\", "/etc/", "/usr/", "rm -rf", "del /s", "shutdown", "reboot"]


def _validate_command(args: list[str]) -> None:
    """Valida che il comando non contenga pattern pericolosi."""
    if not args:
        raise ValueError("Comando vuoto")
    full_cmd = " ".join(args).lower()
    for pattern in BLOCKED_PATTERNS:
        if pattern in full_cmd:
            raise ValueError(f"Pattern bloccato rilevato: {pattern}")

def get_opencode_config() -> dict[str, Any]:
    """Legge config reale OpenCode da ~/.config/opencode/.

    Restituisce dict con agenti, skill, regole globali, MCP e plugin.
    """
    config_dir = Path.home() / ".config" / "opencode"
    result: dict[str, Any] = {
        "agents": {},
        "skills": {},
        "commands": {},
        "rules": "",
        "mcp_servers": {},
        "plugins": [],
        "raw_config": {},
    }

    # 1. opencode.json
    opencode_json = config_dir / "opencode.json"
    if opencode_json.exists():
        try:
            raw = json.loads(opencode_json.read_text(encoding="utf-8"))
            result["raw_config"] = raw
            result["mcp_servers"] = {
                k: v.get("enabled", False) if isinstance(v, dict) else False
                for k, v in raw.get("mcp", {}).items()
            }
            result["plugins"] = raw.get("plugin", [])
        except (json.JSONDecodeError, OSError) as e:
            logger.warning("Errore lettura %s: %s", opencode_json, e)

    # 2. agents/*.md
    agents_dir = config_dir / "agents"
    if agents_dir.is_dir():
        for f in sorted(agents_dir.glob("*.md")):
            content = f.read_text(encoding="utf-8")
            agent_id = f.stem
            name = agent_id.capitalize()
            for line in content.splitlines():
                if line.startswith("# ") and not any(
                    skip in line.lower() for skip in ("ruolo", "istruzioni", "regole", "colore")
                ):
                    name = line[2:].strip()
                    break
            result["agents"][agent_id] = {"name": name, "content": content}

    # 3. skills/{name}/SKILL.md
    skills_dir = config_dir / "skills"
    if skills_dir.is_dir():
        for d in skills_dir.iterdir():
            if d.is_dir():
                skill_file = d / "SKILL.md"
                if skill_file.exists():
                    result["skills"][d.name] = skill_file.read_text(encoding="utf-8")

    # 4. commands/{name}.md
    commands_dir = config_dir / "commands"
    if commands_dir.is_dir():
        for f in commands_dir.glob("*.md"):
            content = f.read_text(encoding="utf-8")
            # Estrai descrizione dal frontmatter YAML
            desc = ""
            in_frontmatter = False
            for line in content.splitlines():
                stripped = line.strip()
                if stripped == "---":
                    in_frontmatter = not in_frontmatter
                    continue
                if in_frontmatter and stripped.startswith("description:"):
                    # Rimuovi "description:" e gli apici
                    desc = stripped.split(":", 1)[1].strip().strip('"').strip("'")
                    break
            result["commands"][f.stem] = {"name": f.stem, "description": desc, "content": content}

    # 5. AGENTS.md (regole globali)
    agents_md = config_dir / "AGENTS.md"
    if agents_md.exists():
        result["rules"] = agents_md.read_text(encoding="utf-8")

    logger.info("Config OpenCode letto: %d agenti, %d skill", len(result["agents"]), len(result["skills"]))
    return result


def get_mcp_servers_state() -> dict[str, bool]:
    """Legge stato MCP server dal file opencode.json."""
    config_dir = Path.home() / ".config" / "opencode"
    opencode_json = config_dir / "opencode.json"
    logger.info("DEBUG: Cercando opencode.json in: %s", opencode_json)
    
    mcp_state: dict[str, bool] = {
        "Filesystem": False, "Git": False, "SQL": False, "Docker": False,
    }
    
    if opencode_json.exists():
        try:
            raw = json.loads(opencode_json.read_text(encoding="utf-8"))
            logger.info("DEBUG: opencode.json letto, chiavi: %s", list(raw.keys()))
            mcp_config = raw.get("mcp", {})
            logger.info("DEBUG: MCP config: %s", mcp_config)
            for name, config in mcp_config.items():
                if name in mcp_state:
                    mcp_state[name] = config.get("enabled", False) if isinstance(config, dict) else False
            logger.info("DEBUG: MCP state finale: %s", mcp_state)
        except (json.JSONDecodeError, OSError) as e:
            logger.error("DEBUG: Errore lettura MCP state: %s", e, exc_info=True)
    else:
        logger.warning("DEBUG: opencode.json NON ESISTE: %s", opencode_json)
    
    return mcp_state


def get_plugins_state() -> dict[str, bool]:
    """Legge stato plugins dal file opencode.json."""
    config_dir = Path.home() / ".config" / "opencode"
    opencode_json = config_dir / "opencode.json"
    
    plugin_list = ["Linter", "Formatter", "Prettier", "ESLint"]
    plugin_state: dict[str, bool] = {p: False for p in plugin_list}
    
    if opencode_json.exists():
        try:
            raw = json.loads(opencode_json.read_text(encoding="utf-8"))
            enabled_plugins = raw.get("plugin", [])
            for plugin_name in plugin_list:
                plugin_state[plugin_name] = plugin_name in enabled_plugins
        except (json.JSONDecodeError, OSError) as e:
            logger.warning("Errore lettura plugin state: %s", e)
    
    return plugin_state


def get_skills_state() -> dict[str, bool]:
    """Legge stato skills verificando se i file SKILL.md esistono in ~/.config/opencode/skills/{name}/."""
    config_dir = Path.home() / ".config" / "opencode"
    skills_dir = config_dir / "skills"
    
    skill_state: dict[str, bool] = {}
    
    if skills_dir.is_dir():
        for d in skills_dir.iterdir():
            if d.is_dir():
                skill_file = d / "SKILL.md"
                skill_state[d.name] = skill_file.exists()
    
    return skill_state


def save_project_state(data: dict[str, Any], project_dir: Path | None = None) -> Path:
    """Scrive project_state.json su disco nella cartella progetto."""
    target = (project_dir or settings.project_dir) / "project_state.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    logger.info("Stato progetto salvato: %s", target)
    return target


def get_project_files(project_dir: Path | None = None, max_depth: int = 3) -> list[dict[str, Any]]:
    """Elenca file e cartelle del progetto (max_depth livelli)."""
    root = project_dir or settings.project_dir
    if not root.is_dir():
        return []
    result: list[dict[str, Any]] = []
    _skip = {".git", "node_modules", "__pycache__", ".venv", "venv", ".next", "dist", "build", ".cache"}

    def _scan(d: Path, depth: int) -> None:
        if depth > max_depth:
            return
        try:
            entries = sorted(d.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower()))
        except PermissionError:
            return
        for entry in entries:
            if entry.name in _skip or entry.name.startswith("."):
                continue
            item: dict[str, Any] = {"name": entry.name, "path": str(entry.relative_to(root))}
            if entry.is_dir():
                item["type"] = "dir"
                children: list[dict[str, Any]] = []
                _scan_dir(entry, children, depth + 1, max_depth, _skip, root)
                item["children"] = children
            else:
                item["type"] = "file"
                try:
                    item["size"] = entry.stat().st_size
                except OSError:
                    item["size"] = 0
            result.append(item)

    def _scan_dir(d: Path, out: list, depth: int, max_d: int, skip: set, base: Path) -> None:
        if depth > max_d:
            return
        try:
            entries = sorted(d.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower()))
        except PermissionError:
            return
        for entry in entries:
            if entry.name in skip or entry.name.startswith("."):
                continue
            item: dict[str, Any] = {"name": entry.name, "path": str(entry.relative_to(base))}
            if entry.is_dir():
                item["type"] = "dir"
                children: list[dict[str, Any]] = []
                _scan_dir(entry, children, depth + 1, max_d, skip, base)
                item["children"] = children
            else:
                item["type"] = "file"
                try:
                    item["size"] = entry.stat().st_size
                except OSError:
                    item["size"] = 0
            out.append(item)

    _scan(root, 0)
    return result


def get_projects_list(projects_root: Path | None = None) -> list[str]:
    """Scansiona directory progetti e restituisce nomi cartelle."""
    root = projects_root or Path.home() / "Desktop"
    if not root.is_dir():
        return []
    return sorted(
        d.name
        for d in root.iterdir()
        if d.is_dir() and not d.name.startswith(".") and not d.name.startswith("_")
    )


OutputCallback = Callable[[str, str, str], Awaitable[None]]


def resolve_opencode_bin() -> str:
    """Risolve il path dell'eseguibile opencode (su Windows npm installa .cmd/.ps1)."""
    configured = Path(settings.opencode_bin)
    if configured.exists():
        return str(configured)

    for name in ("opencode.exe", "opencode"):
        found = shutil.which(name)
        if not found:
            continue
        path = Path(found)
        if path.suffix.lower() == ".cmd":
            exe = path.parent / "node_modules" / "opencode-ai" / "bin" / "opencode.exe"
            if exe.exists():
                return str(exe)
        if path.suffix.lower() == ".exe" or path.is_file():
            return str(path)

    npm_exe = (
        Path.home()
        / "AppData"
        / "Roaming"
        / "npm"
        / "node_modules"
        / "opencode-ai"
        / "bin"
        / "opencode.exe"
    )
    if npm_exe.exists():
        return str(npm_exe)

    return settings.opencode_bin


class OpencodeRunner:
    """Esegue comandi opencode via subprocess e streamma stdout/stderr."""

    def __init__(self) -> None:
        self._running: dict[str, asyncio.subprocess.Process] = {}
        self._lock = asyncio.Lock()
        self._bin = resolve_opencode_bin()

    @property
    def binary(self) -> str:
        return self._bin

    async def verify_installation(self) -> bool:
        try:
            proc = await asyncio.create_subprocess_exec(
                self._bin,
                "--version",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                creationflags=CREATE_NO_WINDOW,
            )
            stdout, stderr = await proc.communicate()
            output = (stdout or stderr or b"").strip()
            return proc.returncode == 0 or bool(output)
        except (FileNotFoundError, OSError):
            return False

    async def run(
        self,
        agent_id: str,
        args: list[str],
        cwd: Path | None = None,
        on_output: OutputCallback | None = None,
    ) -> int:
        _validate_command(args)
        work_dir = cwd or settings.project_dir
        cmd = [self._bin, *args]

        logger.info("[%s] Executing: %s (cwd=%s)", agent_id, " ".join(cmd), work_dir)

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=str(work_dir),
            creationflags=CREATE_NO_WINDOW,
        )

        async with self._lock:
            self._running[agent_id] = proc

        async def read_stream(stream: asyncio.StreamReader, stream_name: str) -> None:
            while True:
                line = await stream.readline()
                if not line:
                    break
                text = line.decode("utf-8", errors="replace").rstrip("\r\n")
                if text and on_output:
                    await on_output(agent_id, stream_name, text)

        await asyncio.gather(
            read_stream(proc.stdout, "stdout"),  # type: ignore[arg-type]
            read_stream(proc.stderr, "stderr"),  # type: ignore[arg-type]
        )

        try:
            exit_code = await asyncio.wait_for(proc.wait(), timeout=60.0)
        except asyncio.TimeoutError:
            proc.kill()
            logger.warning("[%s] Command timed out after 60s — killed", agent_id)
            return -1

        async with self._lock:
            self._running.pop(agent_id, None)

        logger.info("[%s] Finished with exit code %d", agent_id, exit_code)
        return exit_code

    async def run_message(
        self,
        agent_id: str,
        message: str,
        cwd: Path | None = None,
        extra_args: list[str] | None = None,
        on_output: OutputCallback | None = None,
        opencode_agent: str | None = None,
        auto_approve: bool = False,
    ) -> int:
        args = ["run", "--format", "default"]
        # Se full_auto, concede tutti i permessi automaticamente
        if auto_approve:
            args.append("--auto")
        # Se specificato un agente OpenCode, usa --agent per caricare le sue regole
        if opencode_agent:
            args.extend(["--agent", opencode_agent])
        if extra_args:
            args.extend(extra_args)
        args.append(message)
        return await self.run(agent_id, args, cwd=cwd, on_output=on_output)

    async def cancel(self, agent_id: str) -> bool:
        async with self._lock:
            proc = self._running.get(agent_id)
        if proc and proc.returncode is None:
            proc.terminate()
            return True
        return False

    def is_running(self, agent_id: str) -> bool:
        proc = self._running.get(agent_id)
        return proc is not None and proc.returncode is None


def now_time() -> str:
    return datetime.now().strftime("%H:%M:%S")


def now_chat_time() -> str:
    return datetime.now().strftime("%H:%M")
