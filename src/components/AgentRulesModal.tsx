import { useEffect, useRef } from 'react';
import { useOrchestratorContext } from '../context/OrchestratorContext';

const defaultColors: Record<string, string> = {
  manager: '#f97316', architect: '#3b82f6', coder: '#22c55e', tester: '#a855f7',
  direttore: '#f97316', coordinator: '#f97316',
};

export default function AgentRulesModal({
  agentId,
  onClose,
}: {
  agentId: string;
  onClose: () => void;
}) {
  const { opencodeConfig } = useOrchestratorContext();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const agentData = opencodeConfig?.agents?.[agentId];
  const color = defaultColors[agentId] ?? '#6366f1';
  const name = agentData?.name ?? agentId;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Regole agente ${name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="relative w-[620px] max-h-[85vh] flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
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
          aria-label={`Chiudi regole ${name}`}
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 hover:scale-110"
          style={{ background: `${color}20`, border: `1px solid ${color}30`, color }}
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
              {name}
            </span>
            <span className="text-[10px] text-[#6a7595] font-mono">ID: {agentId}</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div
          className="relative flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e2a45 transparent' }}
        >
          {/* Descrizione e Regole */}
          <div>
            <p className="text-[8px] font-semibold text-[#5a6585] tracking-[0.2em] mb-2 uppercase">Descrizione & Regole</p>
            {agentData?.content ? (
              <div
                className="bg-[#080c14] rounded-xl p-4 border border-[#ffffff08] text-[11px] text-[#a8b4d4] font-mono leading-relaxed whitespace-pre-wrap"
                style={{ maxHeight: '55vh', overflowY: 'auto' }}
              >
                {agentData.content}
              </div>
            ) : (
              <div className="bg-[#080c14] rounded-xl p-4 border border-[#ffffff08] text-[11px] text-[#4a5575] italic">
                Nessuna descrizione o regole disponibile per questo agente.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
