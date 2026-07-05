interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className={`flex items-center justify-between gap-3 ${disabled ? 'opacity-50' : 'cursor-pointer'} group`}>
      <span className="text-[10px] font-semibold text-[#8a96b4] tracking-wide uppercase group-hover:text-[#a8b4d4] transition-colors">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-all duration-300 flex-shrink-0 ${
          checked ? 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-[#2a3352]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-lg transition-all duration-300 ${
            checked ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </button>
    </label>
  );
}

function PanelCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-b from-[#0f1525] to-[#0b0f19] border border-[#1e2a45] rounded-2xl p-3 shadow-lg">
      <h3 className="text-[9px] font-bold text-[#4a5575] tracking-[0.2em] uppercase mb-3">{title}</h3>
      {children}
    </div>
  );
}

interface AutonomyPanelProps {
  autonomyLevel: 'low' | 'medium' | 'high';
  fullAuto: boolean;
  humanApproval: boolean;
  connected: boolean;
  onAutonomyChange: (level: 'low' | 'medium' | 'high') => void;
  onFullAutoChange: (value: boolean) => void;
  onHumanApprovalChange: (value: boolean) => void;
}

const levelLabels = { low: 'BASSA', medium: 'MEDIA', high: 'ALTA' };
const levelIndex = { low: 0, medium: 1, high: 2 };

export function AutonomyPanel({
  autonomyLevel,
  fullAuto,
  humanApproval,
  connected,
  onAutonomyChange,
  onFullAutoChange,
  onHumanApprovalChange,
}: AutonomyPanelProps) {
  const levels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

  return (
    <PanelCard title="Livello Autonomia">
      <div className="mb-4">
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          disabled={!connected}
          value={levelIndex[autonomyLevel]}
          onChange={(e) => onAutonomyChange(levels[parseInt(e.target.value, 10)])}
          className="w-full accent-blue-500 disabled:opacity-50"
        />
        <div className="mt-1 flex justify-between text-[9px] text-[#4a5575]">
          <span>BASSA</span>
          <span className="font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{levelLabels[autonomyLevel]}</span>
          <span>ALTA</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <Toggle
          checked={fullAuto}
          disabled={!connected}
          label="Full Auto"
          onChange={onFullAutoChange}
        />
        <Toggle
          checked={humanApproval}
          disabled={!connected}
          label="Approvazione Umana"
          onChange={onHumanApprovalChange}
        />
      </div>
    </PanelCard>
  );
}

interface SyncPanelProps {
  connected: boolean;
  opencodeInstalled: boolean;
  lastSync: string;
  onSync: () => void;
}

export function SyncPanel({ connected, opencodeInstalled, lastSync, onSync }: SyncPanelProps) {
  return (
    <PanelCard title="Sync con OpenCode">
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className={`w-2 h-2 rounded-full ${
          connected && opencodeInstalled ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]'
        }`} />
        <span className={`text-[11px] font-semibold ${connected && opencodeInstalled ? 'text-green-400' : connected ? 'text-amber-400' : 'text-red-400'}`}>
          {connected && opencodeInstalled ? 'Connesso' : connected ? 'Backend OK' : 'Disconnesso'}
        </span>
      </div>

      <p className="text-[9px] text-[#4a5575] mb-3 font-mono">Ultimo sync: {lastSync}</p>

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={onSync}
          disabled={!connected}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-xl text-[11px] font-semibold text-white shadow-lg shadow-blue-500/20"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Sincronizza
        </button>
      </div>
    </PanelCard>
  );
}
