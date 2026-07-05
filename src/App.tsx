import { useState } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import AgentCard from './components/AgentCard';
import AgentDetailModal from './components/AgentDetailModal';
import AgentRulesModal from './components/AgentRulesModal';
import ChatPanel from './components/ChatPanel';
import RecentActivity from './components/RecentActivity';
import ControlPanel from './components/ControlPanel';
import BottomBar from './components/BottomBar';
import { useOrchestratorContext } from './context/OrchestratorContext';
import { STATUS_LABEL } from './data/mockup';

const FIXED_AGENTS = ['direttore', 'coordinator'];

export default function App() {
  const { connected, agentsList, lastError, logs, sendChat, interruptAgent } = useOrchestratorContext();
  const [detailAgentId, setDetailAgentId] = useState<string | null>(null);
  const [rulesAgentId, setRulesAgentId] = useState<string | null>(null);
  const [memoryTrigger, setMemoryTrigger] = useState(0);

  // Filtro agenti:
  // - Direttore + Coordinatore sempre visibili (anche idle)
  // - Altri agenti solo se in working
  const visibleAgents = agentsList.filter((a) =>
    FIXED_AGENTS.includes(a.id) || a.status !== 'idle' || a.progress > 0,
  );

  const agentLogs = (agentName: string, agentId: string) =>
    logs
      .filter((l) => l.agent_id === agentId || l.agent === agentName)
      .slice(-20)
      .map((l) => ({ time: l.time, msg: l.msg }));

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080c14] overflow-hidden">
      <TopBar memoryTrigger={memoryTrigger} />

      {lastError && !connected && (
        <div className="px-4 py-1.5 bg-red-500/10 border-b border-red-500/20 text-[11px] text-red-400 flex-shrink-0">
          {lastError} — avvia il backend con start-backend.bat
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <Sidebar
          onAgentRulesClick={(id) => setRulesAgentId(id)}
          onMemoryClick={() => setMemoryTrigger((p) => p + 1)}
        />

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0 p-3 gap-3 overflow-hidden">
          {/* Agent cards row — solo agenti visibili */}
          {visibleAgents.length > 0 && (
            <div className="grid gap-3 flex-shrink-0" style={{ gridTemplateColumns: `repeat(${Math.min(visibleAgents.length, 6)}, 1fr)` }}>
              {visibleAgents.map((a) => (
                <AgentCard
                  key={a.id}
                  agentId={a.id}
                  name={a.name}
                  emoji="🤖"
                  progress={a.progress}
                  color={a.color}
                  status={STATUS_LABEL[a.status] ?? 'OPERATIVO'}
                  activities={a.activities.map((act) => ({
                    label: act.label,
                    status: act.status as 'OK' | 'PENDING' | 'RUNNING' | 'ERROR',
                  }))}
                  files={a.files}
                  stats={{
                    completed: 'completed' in a.stats ? a.stats.completed : 0,
                    inProgress: 'in_progress' in a.stats ? a.stats.in_progress : 0,
                    waiting: a.stats.waiting,
                  }}
                  sparkData={a.spark_data}
                  agentLogs={agentLogs(a.name, a.id)}
                  onCommand={(cmd) => sendChat(cmd, a.id)}
                  onAgentClick={(id) => setDetailAgentId(id)}
                  onStop={(id) => interruptAgent(id)}
                />
              ))}
            </div>
          )}

          {/* Bottom panels — chat + activity */}
          <div className="grid gap-3 flex-1 min-h-0" style={{ gridTemplateColumns: '2fr 1fr' }}>
            <ChatPanel />
            <RecentActivity />
          </div>
        </main>

        <ControlPanel />
      </div>

      {/* Modale dettaglio agente (tempo reale) */}
      {detailAgentId && (
        <AgentDetailModal
          agentId={detailAgentId}
          onClose={() => setDetailAgentId(null)}
        />
      )}

      {/* Modale regole agente (descrizione + regole) */}
      {rulesAgentId && (
        <AgentRulesModal
          agentId={rulesAgentId}
          onClose={() => setRulesAgentId(null)}
        />
      )}

      <BottomBar />
    </div>
  );
}
