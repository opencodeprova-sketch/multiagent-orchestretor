import { useState } from 'react';
import { AGENT_ICONS } from '../data/mockup';
import { useOrchestratorContext } from '../context/OrchestratorContext';

const FALLBACK_ACTIVITIES = [
  { agent: 'Tester', action: 'ha creato test_api.py', time: '10:34', color: '#a855f7' },
  { agent: 'Coder', action: 'ha iniziato main.py', time: '10:33', color: '#22c55e' },
  { agent: 'Architect', action: 'ha proposto la struttura', time: '10:32', color: '#3b82f6' },
  { agent: 'Manager', action: 'ha avviato WeatherBot project', time: '10:31', color: '#f97316' },
];

export default function RecentActivity() {
  const { messages, logs } = useOrchestratorContext();
  const [showAll, setShowAll] = useState(false);

  const fromMessages = messages.slice().reverse().map((m) => ({
    agent: m.sender,
    action: m.text.length > 50 ? m.text.slice(0, 50) + '…' : m.text,
    time: m.time,
    color: m.sender_color,
  }));

  const fromLogs = logs.slice().reverse().map((l) => ({
    agent: l.agent,
    action: l.msg.length > 50 ? l.msg.slice(0, 50) + '…' : l.msg,
    time: l.time,
    color: l.color,
  }));

  const allActivities = fromMessages.length > 0 ? fromMessages : fromLogs.length > 0 ? fromLogs : FALLBACK_ACTIVITIES;
  const activities = showAll ? allActivities : allActivities.slice(0, 4);

  return (
    <div className="flex flex-col h-full bg-[#0f1525] border border-[#1e2a45] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1e2a45] flex-shrink-0">
        <h3 id="recent-activity-title" className="text-xs font-semibold text-[#e8edf8]">Attività Recenti</h3>
      </div>

      <div id="recent-activity-feed" role="feed" aria-labelledby="recent-activity-title" className="flex-1 overflow-y-auto scrollbar-thin p-3 flex flex-col gap-3">
        {activities.map((a, i) => {
          const icon = AGENT_ICONS[a.agent];
          return (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{ background: `${a.color}20`, border: `1px solid ${a.color}40` }}
              >
                {icon?.emoji ?? '•'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[#e8edf8] leading-snug">
                  <span className="font-semibold" style={{ color: a.color }}>{a.agent}</span>{' '}
                  {a.action}
                </p>
                <p className="text-[10px] text-[#5a6585] mt-0.5">{a.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2 border-t border-[#1e2a45]">
        <button
          type="button"
          aria-expanded={showAll}
          aria-controls="recent-activity-feed"
          onClick={() => setShowAll((p) => !p)}
          className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showAll ? 'Mostra meno ↑' : 'Vedi tutte le attività →'}
        </button>
      </div>
    </div>
  );
}
