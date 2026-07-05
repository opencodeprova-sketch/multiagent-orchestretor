import { useState, useEffect, useRef } from 'react';
import Sparkline from './Sparkline';
import { ROADMAP_PHASES, WORKFLOW_PHASES } from '../data/mockup';

interface Activity {
  label: string;
  status: 'OK' | 'PENDING' | 'ERROR' | 'RUNNING';
}

interface AgentCardProps {
  name: string;
  agentId?: string;
  emoji: string;
  progress: number;
  color: string;
  status?: string;
  activities: Activity[];
  files?: string[];
  stats: { completed: number; inProgress: number; waiting: number };
  sparkData: number[];
  agentLogs?: Array<{ time: string; msg: string }>;
  onCommand?: (cmd: string) => void;
  onAgentClick?: (agentId: string) => void;
  onStop?: (agentId: string) => void;
}

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

const phaseStatusStyle: Record<string, string> = {
  completed: 'text-green-400 border-green-400/30 bg-green-400/10',
  in_progress: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  waiting: 'text-[#5a6585] border-[#1e2a45] bg-[#ffffff04]',
};

function CommandButton({ label, cmd, color, onClick }: { label: string; cmd: string; color: string; onClick: (c: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(cmd)}
      className="px-2.5 py-1.5 rounded-xl text-[9px] font-bold tracking-wider uppercase transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
        border: `1px solid ${color}35`,
        color: color,
        textShadow: `0 0 10px ${color}30`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${color}35, ${color}15)`;
        e.currentTarget.style.boxShadow = `0 0 20px ${color}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${color}20, ${color}08)`;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {label}
    </button>
  );
}

function computePhaseStatus(progress: number, phaseId: number): 'completed' | 'in_progress' | 'waiting' {
  switch (phaseId) {
    case 1: return progress >= 15 ? 'completed' : progress > 0 ? 'in_progress' : 'waiting';
    case 2: return progress >= 40 ? 'completed' : progress >= 15 ? 'in_progress' : 'waiting';
    case 3: return progress >= 75 ? 'completed' : progress >= 40 ? 'in_progress' : 'waiting';
    case 4: return progress >= 90 ? 'completed' : progress >= 75 ? 'in_progress' : 'waiting';
    case 5: return progress >= 100 ? 'completed' : progress >= 90 ? 'in_progress' : 'waiting';
    default: return 'waiting';
  }
}

function DirettoreFooter({ progress, color, onCommand }: { progress: number; color: string; onCommand: (c: string) => void }) {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  const phases = ROADMAP_PHASES.map((p) => ({
    ...p,
    status: computePhaseStatus(progress, p.id),
  }));

  return (
    <div style={{ borderTop: `1px solid ${color}15` }}>
      {/* Comandi Direttore */}
      <div className="px-3 pt-2.5 pb-1.5 flex flex-col gap-1.5">
        <p className="text-[7px] font-bold text-[#4a5575] tracking-[0.2em] uppercase px-0.5">Comandi</p>
        <div className="flex gap-1.5">
          <CommandButton label="/init" cmd="/init" color="#3b82f6" onClick={onCommand} />
          <CommandButton label="/boot-project" cmd="/boot-project" color="#06b6d4" onClick={onCommand} />
          <CommandButton label="/copia-setup" cmd="/copia-setup" color="#8b5cf6" onClick={onCommand} />
        </div>
      </div>

      {/* Scaletta fasi progetto */}
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => setExpandedPhase(expandedPhase ? null : 1)}
          className="flex items-center gap-1.5 w-full mb-2"
        >
          <span className="text-[7px] font-bold text-[#4a5575] tracking-[0.2em] uppercase">Scaletta</span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#1e2a45] to-transparent" />
          <span className="text-[8px] text-[#4a5575]">{expandedPhase ? '▼' : '▶'}</span>
        </button>

        {expandedPhase && (
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto scrollbar-thin pr-1">
            {phases.map((phase) => (
              <div
                key={phase.id}
                className={`flex items-center gap-2 px-2 py-1 rounded-lg border text-[9px] ${
                  phaseStatusStyle[phase.status]
                } transition-all`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold flex-shrink-0"
                  style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                  {phase.id}
                </span>
                <span className="flex-1 truncate">{phase.label}</span>
                <span className="text-[7px] font-bold uppercase tracking-wider flex-shrink-0">
                  {phase.status === 'completed' ? '✅' : phase.status === 'in_progress' ? '⚡' : '○'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CoordinatoreFooter({ progress, color, onCommand }: { progress: number; color: string; onCommand: (c: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  const phases = WORKFLOW_PHASES.map((p) => ({
    ...p,
    status: computePhaseStatus(progress, p.id),
    subtasks: p.subtasks.map((st) => ({
      ...st,
      status: (progress >= p.id * 20 ? 'completed' : progress >= p.id * 20 - 10 ? 'in_progress' : 'pending') as 'completed' | 'in_progress' | 'pending',
    })),
  }));

  return (
    <div style={{ borderTop: `1px solid ${color}15` }}>
      {/* Comandi Coordinatore */}
      <div className="px-3 pt-2.5 pb-1.5 flex flex-col gap-1.5">
        <p className="text-[7px] font-bold text-[#4a5575] tracking-[0.2em] uppercase px-0.5">Comandi</p>
        <div className="flex gap-1.5 flex-wrap">
          <CommandButton label="/analizza" cmd="/analizza progetto" color="#f97316" onClick={onCommand} />
          <CommandButton label="/goal" cmd="/goal" color="#3b82f6" onClick={onCommand} />
          <CommandButton label="/council" cmd="/council" color="#a855f7" onClick={onCommand} />
        </div>
      </div>

      {/* Dettaglio procedimento lavori */}
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 w-full mb-2"
        >
          <span className="text-[7px] font-bold text-[#4a5575] tracking-[0.2em] uppercase">Procedimento</span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#1e2a45] to-transparent" />
          <span className="text-[8px] text-[#4a5575]">{expanded ? '▼' : '▶'}</span>
        </button>

        {expanded && (
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
            {phases.map((phase) => (
              <div key={phase.id} className="flex flex-col gap-0.5">
                <div
                  className={`flex items-center gap-2 px-2 py-1 rounded-lg border text-[9px] ${
                    phaseStatusStyle[phase.status]
                  } transition-all`}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold flex-shrink-0"
                    style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                    {phase.id}
                  </span>
                  <span className="flex-1 truncate font-semibold">{phase.label}</span>
                  <span className="text-[7px] font-bold uppercase tracking-wider flex-shrink-0">
                    {phase.status === 'completed' ? '✅' : phase.status === 'in_progress' ? '⚡' : '○'}
                  </span>
                </div>

                {/* Subtask annidati */}
                {phase.subtasks.length > 0 && (
                  <div className="flex flex-col gap-0.5 ml-3 pl-2 border-l border-[#1e2a45]">
                    {phase.subtasks.map((st, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2 py-0.5">
                        <span className="text-[6px]">
                          {st.status === 'completed' ? '●' : st.status === 'in_progress' ? '◐' : '○'}
                        </span>
                        <span className="text-[8px] text-[#6a7595] truncate flex-1">{st.label}</span>
                        <span className={`text-[6px] font-bold uppercase ${
                          st.status === 'completed' ? 'text-green-400' :
                          st.status === 'in_progress' ? 'text-blue-400' : 'text-[#4a5575]'
                        }`}>
                          {st.status === 'completed' ? 'fatto' : st.status === 'in_progress' ? 'in corso' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatsFooter({ stats, color }: { stats: { completed: number; inProgress: number; waiting: number }; color: string }) {
  return (
    <div className="relative px-3 py-2.5 grid grid-cols-3 gap-1 mt-1" style={{ borderTop: `1px solid ${color}15` }}>
      {[
        { label: 'Completati', value: stats.completed },
        { label: 'In corso', value: stats.inProgress },
        { label: 'In attesa', value: stats.waiting },
      ].map((s) => (
        <div key={s.label} className="text-center">
          <p className="text-[7px] text-[#5a6585] tracking-wider mb-0.5 uppercase">{s.label}</p>
          <p className="text-lg font-black" style={{
            background: `linear-gradient(135deg, ${color}, ${color}88)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function WalkingWorker({ color }: { color: string }) {
  return (
    <div className="walking-worker" style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}>
      {/* Robotino che cammina */}
      <div className="body" style={{ color }}>
        👷‍♂️
      </div>
      {/* Scie luminose */}
      <div className="footprints">
        {[0,1,2,3,4].map((i) => (
          <div key={i} className="footprint" style={{ background: color }} />
        ))}
      </div>
    </div>
  );
}

export default function AgentCard({
  name,
  agentId,
  emoji,
  progress,
  color,
  status = 'OPERATIVO',
  activities,
  files,
  stats,
  sparkData,
  agentLogs = [],
  onCommand,
  onAgentClick,
  onStop,
}: AgentCardProps) {
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [agentLogs.length]);

  const statusGrad = statusGradients[status] ?? 'from-slate-400 to-gray-400';
  const isDirettore = name === 'Direttore' || agentId === 'direttore';
  const isCoordinatore = name === 'Coordinator' || agentId === 'coordinator';
  const isWorking = agentId ? (status === 'LAVORANDO' || status === 'WORKING') : false;

  return (
    <div
      className={`group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-0.5 ${isWorking ? 'animate-pulse-glow' : ''}`}
      style={{
        background: `linear-gradient(135deg, ${color}08, ${color}02)`,
        border: `1px solid ${isWorking ? `${color}60` : `${color}25`}`,
        boxShadow: isWorking
          ? `0 0 30px ${color}30, 0 0 60px ${color}15, 0 4px 20px rgba(0,0,0,0.3)`
          : `0 0 30px ${color}08, 0 4px 20px rgba(0,0,0,0.3)`,
        animation: isWorking ? 'pulseGlow 2s ease-in-out infinite' : 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}50`;
        e.currentTarget.style.boxShadow = `0 0 40px ${color}15, 0 0 80px ${color}08, 0 8px 32px rgba(0,0,0,0.4)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${color}25`;
        e.currentTarget.style.boxShadow = `0 0 30px ${color}08, 0 4px 20px rgba(0,0,0,0.3)`;
      }}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

      {/* Header — clickable apre dettaglio */}
      <div
        className="relative px-4 pt-4 pb-2 flex items-center gap-3 cursor-pointer"
        style={{ background: `linear-gradient(135deg, ${color}15, ${color}05)` }}
        onClick={() => onAgentClick?.(agentId ?? name)}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg transition-transform duration-300 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            boxShadow: `0 4px 15px ${color}40`,
          }}
        >
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-sm tracking-[0.15em] text-[#e8edf8] uppercase block truncate">{name}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${statusGrad}`} />
            <span className="text-[9px] font-semibold text-[#8a96b4] tracking-wider">{status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span
              className="text-2xl font-black tabular-nums"
              style={{ color, textShadow: `0 0 20px ${color}40` }}
            >
              {progress}
            </span>
            <span className="text-[9px] text-[#5a6585] block -mt-0.5">%</span>
          </div>
          {/* STOP button — sempre visibile */}
          {onStop && agentId && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onStop(agentId); }}
              title={isWorking ? 'Interrompi lavoro' : 'Nessun lavoro in corso'}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background: isWorking
                  ? 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.08))'
                  : 'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(239,68,68,0.03))',
                border: isWorking
                  ? '1px solid rgba(239,68,68,0.4)'
                  : '1px solid rgba(239,68,68,0.15)',
                color: isWorking ? '#ef4444' : '#5a2030',
                boxShadow: isWorking
                  ? '0 0 12px rgba(239,68,68,0.2)'
                  : '0 0 4px rgba(239,68,68,0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isWorking
                  ? 'linear-gradient(135deg, rgba(239,68,68,0.4), rgba(239,68,68,0.15))'
                  : 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))';
                e.currentTarget.style.boxShadow = isWorking
                  ? '0 0 20px rgba(239,68,68,0.3)'
                  : '0 0 8px rgba(239,68,68,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isWorking
                  ? 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.08))'
                  : 'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(239,68,68,0.03))';
                e.currentTarget.style.boxShadow = isWorking
                  ? '0 0 12px rgba(239,68,68,0.2)'
                  : '0 0 4px rgba(239,68,68,0.05)';
              }}
            >
              ⏹
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative px-4 pt-2 pb-1">
        <div className="h-1.5 rounded-full bg-[#1e2a45] overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${color}, ${color}dd, ${color}88)`,
              boxShadow: `0 0 12px ${color}60`,
            }}
          />
        </div>
      </div>

      {/* Sparkline */}
      <div className="relative px-3 py-1">
        <Sparkline data={sparkData} color={color} width={200} height={40} />
      </div>

      {/* Activities */}
      <div className="relative px-4 py-2 flex-1">
        <p className="text-[8px] font-semibold text-[#5a6585] tracking-[0.2em] mb-2 uppercase">Attività</p>
        <div className="flex flex-col gap-1">
          {activities.length === 0 ? (
            <span className="text-[9px] text-[#4a5575] italic px-1.5">Nessuna attività</span>
          ) : (
            activities.map((a, i) => (
              <div key={i} className="flex items-start justify-between gap-2 px-1.5 py-1 rounded-lg bg-[#ffffff04] hover:bg-[#ffffff08] transition-colors">
                <span className="text-[10px] text-[#8a96b4] leading-tight flex-1">{a.label}</span>
                <span className={`text-[8px] font-bold flex-shrink-0 tracking-wider ${activityColors[a.status] ?? 'text-amber-400'}`}>
                  [{a.status}]
                </span>
              </div>
            ))
          )}
          {files?.map((f, i) => (
            <div key={`f-${i}`} className="flex items-center gap-1.5 px-1.5 py-0.5">
              <span className="text-[9px]">📄</span>
              <span className="text-[9px] text-[#5a6585] font-mono truncate">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal output */}
      <div className="relative px-4 py-2">
        <p className="text-[8px] font-semibold text-[#5a6585] tracking-[0.2em] mb-1.5 uppercase">Output</p>
        <div
          ref={termRef}
          className="bg-[#080c14] rounded-xl p-2.5 max-h-[90px] overflow-y-auto border border-[#ffffff08]"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e2a45 transparent' }}
        >
          {agentLogs.length === 0 ? (
            <span className="text-[#4a5575] text-[9px] font-mono italic">In attesa di output...</span>
          ) : (
            agentLogs.map((log, i) => (
              <div key={i} className="flex gap-1.5 leading-relaxed">
                <span className="text-[#2a3a55] text-[8px] font-mono flex-shrink-0">{log.time}</span>
                <span className="text-[#6a7595] text-[8px] font-mono break-all">{log.msg}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Walking worker — solo quando lavora */}
      {isWorking && <WalkingWorker color={color} />}

      {/* Footer dinamico per tipo agente */}
      {isDirettore && onCommand ? (
        <DirettoreFooter progress={progress} color={color} onCommand={onCommand} />
      ) : isCoordinatore && onCommand ? (
        <CoordinatoreFooter progress={progress} color={color} onCommand={onCommand} />
      ) : (
        <StatsFooter stats={stats} color={color} />
      )}
    </div>
  );
}
