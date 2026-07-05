import { useEffect } from 'react';
import { useOrchestratorContext } from '../context/OrchestratorContext';
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
        <div key={f.path} className="flex items-center gap-1.5 py-0.5">
          <span className="text-[10px]">{f.type === 'dir' ? '📁' : '📄'}</span>
          <span className="text-[11px] text-[#c8d0e0] truncate">{f.name}</span>
          {f.type === 'file' && f.size != null && (
            <span className="text-[9px] text-[#5a6585] ml-auto flex-shrink-0">{formatSize(f.size)}</span>
          )}
          {f.type === 'dir' && f.children && f.children.length > 0 && (
            <span className="text-[9px] text-[#5a6585] ml-auto flex-shrink-0">{f.children.length} items</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ProjectInfo() {
  const { projectInfo, getProjectFiles } = useOrchestratorContext();

  useEffect(() => {
    getProjectFiles();
  }, [getProjectFiles]);

  if (!projectInfo) {
    return (
      <div className="flex items-center justify-center h-16 flex-shrink-0 rounded-xl border border-dashed border-[#1e2a45]">
        <span className="text-[11px] text-[#5a6585]">Nessun progetto aperto — seleziona o crea un progetto</span>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 rounded-xl border border-[#1e2a45] bg-[#0d1220] overflow-hidden">
      {/* Header: nome + percorso */}
      <div className="px-4 py-2.5 border-b border-[#1e2a45] flex items-center gap-3">
        <span className="text-xs">📁</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-[#e8edf8] truncate">{projectInfo.name}</div>
          <div className="text-[10px] text-[#5a6585] truncate">{projectInfo.path}</div>
        </div>
        <span className="text-[9px] text-[#5a6585]">{projectInfo.files.length} elementi</span>
      </div>

      {/* File tree */}
      <div className="px-4 py-2 max-h-40 overflow-y-auto scrollbar-thin">
        <FileTree files={projectInfo.files} />
      </div>
    </div>
  );
}
