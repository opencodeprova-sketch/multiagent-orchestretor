import { useEffect } from 'react';
import { STATUS_DOT, STATUS_PANEL_LABEL } from '../data/mockup';
import { useOrchestratorContext } from '../context/OrchestratorContext';
import { AutonomyPanel, SyncPanel } from './SyncPanel';
import type { ProjectFile } from '../types/orchestrator';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTree({ files, depth = 0 }: { files: ProjectFile[]; depth?: number }) {
  if (!files.length) return null;
  return (
    <div className={depth > 0 ? 'ml-3' : ''}>
      {files.map((f) => (
        <div key={f.path} className="flex items-center gap-1.5 py-0.5 group/file hover:bg-[#ffffff05] rounded-lg px-1.5 transition-colors">
          <span className="text-[10px] flex-shrink-0">{f.type === 'dir' ? '📁' : '📄'}</span>
          <span className="text-[10px] text-[#c8d0e0] truncate">{f.name}</span>
          {f.type === 'file' && f.size != null && (
            <span className="text-[8px] text-[#4a5575] ml-auto flex-shrink-0 opacity-0 group-hover/file:opacity-100 transition-opacity font-mono">{formatSize(f.size)}</span>
          )}
          {f.type === 'dir' && f.children && f.children.length > 0 && (
            <span className="text-[8px] text-[#4a5575] ml-auto flex-shrink-0 font-mono">{f.children.length}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function PanelCard({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-b from-[#0f1525] to-[#0b0f19] border border-[#1e2a45] rounded-2xl p-3 shadow-lg high-contrast panel-card">
      <div className="flex items-center gap-2 mb-2.5">
        {icon && <span className="text-sm">{icon}</span>}
        <h3 className="text-[9px] font-bold text-[#4a5575] tracking-[0.2em] uppercase">{title}</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[#1e2a45] to-transparent" />
      </div>
      {children}
    </div>
  );
}

export default function ControlPanel() {
  const {
    connected,
    opencodeInstalled,
    settings,
    agentsList,
    updateSettings,
    syncFromOpencode,
    pendingProposal,
    approveCommand,
    rejectCommand,
    projectInfo,
    getProjectFiles,
  } = useOrchestratorContext();

  useEffect(() => {
    getProjectFiles();
  }, [getProjectFiles]);

  // Agenti attivi (solo quelli in working)
  const activeAgents = agentsList.filter((a) => a.status === 'working' || a.status === 'operational');

  return (
    <aside className="w-56 bg-[#0b0f19] border-l border-[#1e2a45] flex flex-col gap-3 p-3 flex-shrink-0 overflow-y-auto scrollbar-thin high-contrast">
      {/* Info Progetto */}
      <PanelCard title="Progetto" icon="📦">
        {projectInfo ? (
          <>
            <div className="text-xs font-bold text-[#e8edf8] truncate mb-0.5">{projectInfo.name}</div>
            <div className="text-[8px] text-[#4a5575] font-mono truncate mb-2.5">{projectInfo.path}</div>
            <div className="border-t border-[#1e2a45] pt-2 max-h-48 overflow-y-auto scrollbar-thin">
              <div className="text-[8px] text-[#4a5575] mb-1.5 font-mono">{projectInfo.files.length} elementi</div>
              <FileTree files={projectInfo.files} />
            </div>
          </>
        ) : (
          <div className="text-[10px] text-[#4a5575] italic">Nessun progetto aperto</div>
        )}
      </PanelCard>

      {/* Agenti attivi (solo se qualcuno sta lavorando) */}
      {activeAgents.length > 0 && (
        <PanelCard title="Agenti Attivi" icon="⚡">
          <div className="flex flex-col gap-1.5 high-contrast">
            {activeAgents.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-1.5 py-1 rounded-lg bg-[#ffffff04]">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[a.status] ?? 'bg-green-400'}`} />
                  <span className="text-[11px] text-[#8a96b4] truncate">{a.name}</span>
                </div>
                <span className="text-[9px] text-[#5a6585] font-mono">{STATUS_PANEL_LABEL[a.status] ?? a.status}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      )}

      {/* Autonomia */}
      <AutonomyPanel
        autonomyLevel={settings.autonomy_level}
        fullAuto={settings.full_auto}
        humanApproval={settings.human_approval}
        connected={connected}
        onAutonomyChange={(level) => updateSettings({ autonomy_level: level })}
        onFullAutoChange={(full_auto) => updateSettings({ full_auto, human_approval: full_auto ? false : settings.human_approval })}
        onHumanApprovalChange={(human_approval) => updateSettings({ human_approval, full_auto: human_approval ? false : settings.full_auto })}
      />

      {/* Sync */}
      <SyncPanel
        connected={connected}
        opencodeInstalled={opencodeInstalled}
        lastSync={settings.last_sync}
        onSync={syncFromOpencode}
      />

      {/* Approvazione comando */}
      {pendingProposal && (
        <div className="bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/30 rounded-2xl p-2 shadow-lg high-contrast blink-attention">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-sm">⚠️</span>
            <p className="text-[9px] text-orange-400 font-bold">Approvazione richiesta</p>
          </div>
          <p className="text-[8px] text-[#8a96b4] mb-2 truncate px-1">
            {pendingProposal.agent_name}: opencode {pendingProposal.command}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => approveCommand(pendingProposal.id)}
              className="flex-1 py-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-lg text-[9px] font-semibold text-white shadow-lg shadow-green-500/20 transition-all duration-200"
            >
              Approva
            </button>
            <button
              type="button"
              onClick={() => rejectCommand(pendingProposal.id, 'Rifiutato')}
              className="flex-1 py-1 bg-gradient-to-r from-red-600/80 to-rose-600/80 hover:from-red-500 hover:to-rose-500 rounded-lg text-[9px] font-semibold text-white transition-all duration-200"
            >
              Rifiuta
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
