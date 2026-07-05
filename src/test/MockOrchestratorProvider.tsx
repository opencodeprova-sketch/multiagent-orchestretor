import { type ReactNode } from 'react';
import { OrchestratorContext } from '../context/OrchestratorContext';
import type { AgentState, AppSettings, ChatMessage, CommandProposal, LogEntry, OpenCodeConfig, OrchestratorState, ProjectInfo, SystemMetrics } from '../types/orchestrator';

const defaultAgent: AgentState = {
  id: 'test-agent',
  name: 'Agente Test',
  color: '#3b82f6',
  progress: 65,
  status: 'IDLE',
  activities: [{ id: 'a1', agent_id: 'test-agent', name: 'Analisi', status: 'completed' }],
  files: ['/test/file.ts'],
  stats: { completed: 5, in_progress: 2, waiting: 1 },
  spark_data: [10, 20, 30, 40, 50],
};

const defaultSettings: AppSettings = {
  full_auto: true,
  human_approval: false,
  autonomy_level: 'medium',
  last_sync: '10:30',
};

const defaultMetrics: SystemMetrics = {
  cpu_percent: 23,
  memory_percent: 31,
  memory_used_gb: 3.23,
  memory_total_gb: 16,
  tokens_per_min: 120,
  api_calls: 45,
  project_progress: 55,
};

const defaultLogs: LogEntry[] = [
  { time: '10:30', agent: 'Direttore', color: '#a78bfa', msg: 'Task completato', agent_id: 'direttore' },
  { time: '10:29', agent: 'Coder', color: '#3b82f6', msg: 'Refactoring completato', agent_id: 'coder' },
];

const defaultMessages: ChatMessage[] = [
  { id: 'm1', sender: 'Direttore', sender_color: '#a78bfa', text: 'Ciao, come va?', time: '10:30' },
  { id: 'm2', sender: 'Utente', sender_color: '#22c55e', text: 'Bene, grazie!', time: '10:31' },
];

const defaultState: OrchestratorState = {
  connected: true,
  opencodeInstalled: true,
  opencodeBin: 'opencode',
  settings: defaultSettings,
  agents: { 'test-agent': defaultAgent, 'coder': { ...defaultAgent, id: 'coder', name: 'Coder' } },
  messages: defaultMessages,
  logs: defaultLogs,
  metrics: defaultMetrics,
  pendingProposal: null,
  lastError: null,
  mcpServers: { 'server-a': true, 'server-b': false },
  plugins: { 'plugin-x': true },
  skills: { 'ponytail': true, 'graphify': false },
  projects: ['/project/a', '/project/b'],
  opencodeConfig: null,
  projectInfo: { name: 'Test Project', path: '/project/a', files: [] },
  projectMemory: '',
  globalRules: '',
  globalMemory: '',
  projectRules: '',
};

const noop = () => {};
const asyncNoop = async () => {};

const defaultContextValue = {
  ...defaultState,
  agentsList: Object.values(defaultState.agents),
  metrics: defaultMetrics,
  recentActivities: defaultLogs.slice(-5).reverse().map((l) => ({
    agent: l.agent, action: l.msg, time: l.time, color: l.color,
  })),
  mcpServers: defaultState.mcpServers,
  plugins: defaultState.plugins,
  skills: defaultState.skills,
  projects: defaultState.projects,
  opencodeConfig: defaultState.opencodeConfig,
  projectInfo: defaultState.projectInfo,
  toggleMcp: noop,
  togglePlugin: noop,
  toggleSkill: noop,
  sendChat: noop,
  startOrchestration: asyncNoop,
  updateSettings: noop,
  requestSync: asyncNoop,
  syncFromOpencode: asyncNoop,
  getProjectsList: async () => defaultState.projects,
  switchProject: asyncNoop,
  getProjectFiles: async () => [],
  approveCommand: noop,
  rejectCommand: noop,
  newProject: asyncNoop,
  loadMemory: asyncNoop,
  saveMemory: asyncNoop,
  saveGlobalRules: asyncNoop,
  saveGlobalMemory: asyncNoop,
  saveProjectRules: asyncNoop,
  interruptAgent: noop,
  saveProject: asyncNoop,
  createNewProject: asyncNoop,
  executeCommand: noop,
  createAgent: noop,
  send: noop,
};

export function MockOrchestratorProvider({
  children,
  overrides,
}: {
  children: ReactNode;
  overrides?: Partial<typeof defaultContextValue>;
}) {
  const value = { ...defaultContextValue, ...overrides };
  return (
    <OrchestratorContext.Provider value={value}>
      {children}
    </OrchestratorContext.Provider>
  );
}

export { defaultContextValue, defaultAgent, defaultState, defaultLogs, defaultMessages, defaultMetrics, defaultSettings };
