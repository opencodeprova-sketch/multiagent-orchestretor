import { useEffect, useRef } from 'react';
import Sparkline from './Sparkline';
import { useOrchestratorContext } from '../context/OrchestratorContext';
import { STATUS_LABEL } from '../data/mockup';

const activityColors: Record<string, string> = {
  OK: 'text-green-400',
  PENDING: 'text-amber-400',
  RUNNING: 'text-blue-400',
  ERROR: 'text-red-400',
};

const statusGradients: Record<string, string> = {
  OPERATIVO: 'from-green-500 to-emerald-400',
  LAVORANDO: 'from-blue-500 to-cyan-400',
  WAITING: 'from-amber-500 to-orange-400',
  ERRORE: 'from-red-500 to-rose-400',
  IDLE: 'from-slate-400 to-gray-400',
};

export default function AgentDetailModal({
  agentId,
  onClose,
}: {
  agentId: string;
  onClose: () => void;
}) {
  const { agentsList, logs } = useOrchestratorContext();
  const termRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const agent = agentsList.find((a) => a.id === agentId);
  if (!agent) return null;

  const color = agent.color;
  const statusLabel = STATUS_LABEL[agent.status] ?? 'OPERATIVO';
  const statusGrad = statusGradients[statusLabel] ?? 'from-slate-400 to-gray-400';

  const agentLogs = logs
    .filter((l) => l.agent_id === agentId || l.agent === agent.name)
    .slice(-50);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [agentLogs.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="relative w-[580px] max-h-[85vh] flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${color}10, #0a0e1a)`,
          border: `1px solid ${color}30`,
          boxShadow: `0 0 60px ${color}15, 0 0 120px ${color}08, 0 20px 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 hover:scale-110"
          style={{
            background: `${color}20`,
            border: `1px solid ${color}30`,
            color,
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div
          className="relative px-6 pt-6 pb-4 flex items-center gap-4 flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${color}18, ${color}06)` }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              boxShadow: `0 4px 20px ${color}40`,
            }}
          >
            🤖
          </div>
          <div className="flex-1 min-w-0">
            <span
              className="font-black text-lg tracking-[0.15em] uppercase block truncate"
              style={{ color: '#e8edf8', textShadow: `0 0 20px ${color}30` }}
            >
              {agent.name}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${statusGrad}`} />
              <span className="text-[10px] font-semibold text-[#8a96b4] tracking-wider">{statusLabel}</span>
              <span className="text-[9px] text-[#4a5575]">— ID: {agent.id}</span>
            </div>
          </div>
          <div className="text-right">
            <span
              className="text-3xl font-black tabular-nums"
              style={{ color, textShadow: `0 0 20px ${color}40` }}
            >
              {agent.progress}
            </span>
            <span className="text-[10px] text-[#5a6585] block -mt-1">%</span>
          </div>
        </div>

        {/* Progress bar — full width */}
        <div className="relative px-6 pt-3 pb-2 flex-shrink-0">
          <div className="h-2 rounded-full bg-[#1e2a45] overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${agent.progress}%`,
                background: `linear-gradient(90deg, ${color}, ${color}dd, ${color}88)`,
                boxShadow: `0 0 16px ${color}60`,
              }}
            />
          </div>
        </div>

        {/* Scrollable body */}
        <div className="relative flex-1 overflow-y-auto px-6 py-3 space-y-4 scrollbar-thin"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e2a45 transparent' }}>
          
          {/* Sparkline large */}
          <div>
            <p className="text-[8px] font-semibold text-[#5a6585] tracking-[0.2em] mb-1.5 uppercase">Trend</p>
            <div className="bg-[#080c14] rounded-xl p-2 border border-[#ffffff08]">
              <Sparkline data={agent.spark_data} color={color} width={520} height={60} />
            </div>
          </div>

          {/* Activities */}
          <div>
            <p className="text-[8px] font-semibold text-[#5a6585] tracking-[0.2em] mb-1.5 uppercase">Attività</p>
            <div className="bg-[#080c14] rounded-xl p-3 border border-[#ffffff08] flex flex-col gap-1">
              {agent.activities.length === 0 ? (
                <span className="text-[10px] text-[#4a5575] italic">Nessuna attività</span>
              ) : (
                agent.activities.map((a, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 px-2 py-1.5 rounded-lg bg-[#ffffff04] hover:bg-[#ffffff08] transition-colors">
                    <span className="text-[11px] text-[#8a96b4] leading-tight flex-1">{a.label}</span>
                    <span className={`text-[9px] font-bold flex-shrink-0 tracking-wider ${activityColors[a.status] ?? 'text-amber-400'}`}>
                      [{a.status}]
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Files */}
          {agent.files && agent.files.length > 0 && (
            <div>
              <p className="text-[8px] font-semibold text-[#5a6585] tracking-[0.2em] mb-1.5 uppercase">File aperti</p>
              <div className="bg-[#080c14] rounded-xl p-3 border border-[#ffffff08] flex flex-col gap-0.5">
                {agent.files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1">
                    <span className="text-[10px]">📄</span>
                    <span className="text-[10px] text-[#6a7595] font-mono truncate">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div>
            <p className="text-[8px] font-semibold text-[#5a6585] tracking-[0.2em] mb-1.5 uppercase">Statistiche</p>
            <div className="bg-[#080c14] rounded-xl p-3 border border-[#ffffff08] grid grid-cols-3 gap-2">
              {[
                { label: 'Completati', value: agent.stats.completed },
                { label: 'In corso', value: agent.stats.in_progress },
                { label: 'In attesa', value: agent.stats.waiting },
              ].map((s) => (
                <div key={s.label} className="text-center py-1">
                  <p className="text-[8px] text-[#5a6585] tracking-wider mb-0.5 uppercase">{s.label}</p>
                  <p className="text-xl font-black" style={{
                    background: `linear-gradient(135deg, ${color}, ${color}88)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal output */}
          <div className="pb-4">
            <p className="text-[8px] font-semibold text-[#5a6585] tracking-[0.2em] mb-1.5 uppercase">Terminale</p>
            <div
              ref={termRef}
              className="bg-[#080c14] rounded-xl p-3 max-h-[200px] overflow-y-auto border border-[#ffffff08]"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e2a45 transparent' }}
            >
              {agentLogs.length === 0 ? (
                <span className="text-[#4a5575] text-[10px] font-mono italic">In attesa di output...</span>
              ) : (
                agentLogs.map((log, i) => (
                  <div key={i} className="flex gap-2 leading-relaxed">
                    <span className="text-[#2a3a55] text-[9px] font-mono flex-shrink-0">{log.time}</span>
                    <span className="text-[#6a7595] text-[9px] font-mono break-all">{log.msg}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
