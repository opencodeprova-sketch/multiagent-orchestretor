import { useState, useEffect } from 'react';
import { useOrchestratorContext } from '../context/OrchestratorContext';

export default function BottomBar() {
  const { metrics, logs, messages, agentsList, settings } = useOrchestratorContext();
  const [showLogs, setShowLogs] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const cpuPct = metrics.cpu_percent ?? 0;
  const memUsed = metrics.memory_used_gb ?? 0;
  const memTotal = metrics.memory_total_gb ?? 1;
  const tpm = metrics.tokens_per_min ?? 0;
  const apiCalls = metrics.api_calls ?? 0;
  const cost = (apiCalls * 0.002).toFixed(4);
  const progress = metrics.project_progress ?? 0;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  const agentsWorking = agentsList.filter(a => a.status === 'working' || a.status === 'operational').length;
  const agentsTotal = agentsList.length;

  const exportReport = () => {
    const lines: string[] = [
      '=== OPENCODE AGENTIC ORCHESTRATOR — REPORT ===',
      `Data: ${new Date().toISOString()}`,
      '',
      '--- STATO PROGETTO ---',
      `Progresso: ${metrics.project_progress}%`,
      `Agenti attivi: ${agentsList.length}`,
      `Full Auto: ${settings.full_auto}`,
      `Approvazione umana: ${settings.human_approval}`,
      `Autonomia: ${settings.autonomy_level}`,
      '',
      '--- AGENTI ---',
    ];
    for (const a of agentsList) {
      lines.push(`  ${a.name}: ${a.status} (${a.progress}%) — completati: ${a.stats.completed}, in corso: ${a.stats.in_progress}, attesa: ${a.stats.waiting}`);
    }
    lines.push('', '--- CRONOLOGIA CHAT ---');
    for (const m of messages) {
      lines.push(`  [${m.time}] ${m.sender}: ${m.text}`);
    }
    lines.push('', '--- LOG SISTEMA ---');
    for (const l of logs) {
      lines.push(`  [${l.time}] ${l.agent}: ${l.msg}`);
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <footer className="h-8 flex items-center justify-between px-4 bg-[#0b0f19] border-t border-[#1e2a45] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${cpuPct > 70 ? 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]' : cpuPct > 40 ? 'bg-amber-400' : 'bg-green-400'}`} />
            <span className="text-[10px] text-[#5a6585] font-mono">CPU {cpuPct.toFixed(1)}%</span>
          </div>
          <span className="text-[#1e2a45]">|</span>
          <span className="text-[10px] text-[#5a6585] font-mono">RAM {memUsed.toFixed(1)}/{memTotal.toFixed(1)} GB</span>
          <span className="text-[#1e2a45]">|</span>
          <span className="text-[10px] text-[#5a6585] font-mono">⚡ {tpm} t/min</span>
          <span className="text-[#1e2a45]">|</span>
          <span className="text-[10px] text-[#5a6585] font-mono">$ {cost}</span>
          <span className="text-[#1e2a45]">|</span>
          <span className="text-[10px] text-[#5a6585] font-mono">⏱ {mm}:{ss}</span>
          <span className="text-[#1e2a45]">|</span>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-[#1e2a45] rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-blue-400 font-mono">{progress}%</span>
          </div>
          <span className="text-[#1e2a45]">|</span>
          <span className="text-[10px] text-[#5a6585] font-mono">{agentsWorking}/{agentsTotal} agenti</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Visualizza log attività"
            onClick={() => setShowLogs(true)}
            className="px-2.5 py-0.5 text-[9px] text-[#5a6585] hover:text-[#8a96b4] bg-[#161b27] border border-[#1e2a45] rounded-lg hover:bg-[#1e2a45] transition-all duration-150"
          >
            Log
          </button>
          <button
            type="button"
            aria-label="Esporta report"
            onClick={exportReport}
            className="px-2.5 py-0.5 text-[9px] text-[#5a6585] hover:text-[#8a96b4] bg-[#161b27] border border-[#1e2a45] rounded-lg hover:bg-[#1e2a45] transition-all duration-150"
          >
            Report
          </button>
        </div>
      </footer>

      {/* Log Modal */}
      {showLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-[#0f1525] to-[#0a0e1a] border border-[#1e2a45] rounded-2xl w-[600px] max-h-[80vh] flex flex-col shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e2a45]">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-[#e8edf8]">Log Attività</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLogs(false)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[#5a6585] hover:text-[#8a96b4] hover:bg-[#ffffff08] transition-all"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] scrollbar-thin">
              {logs.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-[#4a5575] italic">Nessun log disponibile</span>
                </div>
              ) : (
                logs.map((l, i) => (
                  <div key={i} className="flex gap-2 leading-relaxed px-1.5 py-0.5 rounded hover:bg-[#ffffff04] transition-colors">
                    <span className="text-[#2a3a55] flex-shrink-0 w-12">{l.time}</span>
                    <span className="flex-shrink-0 w-20 truncate font-semibold" style={{ color: l.color }}>{l.agent}</span>
                    <span className="text-[#6a7595] break-all">{l.msg}</span>
                  </div>
                ))
              )}
            </div>
            <div className="px-5 py-2.5 border-t border-[#1e2a45] flex justify-between items-center">
              <span className="text-[9px] text-[#4a5575] font-mono">{logs.length} voci totali</span>
              <button
                type="button"
                onClick={() => setShowLogs(false)}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-lg text-[10px] font-semibold text-white transition-all duration-200 shadow-lg shadow-blue-500/20"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
