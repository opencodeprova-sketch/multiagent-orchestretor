import { useState, useRef, useCallback, useEffect } from 'react';
import { useOrchestratorContext } from '../context/OrchestratorContext';

export default function TopBar({ memoryTrigger = 0 }: { memoryTrigger?: number }) {
  const {
    connected,
    opencodeInstalled,
    metrics,
    settings,
    updateSettings,
    saveProject,
    createAgent,
    syncFromOpencode,
    send,
    sendChat,
    projectMemory,
    globalRules,
    globalMemory,
    projectRules,
    saveMemory,
    saveGlobalRules,
    saveGlobalMemory,
    saveProjectRules,
  } = useOrchestratorContext();

  const [showSettings, setShowSettings] = useState(false);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectPath, setNewProjectPath] = useState('');
  const [projectDir, setProjectDir] = useState(settings.project_dir ?? '');
  const folderPickerRef = useRef<HTMLInputElement>(null);

  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('');
  const [agentTask, setAgentTask] = useState('');

  // Temperature
  const [tempSlider, setTempSlider] = useState(settings.temperature ?? 0.7);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Memory / Rules — 4 campi
  const [globalRulesText, setGlobalRulesText] = useState('');
  const [globalMemoryText, setGlobalMemoryText] = useState('');
  const [projectMemoryText, setProjectMemoryText] = useState('');
  const [projectRulesText, setProjectRulesText] = useState('');
  const [globalRulesSaved, setGlobalRulesSaved] = useState(false);
  const [globalMemorySaved, setGlobalMemorySaved] = useState(false);
  const [projectMemorySaved, setProjectMemorySaved] = useState(false);
  const [projectRulesSaved, setProjectRulesSaved] = useState(false);

  // Apre modale quando triggerato dalla sidebar
  useEffect(() => {
    if (memoryTrigger > 0) handleOpenMemory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoryTrigger]);

  // File upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<'projectMemory' | 'projectRules' | null>(null);

  const progress = metrics.project_progress || 0;
  const displayTemp = settings.temperature ?? 0.7;

  const handleSaveSettings = () => {
    updateSettings({
      project_dir: projectDir,
    });
    setShowSettings(false);
  };

  const handleTempChange = useCallback((value: number) => {
    setTempSlider(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSettings({ temperature: value });
    }, 500);
  }, [updateSettings]);

  const handleCreateAgent = () => {
    if (!agentName.trim() || !agentRole.trim()) return;
    createAgent(agentName.trim(), agentRole.trim(), agentTask.trim());
    setAgentName('');
    setAgentRole('');
    setAgentTask('');
    setShowCreateAgent(false);
  };

  const handleOpenMemory = () => {
    setGlobalRulesText(globalRules);
    setGlobalMemoryText(globalMemory);
    setProjectMemoryText(projectMemory);
    setProjectRulesText(projectRules);
    setGlobalRulesSaved(false);
    setGlobalMemorySaved(false);
    setProjectMemorySaved(false);
    setProjectRulesSaved(false);
    setShowMemory(true);
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (uploadTarget === 'projectMemory') {
        setProjectMemoryText(content);
        setProjectMemorySaved(false);
      } else if (uploadTarget === 'projectRules') {
        setProjectRulesText(content);
        setProjectRulesSaved(false);
      }
    };
    reader.readAsText(file);
    setUploadTarget(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [uploadTarget]);

  const triggerUpload = (target: 'projectMemory' | 'projectRules') => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  // Project folder picker
  const projectPickerRef = useRef<HTMLInputElement>(null);

  const handleProjectPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    // Get the first file's path to extract the folder
    const relativePath = files[0].webkitRelativePath || files[0].name;
    const folderPath = relativePath.split('/')[0];
    // Send /boot-progetto command via chat
    sendChat(`/boot-progetto ${folderPath}`, 'coder');
    // Reset input
    if (projectPickerRef.current) projectPickerRef.current.value = '';
  }, [send, sendChat]);

  return (
    <header className="h-11 flex items-center gap-3 px-4 bg-[#0b0f19] border-b border-[#1e2a45] flex-shrink-0">
      {/* Logo + title */}
      <div className="flex items-center gap-2 min-w-fit">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-sm">
          ⚡
        </div>
        <span className="text-sm font-semibold text-[#e8edf8] whitespace-nowrap">
          Opencode Agentic Orchestrator
        </span>
        <span className="text-[10px] text-[#5a6585] bg-[#161b27] px-1.5 py-0.5 rounded">v0.2.0</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        {/* Model Selector */}
        <div className="relative">
          <select
            value={settings.model ?? 'auto'}
            onChange={(e) => updateSettings({ model: e.target.value })}
            disabled={!connected}
            className="bg-[#0a0a0a] border border-white/30 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder:text-[#5a6585] outline-none focus:border-blue-400/50 disabled:opacity-50 max-w-[160px] transition-all appearance-none bg-no-repeat bg-right pr-8"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundPosition: 'right 6px center',
            }}
          >
            <option value="auto">Auto</option>
            <option value="qwen3-coder-30b">Qwen3 Coder 30B</option>
            <option value="qwen2.5-70b">Qwen 2.5 70B</option>
            <option value="granite-3.3">Granite 3.3</option>
            <option value="llama-3.3-70b">Llama 3.3 70B</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => setShowNewProject(true)}
          className="px-2.5 py-1 text-[11px] text-[#8a96b4] hover:text-[#e8edf8] hover:bg-[#161b27] rounded transition-colors whitespace-nowrap"
        >
          Nuovo Progetto
        </button>
        <button
          type="button"
          onClick={() => saveProject()}
          className="px-2.5 py-1 text-[11px] text-[#8a96b4] hover:text-[#e8edf8] hover:bg-[#161b27] rounded transition-colors whitespace-nowrap"
        >
          Salva
        </button>
        <button
          type="button"
          onClick={() => {
            console.log('🔄 CLICK: Sincronizza ora button clicked, calling syncFromOpencode()');
            syncFromOpencode();
          }}
          className="px-2.5 py-1 text-[11px] text-[#8a96b4] hover:text-[#e8edf8] hover:bg-[#161b27] rounded transition-colors whitespace-nowrap"
          title="Sincronizza con OpenCode"
        >
          🔄 Sincronizza ora
        </button>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="px-2.5 py-1 text-[11px] text-[#8a96b4] hover:text-[#e8edf8] hover:bg-[#161b27] rounded transition-colors whitespace-nowrap"
        >
          Impostazioni Globali
        </button>
        {/* Project Opener */}
        <div className="relative">
          <button
            type="button"
            onClick={() => projectPickerRef.current?.click()}
            className="px-2.5 py-1 text-[11px] text-[#8a96b4] hover:text-[#e8edf8] hover:bg-[#161b27] rounded transition-colors whitespace-nowrap"
            title="Apri cartella progetto (native picker)"
          >
            📁 Apri Progetto
          </button>
          <input
            ref={projectPickerRef}
            type="file"
            // @ts-expect-error - webkitdirectory non-standard attr for dir picker
            webkitdirectory=""
            directory=""
            multiple={false}
            className="hidden"
            onChange={handleProjectPick}
          />
        </div>
      </div>

      {/* Project progress */}
      <div className="flex-1 flex items-center gap-3 px-4 min-w-0">
        <span className="text-[9px] font-semibold text-[#5a6585] tracking-widest whitespace-nowrap">
          PROGRESSO PROGETTO
        </span>
        <div className="flex-1 h-1.5 bg-[#1e2a45] rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-bold text-[#e8edf8] w-8 text-right">{progress}%</span>
      </div>

      {/* Temperature display */}
      <span className="text-[11px] font-mono text-[#5a6585] whitespace-nowrap">
        T: {Number(displayTemp).toFixed(1)}
      </span>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-2 py-1 text-[10px] text-[#8a96b4] hover:text-[#e8edf8] hover:bg-[#161b27] rounded transition-colors whitespace-nowrap"
        >
          Carica file (globale)
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.json"
          className="hidden"
          onChange={handleFileUpload}
        />
        <button
          type="button"
          onClick={() => setShowCreateAgent(true)}
          className="px-2 py-1 text-[10px] text-[#8a96b4] hover:text-[#e8edf8] hover:bg-[#161b27] rounded transition-colors whitespace-nowrap"
        >
          Crea Nuovo Agente
        </button>
        <button
          type="button"
          onClick={handleOpenMemory}
          className="px-2 py-1 text-[10px] text-[#8a96b4] hover:text-[#e8edf8] hover:bg-[#161b27] rounded transition-colors whitespace-nowrap"
        >
          Memoria e Regole
        </button>
        <div className="flex items-center gap-1.5 px-2 py-1 ml-1">
          <div className={`w-2 h-2 rounded-full ${connected && opencodeInstalled ? 'bg-green-400' : connected ? 'bg-orange-400' : 'bg-red-400'}`} />
          <span className="text-[11px] text-[#8a96b4]">
            {connected ? 'Connesso' : 'Disconnesso'}
          </span>
        </div>
        <button type="button" aria-label="Impostazioni" onClick={() => setShowSettings(true)} className="p-1.5 text-[#5a6585] hover:text-[#8a96b4] rounded">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0f1525] border border-[#1e2a45] rounded-xl p-5 w-[380px] shadow-2xl">
            <h3 className="text-sm font-bold text-[#e8edf8] mb-4">Impostazioni Globali</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-[#5a6585] tracking-widest block mb-1">
                  TEMPERATURA — <span className="text-[#e8edf8]">{Number(tempSlider).toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={tempSlider}
                  onChange={(e) => handleTempChange(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#5a6585] tracking-widest block mb-1">CARTELLA PROGETTO</label>
                <input
                  type="text"
                  value={projectDir}
                  onChange={(e) => setProjectDir(e.target.value)}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-1.5 text-xs text-[#e8edf8] outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-[11px] text-white font-semibold"
              >
                Salva
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="flex-1 py-1.5 bg-[#1e2a45] hover:bg-[#2a3a60] rounded-lg text-[11px] text-[#8a96b4]"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreateAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0f1525] border border-[#1e2a45] rounded-xl p-5 w-[380px] shadow-2xl">
            <h3 className="text-sm font-bold text-[#e8edf8] mb-4">Crea Nuovo Agente</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-[#5a6585] tracking-widest block mb-1">NOME AGENTE</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="es. SecurityReviewer"
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-1.5 text-xs text-[#e8edf8] outline-none focus:border-blue-500 placeholder-[#334066]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#5a6585] tracking-widest block mb-1">RUOLO</label>
                <input
                  type="text"
                  value={agentRole}
                  onChange={(e) => setAgentRole(e.target.value)}
                  placeholder="es. Analisi sicurezza e vulnerability assessment"
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-1.5 text-xs text-[#e8edf8] outline-none focus:border-blue-500 placeholder-[#334066]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#5a6585] tracking-widest block mb-1">TASK INIZIALE</label>
                <input
                  type="text"
                  value={agentTask}
                  onChange={(e) => setAgentTask(e.target.value)}
                  placeholder="es. Analizza il progetto per vulnerabilità"
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-1.5 text-xs text-[#e8edf8] outline-none focus:border-blue-500 placeholder-[#334066]"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={handleCreateAgent}
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-[11px] text-white font-semibold"
              >
                Crea
              </button>
              <button
                type="button"
                onClick={() => setShowCreateAgent(false)}
                className="flex-1 py-1.5 bg-[#1e2a45] hover:bg-[#2a3a60] rounded-lg text-[11px] text-[#8a96b4]"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Memory & Rules Modal — 2 gruppi: Globali + Progetto */}
      {showMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className="relative rounded-2xl p-6 w-[600px] max-h-[90vh] flex flex-col shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #0f1525, #0a0e1a)',
              border: '1px solid #1e2a45',
              boxShadow: '0 0 60px rgba(59,130,246,0.08)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-2xl" />

            <div className="relative flex flex-col flex-1 min-h-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-sm font-bold text-[#e8edf8] tracking-wide">Memoria e Regole</h3>
                <button
                  type="button"
                  aria-label="Chiudi memoria e regole"
                  onClick={() => setShowMemory(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 hover:scale-110"
                  style={{ background: '#1e2a4520', border: '1px solid #1e2a4550', color: '#5a6585' }}
                >
                  ✕
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto space-y-5 pr-1 scrollbar-thin"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e2a45 transparent' }}>

                {/* ─── GRUPPO GLOBALE (da OpenCode) ─── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[8px] font-bold text-[#4a5575] tracking-[0.25em] uppercase bg-[#ffffff05] px-2 py-1 rounded-lg border border-[#1e2a45]">
                      📡 Globali — da OpenCode
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#1e2a45] to-transparent" />
                  </div>

                  {/* Global Rules */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                      <label className="text-[9px] font-bold text-[#5a6585] tracking-[0.2em] uppercase">Regole Globali</label>
                      <div className="flex-1 h-px bg-gradient-to-r from-[#1e2a45] to-transparent" />
                      {globalRulesSaved && <span className="text-[8px] text-green-400 font-semibold">✓</span>}
                    </div>
                    <textarea
                      rows={3}
                      value={globalRulesText}
                      onChange={(e) => { setGlobalRulesText(e.target.value); setGlobalRulesSaved(false); }}
                      className="w-full bg-[#080c14] border border-[#1e2a45] rounded-xl px-3 py-2 text-[11px] text-[#c8d0e0] outline-none focus:border-purple-500/50 focus:shadow-[0_0_12px_rgba(168,85,247,0.08)] resize-y font-mono leading-relaxed transition-all"
                      placeholder="# Regole Globali..."
                    />
                    <div className="flex justify-end mt-1">
                      <button type="button" onClick={() => { saveGlobalRules(globalRulesText); setGlobalRulesSaved(true); }}
                        className="px-2.5 py-1 text-[8px] font-bold tracking-wider uppercase rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.1))', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}>
                        {globalRulesSaved ? '✓ Salvato' : 'Salva'}
                      </button>
                    </div>
                  </div>

                  {/* Global Memory */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-400 shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
                      <label className="text-[9px] font-bold text-[#5a6585] tracking-[0.2em] uppercase">Memoria Globale</label>
                      <div className="flex-1 h-px bg-gradient-to-r from-[#1e2a45] to-transparent" />
                      {globalMemorySaved && <span className="text-[8px] text-green-400 font-semibold">✓</span>}
                    </div>
                    <textarea
                      rows={3}
                      value={globalMemoryText}
                      onChange={(e) => { setGlobalMemoryText(e.target.value); setGlobalMemorySaved(false); }}
                      className="w-full bg-[#080c14] border border-[#1e2a45] rounded-xl px-3 py-2 text-[11px] text-[#c8d0e0] outline-none focus:border-violet-500/50 focus:shadow-[0_0_12px_rgba(139,92,246,0.08)] resize-y font-mono leading-relaxed transition-all"
                      placeholder="# Memoria Globale..."
                    />
                    <div className="flex justify-end mt-1">
                      <button type="button" onClick={() => { saveGlobalMemory(globalMemoryText); setGlobalMemorySaved(true); }}
                        className="px-2.5 py-1 text-[8px] font-bold tracking-wider uppercase rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.1))', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}>
                        {globalMemorySaved ? '✓ Salvato' : 'Salva'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ─── GRUPPO PROGETTO (user-defined) ─── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[8px] font-bold text-[#4a5575] tracking-[0.25em] uppercase bg-[#ffffff05] px-2 py-1 rounded-lg border border-[#1e2a45]">
                      📁 Progetto — scrivi o carica .md
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#1e2a45] to-transparent" />
                  </div>

                  {/* Project Memory */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                      <label className="text-[9px] font-bold text-[#5a6585] tracking-[0.2em] uppercase">Memoria Progetto</label>
                      <div className="flex-1 h-px bg-gradient-to-r from-[#1e2a45] to-transparent" />
                      {projectMemorySaved && <span className="text-[8px] text-green-400 font-semibold">✓</span>}
                    </div>
                    <textarea
                      rows={3}
                      value={projectMemoryText}
                      onChange={(e) => { setProjectMemoryText(e.target.value); setProjectMemorySaved(false); }}
                      className="w-full bg-[#080c14] border border-[#1e2a45] rounded-xl px-3 py-2 text-[11px] text-[#c8d0e0] outline-none focus:border-blue-500/50 focus:shadow-[0_0_12px_rgba(59,130,246,0.08)] resize-y font-mono leading-relaxed transition-all"
                      placeholder="# Memoria del Progetto..."
                    />
                    <div className="flex justify-end gap-1.5 mt-1">
                      <button type="button" onClick={() => triggerUpload('projectMemory')}
                        className="px-2.5 py-1 text-[8px] font-bold tracking-wider uppercase rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                        📂 Carica .md
                      </button>
                      <button type="button" onClick={() => { saveMemory(projectMemoryText); setProjectMemorySaved(true); }}
                        className="px-2.5 py-1 text-[8px] font-bold tracking-wider uppercase rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.1))', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                        {projectMemorySaved ? '✓ Salvato' : 'Salva'}
                      </button>
                    </div>
                  </div>

                  {/* Project Rules */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                      <label className="text-[9px] font-bold text-[#5a6585] tracking-[0.2em] uppercase">Regole Progetto</label>
                      <div className="flex-1 h-px bg-gradient-to-r from-[#1e2a45] to-transparent" />
                      {projectRulesSaved && <span className="text-[8px] text-green-400 font-semibold">✓</span>}
                    </div>
                    <textarea
                      rows={3}
                      value={projectRulesText}
                      onChange={(e) => { setProjectRulesText(e.target.value); setProjectRulesSaved(false); }}
                      className="w-full bg-[#080c14] border border-[#1e2a45] rounded-xl px-3 py-2 text-[11px] text-[#c8d0e0] outline-none focus:border-emerald-500/50 focus:shadow-[0_0_12px_rgba(52,211,153,0.08)] resize-y font-mono leading-relaxed transition-all"
                      placeholder="# Regole del Progetto..."
                    />
                    <div className="flex justify-end gap-1.5 mt-1">
                      <button type="button" onClick={() => triggerUpload('projectRules')}
                        className="px-2.5 py-1 text-[8px] font-bold tracking-wider uppercase rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                        📂 Carica .md
                      </button>
                      <button type="button" onClick={() => { saveProjectRules(projectRulesText); setProjectRulesSaved(true); }}
                        className="px-2.5 py-1 text-[8px] font-bold tracking-wider uppercase rounded-lg transition-all duration-200 hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(6,182,212,0.1))', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}>
                        {projectRulesSaved ? '✓ Salvato' : 'Salva'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer: Salva Tutto + Chiudi */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-[#1e2a45] flex-shrink-0">
                <button type="button" onClick={() => {
                  saveGlobalRules(globalRulesText); saveGlobalMemory(globalMemoryText);
                  saveMemory(projectMemoryText); saveProjectRules(projectRulesText);
                  setGlobalRulesSaved(true); setGlobalMemorySaved(true);
                  setProjectMemorySaved(true); setProjectRulesSaved(true);
                }}
                  className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl text-[11px] text-white font-bold tracking-wider transition-all duration-200 shadow-lg shadow-blue-500/20">
                  Salva Tutto
                </button>
                <button type="button" onClick={() => setShowMemory(false)}
                  className="px-5 py-2 bg-[#1e2a45] hover:bg-[#2a3a60] rounded-xl text-[11px] text-[#8a96b4] font-semibold transition-all duration-200">
                  Chiudi
                </button>
              </div>
            </div>
          </div>

          {/* Hidden file input per upload .md */}
          <input ref={fileInputRef} type="file" accept=".md,.markdown,.txt" className="hidden" onChange={handleFileUpload} />
        </div>
      )}

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0f1525] border border-[#1e2a45] rounded-xl p-5 w-[380px] shadow-2xl">
            <h3 className="text-sm font-bold text-[#e8edf8] mb-4">Nuovo Progetto</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-[#5a6585] tracking-widest block mb-1">NOME PROGETTO</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="es. MyAwesomeProject"
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-1.5 text-xs text-[#e8edf8] outline-none focus:border-blue-500 placeholder-[#334066]"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] text-[#5a6585] tracking-widest block mb-1">CARTELLA PROGETTO</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={newProjectPath}
                    onChange={(e) => setNewProjectPath(e.target.value)}
                    placeholder="C:\Users\...\Desktop"
                    className="flex-1 bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-1.5 text-xs text-[#e8edf8] outline-none focus:border-blue-500 placeholder-[#334066]"
                  />
                  <button
                    type="button"
                    onClick={() => folderPickerRef.current?.click()}
                    className="px-3 py-1.5 bg-[#1e2a45] hover:bg-[#2a3a60] border border-[#2a3a60] rounded-lg text-[11px] text-[#8a96b4] whitespace-nowrap"
                  >
                    Sfoglia
                  </button>
                  <input
                    ref={folderPickerRef}
                    type="file"
                    // @ts-expect-error - webkitdirectory non-standard attr for dir picker
                    webkitdirectory=""
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        const relativePath = files[0].webkitRelativePath;
                        const rootFolder = relativePath.split('/')[0];
                        setNewProjectPath(rootFolder);
                        setNewProjectName(rootFolder);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  if (newProjectName.trim()) {
                    send('new_project', { name: newProjectName.trim(), path: newProjectPath.trim() || undefined });
                    setNewProjectName('');
                    setNewProjectPath('');
                    setShowNewProject(false);
                  }
                }}
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-[11px] text-white font-semibold"
              >
                Crea
              </button>
              <button
                type="button"
                onClick={() => { setShowNewProject(false); setNewProjectName(''); setNewProjectPath(''); }}
                className="flex-1 py-1.5 bg-[#1e2a45] hover:bg-[#2a3a60] rounded-lg text-[11px] text-[#8a96b4]"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
