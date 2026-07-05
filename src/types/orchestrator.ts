export type AutonomyLevel = 'low' | 'medium' | 'high';

export interface AppSettings {
  full_auto: boolean;
  human_approval: boolean;
  autonomy_level: AutonomyLevel;
  last_sync: string;
  temperature?: number;
  project_dir?: string;
  model?: string;
}

export interface AgentActivity {
  label: string;
  status: 'OK' | 'PENDING' | 'RUNNING' | 'ERROR';
}

export interface AgentState {
  id: string;
  name: string;
  color: string;
  progress: number;
  status: string;
  activities: AgentActivity[];
  files: string[];
  stats: { completed: number; in_progress: number; waiting: number };
  spark_data: number[];
}

export interface ChatMessage {
  id: string;
  sender: string;
  sender_color: string;
  text: string;
  time: string;
  recipient?: string;
}

export interface LogEntry {
  time: string;
  agent: string;
  color: string;
  msg: string;
  agent_id?: string;
}

export interface SystemMetrics {
  cpu_percent: number;
  memory_percent: number;
  memory_used_gb: number;
  memory_total_gb: number;
  tokens_per_min: number;
  api_calls: number;
  project_progress: number;
}

export interface CommandProposal {
  id: string;
  agent_id: string;
  agent_name: string;
  command: string;
  args: string[];
  reason: string;
}

export interface OpenCodeConfig {
  agents: Record<string, { name: string; content: string }>;
  skills: Record<string, string>;
  commands: Record<string, { name: string; description: string; content: string }>;
  rules: string;
  mcp_servers: Record<string, boolean>;
  plugins: string[];
  raw_config: Record<string, unknown>;
}

export interface ProjectFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  children?: ProjectFile[];
}

export interface ProjectInfo {
  name: string;
  path: string;
  files: ProjectFile[];
}

export interface OrchestratorState {
  connected: boolean;
  opencodeInstalled: boolean;
  opencodeBin: string;
  settings: AppSettings;
  agents: Record<string, AgentState>;
  messages: ChatMessage[];
  logs: LogEntry[];
  metrics: SystemMetrics | null;
  pendingProposal: CommandProposal | null;
  lastError: string | null;
  mcpServers: Record<string, boolean>;
  plugins: Record<string, boolean>;
  skills: Record<string, boolean>;
  projects: string[];
  opencodeConfig: OpenCodeConfig | null;
  projectInfo: ProjectInfo | null;
  projectMemory: string;
  globalRules: string;
  globalMemory: string;
  projectRules: string;
}

export const WS_EVENT = {
  CHAT_MESSAGE: 'chat_message',
  START_ORCHESTRATION: 'start_orchestration',
  UPDATE_SETTINGS: 'update_settings',
  SYNC_REQUEST: 'sync_request',
  APPROVE_COMMAND: 'approve_command',
  REJECT_COMMAND: 'reject_command',
  PING: 'ping',
  NEW_PROJECT: 'new_project',
  SAVE_PROJECT: 'save_project',
  CREATE_AGENT: 'create_agent',
  TOGGLE_MCP: 'toggle_mcp',
  TOGGLE_PLUGIN: 'toggle_plugin',
  TOGGLE_SKILL: 'toggle_skill',
  UPDATE_MEMORY: 'update_memory',
  UPDATE_GLOBAL_RULES: 'update_global_rules',
  UPDATE_GLOBAL_MEMORY: 'update_global_memory',
  UPDATE_PROJECT_RULES: 'update_project_rules',
  SYNC_FROM_OPENCODE: 'sync_from_opencode',
  GET_PROJECTS_LIST: 'get_projects_list',
  SWITCH_PROJECT: 'switch_project',
  EXECUTE_COMMAND: 'execute_command',
  GET_PROJECT_FILES: 'get_project_files',
  PROJECT_FILES: 'project_files',
  GET_MEMORY: 'get_memory',
  MEMORY_DATA: 'memory_data',
  INTERRUPT_AGENT: 'interrupt_agent',
} as const;
