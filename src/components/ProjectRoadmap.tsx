import { useState } from 'react';
import { ROADMAP_PHASES } from '../data/mockup';

const phaseStatusStyle = {
  completed: { label: 'COMPLETATO', class: 'text-green-400' },
  in_progress: { label: 'IN CORSO', class: 'text-blue-400' },
  waiting: { label: 'IN ATTESA', class: 'text-[#5a6585]' },
};

const subStatusStyle = {
  completed: 'text-green-400',
  in_progress: 'text-blue-400',
  waiting: 'text-[#5a6585]',
};

const subStatusLabel = {
  completed: 'Completato',
  in_progress: 'In corso',
  waiting: 'In attesa',
};

type PhaseStatus = 'completed' | 'in_progress' | 'waiting';

function computePhaseStatus(progress: number, phaseId: number): PhaseStatus {
  switch (phaseId) {
    case 1: return progress >= 15 ? 'completed' : progress > 0 ? 'in_progress' : 'waiting';
    case 2: return progress >= 40 ? 'completed' : progress >= 15 ? 'in_progress' : 'waiting';
    case 3: return progress >= 75 ? 'completed' : progress >= 40 ? 'in_progress' : 'waiting';
    case 4: return progress >= 90 ? 'completed' : progress >= 75 ? 'in_progress' : 'waiting';
    case 5: return progress >= 100 ? 'completed' : progress >= 90 ? 'in_progress' : 'waiting';
    default: return 'waiting';
  }
}

interface ProjectRoadmapProps {
  projectProgress?: number;
}

export default function ProjectRoadmap({ projectProgress }: ProjectRoadmapProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 2: true });
  const hasProgress = projectProgress !== undefined;
  const pct = hasProgress ? Math.min(100, Math.max(0, projectProgress!)) : 0;

  const phases = ROADMAP_PHASES.map((phase) => ({
    ...phase,
    status: hasProgress ? computePhaseStatus(pct, phase.id) : phase.status,
  }));

  return (
    <div className="flex flex-col h-full bg-[#0f1525] border border-[#1e2a45] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1e2a45] flex-shrink-0">
        <h3 className="text-xs font-semibold text-[#e8edf8]">Scaletta Operativa del Progetto</h3>
      </div>

      {/* Progress bar */}
      {hasProgress && (
        <div className="px-4 pt-3 pb-1 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#8a96b4]">Progresso complessivo</span>
            <span className="text-[10px] font-bold text-[#e8edf8]">{pct}%</span>
          </div>
          <div className="h-1.5 bg-[#1a2540] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
        {phases.map((phase) => {
          const style = phaseStatusStyle[phase.status];
          const hasSub = phase.subtasks.length > 0;
          const isExpanded = expanded[phase.id];

          return (
            <div key={phase.id} className="mb-2">
              <button
                type="button"
                onClick={() => hasSub && setExpanded((p) => ({ ...p, [phase.id]: !p[phase.id] }))}
                className="flex items-center gap-2 w-full text-left py-1.5 hover:bg-[#161b27] rounded px-1 transition-colors"
              >
                {hasSub ? (
                  <span className="text-[9px] text-[#5a6585] w-3">{isExpanded ? '▼' : '▶'}</span>
                ) : (
                  <span className="w-3" />
                )}
                <span className="w-5 h-5 rounded-full bg-[#1a2540] flex items-center justify-center text-[10px] font-bold text-[#5a6585] flex-shrink-0">
                  {phase.id}
                </span>
                <span className="text-[11px] text-[#e8edf8] flex-1">{phase.label}</span>
                <span className={`text-[9px] font-bold tracking-wide ${style.class}`}>{style.label}</span>
              </button>

              {isExpanded && hasSub && (
                <div className="ml-10 mt-1 flex flex-col gap-1 border-l border-[#1e2a45] pl-3">
                  {phase.subtasks.map((sub, i) => (
                    <div key={i} className="flex items-center justify-between py-0.5">
                      <span className="text-[10px] text-[#8a96b4]">{sub.label}</span>
                      <span className={`text-[9px] ${subStatusStyle[sub.status]}`}>
                        {subStatusLabel[sub.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
