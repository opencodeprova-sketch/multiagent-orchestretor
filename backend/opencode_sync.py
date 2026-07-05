"""Deep sync between orchestrator GUI and OpenCode CLI config on Windows."""
import json
import logging
import shutil
from pathlib import Path

logger = logging.getLogger(__name__)

OPENCODE_CONFIG_DIR = Path.home() / ".config" / "opencode"
OPENCODE_JSON = OPENCODE_CONFIG_DIR / "opencode.json"
AGENTS_DIR = OPENCODE_CONFIG_DIR / "agents"
SKILLS_DIR = OPENCODE_CONFIG_DIR / "skills"


def _backup_config() -> Path:
    """Create timestamped backup of opencode.json before modification."""
    import datetime
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup = OPENCODE_JSON.parent / f"opencode.json.backup.orchestrator_{ts}"
    if OPENCODE_JSON.exists():
        shutil.copy2(OPENCODE_JSON, backup)
        logger.info("Config backed up: %s", backup)
    return backup


def _read_opencode_json() -> dict:
    """Read the opencode.json config file."""
    if not OPENCODE_JSON.exists():
        logger.warning("opencode.json not found at %s, creating empty config", OPENCODE_JSON)
        return {"$schema": "https://opencode.ai/config.json", "mcp": {}, "plugin": [], "permission": {}}
    try:
        return json.loads(OPENCODE_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        logger.error("Failed to parse opencode.json: %s", e)
        return {"$schema": "https://opencode.ai/config.json", "mcp": {}, "plugin": [], "permission": {}}


def _write_opencode_json(config: dict) -> None:
    """Write updated opencode.json config file."""
    _backup_config()
    OPENCODE_JSON.write_text(
        json.dumps(config, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    logger.info("opencode.json updated successfully")


# ── MCP Server Sync ──────────────────────────────────────────────

MCP_SERVER_TEMPLATES: dict[str, dict] = {
    "Filesystem": {
        "type": "local",
        "command": ["uvx", "mcp-server-filesystem", str(Path.home())],
        "enabled": False,
    },
    "Git": {
        "type": "local",
        "command": ["uvx", "mcp-git"],
        "enabled": False,
    },
    "SQL": {
        "type": "local",
        "command": ["uvx", "mcp-sqlite"],
        "enabled": False,
    },
    "Docker": {
        "type": "local",
        "command": ["uvx", "mcp-server-docker"],
        "enabled": False,
    },
    "blender-mcp": {
        "type": "local",
        "command": ["uvx", "blender-mcp"],
        "enabled": True,
        "environment": {"BLENDER_HOST": "localhost", "BLENDER_PORT": "9876"},
    },
    "arduino": {
        "type": "local",
        "command": ["C:\\Users\\manue\\AppData\\Local\\Programs\\Python\\Python311\\Scripts\\mcp-arduino-server.exe"],
        "enabled": True,
        "environment": {
            "ARDUINO_CLI_PATH": "C:\\Users\\manue\\bin\\arduino-cli\\arduino-cli.exe",
            "MCP_SKETCH_DIR": "C:\\Users\\manue\\Documents\\Arduino_MCP_Sketches",
            "LOG_LEVEL": "INFO",
        },
    },
    "composio": {
        "type": "remote",
        "url": "https://connect.composio.dev/mcp",
        "enabled": True,
        "timeout": 60000,
        "headers": {"x-api-key": "ak_D2NwFapHoupgIhJP5VBz"},
    },
    "pdf-reader": {
        "type": "local",
        "command": ["C:\\Users\\manue\\AppData\\Local\\Python\\pythoncore-3.14-64\\Scripts\\markitdown-mcp.exe"],
        "enabled": True,
    },
}


def sync_mcp_server(name: str, enabled: bool) -> bool:
    """Toggle an MCP server in opencode.json. Returns True if config was modified."""
    config = _read_opencode_json()
    mcp = config.setdefault("mcp", {})

    if name in MCP_SERVER_TEMPLATES:
        template = MCP_SERVER_TEMPLATES[name]
        if name not in mcp:
            mcp[name] = {**template, "enabled": enabled}
        else:
            mcp[name]["enabled"] = enabled
    elif name in mcp:
        mcp[name]["enabled"] = enabled
    else:
        mcp[name] = {"type": "local", "command": [name.lower()], "enabled": enabled}

    _write_opencode_json(config)
    logger.info("MCP server '%s' set to enabled=%s", name, enabled)
    return True


# ── Plugin Sync ──────────────────────────────────────────────────

PLUGIN_MAP: dict[str, str] = {
    "Linter": "eslint",
    "Formatter": "prettier",
    "Prettier": "prettier",
    "ESLint": "eslint",
    "opencode-handoff": "opencode-handoff",
    "model-announcer": "@ramarivera/opencode-model-announcer",
    "smart-title": "@hyakt/opencode-smart-title",
    "caveman": "opencode-caveman",
    "graphify": "plugins/graphify.js",
    "ponytail": "@dietrichgebert/ponytail",
}


def sync_plugin(name: str, enabled: bool) -> bool:
    """Toggle a plugin in opencode.json plugin array. Returns True if config was modified."""
    config = _read_opencode_json()
    plugins: list[str] = config.setdefault("plugin", [])

    plugin_id = PLUGIN_MAP.get(name, name)

    if enabled and plugin_id not in plugins:
        plugins.append(plugin_id)
    elif not enabled and plugin_id in plugins:
        plugins.remove(plugin_id)

    _write_opencode_json(config)
    logger.info("Plugin '%s' (id=%s) set to enabled=%s", name, plugin_id, enabled)
    return True


# ── Agent Sync ───────────────────────────────────────────────────

def sync_agent(agent_id: str, name: str, role: str, task: str = "", color: str = "#3b82f6") -> bool:
    """Create or update an agent .md file in OpenCode's agents directory."""
    if not AGENTS_DIR.exists():
        AGENTS_DIR.mkdir(parents=True, exist_ok=True)

    agent_file = AGENTS_DIR / f"{agent_id}.md"

    content = f"""---
description: {role}
mode: subagent
permission:
  read: allow
  glob: allow
  grep: allow
  edit: allow
  bash:
    "*": deny
    "npm *": allow
    "npx *": allow
    "python *": allow
    "pip *": allow
    "ls*": allow
    "cat*": allow
    "mkdir*": allow
  task: deny
  webfetch: ask
  websearch: ask
---

# {name}

## Ruolo
{role}

## Istruzioni
Sei l'agente **{name}**. Il tuo compito è: {role}

{"Task assegnato: " + task if task else "In attesa di task."}

## Regole
- Rispondi sempre in italiano
- Sii conciso e tecnico
- Non eseguire azioni pericolose senza approvazione
- Usa tool only when necessary

## Colore
Per la GUI, il colore associato è: {color}
"""

    agent_file.write_text(content, encoding="utf-8")
    logger.info("Agent file created/updated: %s", agent_file)
    return True


def remove_agent(agent_id: str) -> bool:
    """Remove an agent .md file from OpenCode's agents directory."""
    agent_file = AGENTS_DIR / f"{agent_id}.md"
    if agent_file.exists():
        agent_file.unlink()
        logger.info("Agent file removed: %s", agent_file)
        return True
    return False


# ── Memory/Context Sync ──────────────────────────────────────────

def sync_memory(key: str, content: str, project_dir: Path | None = None) -> bool:
    """Save memory/context data to the workspace."""
    target_dir = project_dir or Path.cwd()

    docs_dir = target_dir / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)

    memory_file = docs_dir / f"{key}.md"
    memory_file.write_text(content, encoding="utf-8")
    logger.info("Memory synced to: %s", memory_file)
    return True


def read_memory(key: str, project_dir: Path | None = None) -> str:
    """Read memory/context data from the workspace."""
    target_dir = project_dir or Path.cwd()
    memory_file = target_dir / "docs" / f"{key}.md"
    if memory_file.exists():
        return memory_file.read_text(encoding="utf-8")
    return f"# Memoria del Progetto\n\nNessuna memoria salvata per '{key}'."


def read_global_rules() -> str:
    """Read the global rules from AGENTS.md."""
    agents_md = OPENCODE_CONFIG_DIR / "AGENTS.md"
    if agents_md.exists():
        return agents_md.read_text(encoding="utf-8")
    return "# Regole Globali\n\nNessuna regola globale definita."


def read_global_memory() -> str:
    """Read the global memory from MEMORY.md in OpenCode config."""
    memory_md = OPENCODE_CONFIG_DIR / "MEMORY.md"
    if memory_md.exists():
        return memory_md.read_text(encoding="utf-8")
    return "# Memoria Globale\n\nNessuna memoria globale definita."


def sync_global_memory(content: str) -> bool:
    """Write/update the MEMORY.md global memory file in OpenCode config dir."""
    memory_md = OPENCODE_CONFIG_DIR / "MEMORY.md"
    memory_md.write_text(content, encoding="utf-8")
    logger.info("Global memory synced to: %s", memory_md)
    return True


def read_project_rules(project_dir: Path | None = None) -> str:
    """Read project-specific rules from docs/project-rules.md."""
    target_dir = project_dir or Path.cwd()
    rules_file = target_dir / "docs" / "project-rules.md"
    if rules_file.exists():
        return rules_file.read_text(encoding="utf-8")
    return "# Regole del Progetto\n\nNessuna regola progetto definita."


def sync_project_rules(content: str, project_dir: Path | None = None) -> bool:
    """Save project-specific rules to docs/project-rules.md."""
    target_dir = project_dir or Path.cwd()
    docs_dir = target_dir / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)
    rules_file = docs_dir / "project-rules.md"
    rules_file.write_text(content, encoding="utf-8")
    logger.info("Project rules synced to: %s", rules_file)
    return True


def sync_global_rules(content: str) -> bool:
    """Write/update the AGENTS.md global rules file in OpenCode config dir."""
    agents_md = OPENCODE_CONFIG_DIR / "AGENTS.md"
    agents_md.write_text(content, encoding="utf-8")
    logger.info("Global rules synced to: %s", agents_md)
    return True


# ── Skills Sync ─────────────────────────────────────────────────

def sync_skill(skill_id: str, enabled: bool) -> bool:
    """Enable/disable a skill by writing to the skill config or by creating a marker file."""
    if not SKILLS_DIR.exists():
        SKILLS_DIR.mkdir(parents=True, exist_ok=True)
    
    skill_file = SKILLS_DIR / f"{skill_id}.md"
    if enabled:
        if not skill_file.exists():
            # Create a basic skill template
            content = f"""---
name: {skill_id}
enabled: true
version: 1.0
---

# {skill_id}

Questa skill è abilitata nell'orchestratore.
"""
            skill_file.write_text(content, encoding="utf-8")
        else:
            # Ensure enabled marker
            config = _read_opencode_json()
            skills = config.setdefault("skills", {})
            skills[skill_id] = {"enabled": True}
            _write_opencode_json(config)
    else:
        if skill_file.exists():
            skill_file.unlink()
        config = _read_opencode_json()
        skills = config.setdefault("skills", {})
        if skill_id in skills:
            skills[skill_id] = {"enabled": False}
            _write_opencode_json(config)
    
    logger.info("Skill '%s' set to enabled=%s", skill_id, enabled)
    return True


