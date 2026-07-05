from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, Field


class WsEventType(str, Enum):
    # Client → server
    CHAT_MESSAGE = "chat_message"
    START_ORCHESTRATION = "start_orchestration"
    EXECUTE_COMMAND = "execute_command"
    APPROVE_COMMAND = "approve_command"
    REJECT_COMMAND = "reject_command"
    UPDATE_SETTINGS = "update_settings"
    SYNC_REQUEST = "sync_request"
    PING = "ping"
    NEW_PROJECT = "new_project"
    SAVE_PROJECT = "save_project"
    CREATE_AGENT = "create_agent"
    TOGGLE_MCP = "toggle_mcp"
    TOGGLE_PLUGIN = "toggle_plugin"
    TOGGLE_SKILL = "toggle_skill"
    UPDATE_MEMORY = "update_memory"
    UPDATE_GLOBAL_RULES = "update_global_rules"
    UPDATE_GLOBAL_MEMORY = "update_global_memory"
    UPDATE_PROJECT_RULES = "update_project_rules"
    SWITCH_PROJECT = "switch_project"
    SYNC_FROM_OPENCODE = "sync_from_opencode"
    GET_PROJECTS_LIST = "get_projects_list"
    GET_PROJECT_FILES = "get_project_files"
    GET_MEMORY = "get_memory"
    INTERRUPT_AGENT = "interrupt_agent"

    # Server → client
    CHAT_BROADCAST = "chat_broadcast"
    TERMINAL_OUTPUT = "terminal_output"
    AGENT_UPDATE = "agent_update"
    LOG_ENTRY = "log_entry"
    SYSTEM_METRICS = "system_metrics"
    COMMAND_PROPOSAL = "command_proposal"
    COMMAND_STATUS = "command_status"
    CONNECTION_STATUS = "connection_status"
    SETTINGS_UPDATE = "settings_update"
    ERROR = "error"
    PONG = "pong"
    NEW_PROJECT_RESET = "new_project_reset"
    SAVE_PROJECT_ACK = "save_project_ack"
    AGENT_CREATED = "agent_created"
    MCP_UPDATE = "mcp_update"
    PLUGIN_UPDATE = "plugin_update"
    SKILL_UPDATE = "skill_update"
    SYNC_UPDATE = "sync_update"
    PROJECTS_LIST = "projects_list"
    PROJECT_FILES = "project_files"
    MEMORY_DATA = "memory_data"


class ActivityStatus(str, Enum):
    OK = "OK"
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    ERROR = "ERROR"


class AgentActivity(BaseModel):
    label: str
    status: ActivityStatus = ActivityStatus.PENDING


class AgentStats(BaseModel):
    completed: int = 0
    in_progress: int = 0
    waiting: int = 0


class AgentState(BaseModel):
    id: str
    name: str
    color: str
    progress: int = 0
    status: Literal["operational", "idle", "working", "waiting", "error"] = "idle"
    activities: list[AgentActivity] = Field(default_factory=list)
    files: list[str] = Field(default_factory=list)
    stats: AgentStats = Field(default_factory=AgentStats)
    spark_data: list[int] = Field(default_factory=lambda: [10] * 12)


class ChatMessageIn(BaseModel):
    sender: str = "Utente"
    text: str
    recipient: str = "all"


class ChatMessageOut(BaseModel):
    id: str
    sender: str
    sender_color: str
    text: str
    time: str
    recipient: str = "all"


class ExecuteCommandIn(BaseModel):
    agent_id: str
    command: str
    args: list[str] = Field(default_factory=list)
    cwd: str | None = None
    approved: bool = False


class CommandProposal(BaseModel):
    id: str
    agent_id: str
    agent_name: str
    command: str
    args: list[str]
    reason: str


class WsMessage(BaseModel):
    type: WsEventType
    payload: dict[str, Any] = Field(default_factory=dict)


class SystemMetrics(BaseModel):
    cpu_percent: float
    memory_percent: float
    memory_used_gb: float
    memory_total_gb: float
    tokens_per_min: float = 0.0
    api_calls: int = 0
    project_progress: int = 0
    agent_id: str | None = None
