import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOrchestratorContext } from '../context/OrchestratorContext';

type NavItem = 'panoramica' | 'progetti' | 'agenti' | 'mcp' | 'plugin' | 'comandi';

interface CmdItemProps {
  id: string;
  cmd: { name: string; description: string; content: string };
  hoveredCmd: string | null;
  setHoveredCmd: (id: string | null) => void;
  sendChat: (text: string, recipient: string) => void;
}

function CmdItem({ id, cmd, hoveredCmd, setHoveredCmd, sendChat }: CmdItemProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        setHoveredCmd(id);
        if (btnRef.current) {
          const r = btnRef.current.getBoundingClientRect();
          setPos({ x: r.left, y: r.top - 8 });
        }
      }}
      onMouseLeave={() => {
        setHoveredCmd(null);
        setPos(null);
      }}
    >
      <button
        ref={btnRef}
        type="button"
        onClick={() => sendChat(`/run ${cmd.name}`, 'coder')}
        className="text-left px-2.5 py-1.5 rounded-lg hover:bg-[#ffffff08] transition-all duration-200 w-full group"
      >
        <span className="text-[10px] text-blue-400/80 font-mono group-hover:text-blue-300 transition-colors">/{cmd.name}</span>
      </button>
      {cmd.description && hoveredCmd === id && pos && createPortal(
        <div
          className="fixed px-3 py-2 bg-[#1a2540]/95 backdrop-blur-xl border border-[#2a3a60] rounded-xl text-[10px] text-[#c8d0e0] whitespace-nowrap z-[9999] shadow-2xl pointer-events-none"
          style={{ left: pos.x, top: pos.y, maxWidth: 260, transform: 'translateY(-100%)' }}
        >
          {cmd.description}
          <div className="absolute top-full left-3 border-4 border-transparent border-t-[#1a2540]" />
        </div>,
        document.body,
      )}
    </div>
  );
}

interface HoverRowProps {
  id: string;
  description?: string;
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
  children: React.ReactNode;
}

function HoverRow({ id, description, hoveredItem, setHoveredItem, children }: HoverRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  return (
    <div
      ref={rowRef}
      className="relative"
      onMouseEnter={() => {
        setHoveredItem(id);
        if (rowRef.current) {
          const r = rowRef.current.getBoundingClientRect();
          setPos({ x: r.left, y: r.top - 8 });
        }
      }}
      onMouseLeave={() => {
        setHoveredItem(null);
        setPos(null);
      }}
    >
      {children}
      {description && hoveredItem === id && pos && createPortal(
        <div
          className="fixed px-3 py-2 bg-[#1a2540]/95 backdrop-blur-xl border border-[#2a3a60] rounded-xl text-[10px] text-[#c8d0e0] whitespace-nowrap z-[9999] shadow-2xl pointer-events-none"
          style={{ left: pos.x, top: pos.y, maxWidth: 260, transform: 'translateY(-100%)' }}
        >
          {description}
          <div className="absolute top-full left-3 border-4 border-transparent border-t-[#1a2540]" />
        </div>,
        document.body,
      )}
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 px-1 mb-2">
      <span className="text-[9px] font-bold text-[#4a5575] tracking-[0.2em] uppercase">{label}</span>
      {count !== undefined && (
        <span className="text-[8px] text-[#3a4575] bg-[#ffffff08] px-1.5 py-0.5 rounded-full font-mono">{count}</span>
      )}
      <div className="flex-1 h-px bg-gradient-to-r from-[#1e2a45] to-transparent" />
    </div>
  );
}

function CollapsibleSection({
  label,
  count,
  expanded,
  onToggle,
  children,
}: {
  label: string;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`section-${label.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={onToggle}
          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all duration-200 flex items-center justify-between group ${
          expanded
            ? 'text-blue-300 bg-[#ffffff05]'
            : 'text-[#5a6585] hover:text-[#8a96b4] hover:bg-[#ffffff04]'
        }`}
      >
        <div className="flex items-center gap-2">
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          >
            <path d="M2 1L6 4L2 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[10px] font-semibold tracking-wider">{label}</span>
          {count !== undefined && (
            <span className="text-[8px] text-[#4a5575] bg-[#ffffff08] px-1.5 py-0.5 rounded-full font-mono">{count}</span>
          )}
        </div>
      </button>
      {expanded && (
        <div id={`section-${label.toLowerCase().replace(/\s+/g, '-')}`} className="ml-3 flex flex-col gap-0.5 py-1.5 px-1">
          {children}
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="group/toggle flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[#ffffff06] transition-all duration-150">
      <span className="text-[10px] text-[#8a96b4] group-hover/toggle:text-[#a8b4d4] transition-colors">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={`${label}: ${checked ? 'attivo' : 'disattivo'}`}
          onClick={() => onChange(!checked)}
          className={`relative h-4 w-7 rounded-full transition-all duration-300 flex-shrink-0 ${
          checked ? 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 'bg-[#2a3352]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-md transition-all duration-300 ${
            checked ? 'left-[14px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export default function Sidebar({
  onAgentRulesClick,
  onMemoryClick,
}: {
  onAgentRulesClick?: (agentId: string) => void;
  onMemoryClick?: () => void;
}) {
  const [activeNav, setActiveNav] = useState<NavItem>('panoramica');
  const [mcpExpanded, setMcpExpanded] = useState(false);
  const [pluginExpanded, setPluginExpanded] = useState(false);
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [hoveredCmd, setHoveredCmd] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const {
    metrics,
    connected,
    toggleMcp,
    togglePlugin,
    toggleSkill,
    createAgent,
    mcpServers,
    plugins,
    skills,
    opencodeConfig,
    sendChat,
    agentsList,
  } = useOrchestratorContext();
  const [agentCreated, setAgentCreated] = useState(false);
  const [showAgentInput, setShowAgentInput] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('');

  // MCP servers da config OpenCode
  const mcpServersList = Object.keys(opencodeConfig?.mcp_servers ?? {});
  // Plugins da config OpenCode
  const pluginsList = opencodeConfig?.plugins ?? [];
  // Skills da config OpenCode
  const skillsList = Object.keys(opencodeConfig?.skills ?? {});

  // Descrizioni estratte dal contenuto
  const skillDescriptions: Record<string, string> = {};
  for (const [name, content] of Object.entries(opencodeConfig?.skills ?? {})) {
    if (typeof content === 'string') {
      const match = content.match(/description:\s*["']?(.+?)["']?\s*$/m);
      skillDescriptions[name] = match ? match[1].slice(0, 100) : content.split('\n').find(l => l.trim() && !l.startsWith('#') && !l.startsWith('---'))?.trim().slice(0, 100) ?? '';
    }
  }

  const mcpDescriptions: Record<string, string> = {
    'blender-mcp': 'Controllo Blender 3D via MCP: scene, modelli, rendering',
    'arduino': 'Sketch Arduino, upload, serial monitor, pinout',
    'composio': 'Integrazione 200+ app: Gmail, Slack, GitHub, Notion...',
    'pdf-reader': 'Lettura e estrazione testo da documenti PDF',
    Filesystem: 'Accesso leggibile/scrivibile al filesystem locale',
    Git: 'Operazioni git: status, diff, commit, branch',
    SQL: 'Query e gestione database SQLite',
    Docker: 'Gestione container, immagini e compose',
    'brave-search': 'Ricerca web via Brave Search API',
    puppeteer: 'Browser automation e web scraping',
    github: 'Issues, PR, repo management via GitHub API',
  };

  const pluginDescriptions: Record<string, string> = {
    'opencode-handoff': 'Passaggio sessione tra agenti OpenCode',
    '@ramarivera/opencode-model-announcer': 'Annuncia il modello AI in uso',
    '@hyakt/opencode-smart-title': 'Titolo intelligente basato sul contesto',
    'opencode-antigravity-auth': 'Autenticazione Antigravity per OpenCode',
    'opencode-caveman': 'Modalita comunicazione ultra-compressa',
    'plugins/graphify.js': 'Knowledge graph dalla codebase',
    '@dietrichgebert/ponytail': 'Soluzioni minimaliste, anti-overengineering',
    Linter: 'Analisi statica codice e correzione errori',
    Formatter: 'Formattazione automatica del codice',
    Prettier: 'Formattazione code style con Prettier',
    ESLint: 'Linting JavaScript/TypeScript con ESLint',
  };

  const createdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCreateAgent = () => {
    setShowAgentInput(true);
  };

  const handleConfirmCreateAgent = () => {
    if (!newAgentName.trim()) return;
    createAgent(newAgentName.trim(), newAgentRole.trim() || 'Da definire', '');
    setAgentCreated(true);
    setShowAgentInput(false);
    setNewAgentName('');
    setNewAgentRole('');
    if (createdTimeoutRef.current) clearTimeout(createdTimeoutRef.current);
    createdTimeoutRef.current = setTimeout(() => setAgentCreated(false), 2000);
  };

  const handleCancelCreateAgent = () => {
    setShowAgentInput(false);
    setNewAgentName('');
    setNewAgentRole('');
  };

  const agentCount = Object.keys(opencodeConfig?.agents ?? {}).length;

  return (
    <aside className="w-52 bg-[#0b0f19] border-r border-[#1e2a45] flex flex-col h-full flex-shrink-0">
      {/* Nav links — fissi in alto */}
      <nav className="px-3 pt-3 flex flex-col gap-0.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveNav('panoramica')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-200 ${
            activeNav === 'panoramica'
              ? 'bg-gradient-to-r from-blue-500/15 to-cyan-500/10 text-blue-400 font-semibold border border-blue-500/20'
              : 'text-[#8a96b4] hover:bg-[#ffffff05] hover:text-[#e8edf8]'
          }`}
        >
          <span className="text-sm">⊞</span>
          Panoramica
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-3">
        {/* Agent tree */}
        <div className="pt-4">
          <SectionHeader label="Agenti" count={agentCount} />

        {/* Agent tree da OpenCode config */}
        {Object.entries(opencodeConfig?.agents ?? {}).map(([id, data]) => {
          const agentData = data as { name?: string; content?: string } | undefined;
          const name = agentData?.name ?? id;
          // Stato agente in tempo reale da agentsList
          const liveAgent = agentsList.find((a) => a.id === id);
          const agentStatus = liveAgent?.status ?? 'idle';
          const dotColor =
            agentStatus === 'working' || agentStatus === 'operational' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' :
            agentStatus === 'waiting' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' :
            'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]';
          const dotAnim = agentStatus === 'working' ? 'animate-pulse' : '';
          const btnClass = `flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl hover:bg-[#ffffff05] transition-all duration-150 group cursor-pointer ${
            agentStatus === 'waiting' ? 'blink-attention' : ''
          }`;
          return (
            <div key={id} className="mb-0.5">
              <button
                type="button"
                onClick={() => onAgentRulesClick?.(id)}
                className={btnClass}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor} ${dotAnim}`} />
                <span className="text-xs font-semibold text-[#e8edf8] group-hover:text-white transition-colors">{name}</span>
                <span className="ml-auto text-[7px] text-[#3a4575] opacity-0 group-hover:opacity-100 transition-opacity">regole</span>
              </button>
            </div>
          );
        })}

        {/* Create agent button */}
        <div className="px-1 mt-2">
          {showAgentInput ? (
            <div className="flex flex-col gap-1.5 p-2 bg-[#ffffff05] rounded-xl border border-[#1e2a45]">
              <input
                type="text"
                placeholder="Nome agente"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[10px] bg-[#080c14] border border-[#1e2a45] rounded-lg text-[#e8edf8] placeholder:text-[#4a5575] outline-none focus:border-blue-400/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.1)] transition-all"
                autoFocus
              />
              <input
                type="text"
                placeholder="Ruolo"
                value={newAgentRole}
                onChange={(e) => setNewAgentRole(e.target.value)}
                className="w-full px-2.5 py-1.5 text-[10px] bg-[#080c14] border border-[#1e2a45] rounded-lg text-[#e8edf8] placeholder:text-[#4a5575] outline-none focus:border-blue-400/50 focus:shadow-[0_0_10px_rgba(59,130,246,0.1)] transition-all"
              />
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleConfirmCreateAgent}
                  className="flex-1 text-[10px] font-semibold py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20"
                >
                  Crea
                </button>
                <button
                  type="button"
                  onClick={handleCancelCreateAgent}
                  className="text-[10px] px-3 py-1.5 text-[#5a6585] hover:text-[#8a96b4] rounded-lg hover:bg-[#ffffff08] transition-all"
                >
                  Annulla
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCreateAgent}
              className={`w-full text-[10px] font-semibold py-2 rounded-xl transition-all duration-200 ${
                agentCreated
                  ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                  : 'text-blue-400 hover:text-blue-300 bg-[#ffffff05] hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20'
              }`}
            >
              {agentCreated ? '✓ Agente creato' : '+ Nuovo agente'}
            </button>
          )}
        </div>
        </div>

      {/* Bottom nav — dentro scroll area */}
      <div className="py-3 border-t border-[#1e2a45] flex flex-col gap-0.5 mt-3">
        {/* MCP Servers */}
        <CollapsibleSection
          label="MCP Servers"
          count={mcpServersList.length}
          expanded={mcpExpanded}
          onToggle={() => setMcpExpanded((p) => !p)}
        >
          {mcpServersList.map((name) => (
            <HoverRow key={name} id={`mcp-${name}`} description={mcpDescriptions[name]} hoveredItem={hoveredItem} setHoveredItem={setHoveredItem}>
              <ToggleSwitch
                label={name}
                checked={mcpServers[name]}
                onChange={(v) => toggleMcp(name, v)}
              />
            </HoverRow>
          ))}
        </CollapsibleSection>

        {/* Plugin */}
        <CollapsibleSection
          label="Plugin"
          count={pluginsList.length}
          expanded={pluginExpanded}
          onToggle={() => setPluginExpanded((p) => !p)}
        >
          {pluginsList.map((name) => (
            <HoverRow key={name} id={`plugin-${name}`} description={pluginDescriptions[name]} hoveredItem={hoveredItem} setHoveredItem={setHoveredItem}>
              <ToggleSwitch
                label={name}
                checked={plugins[name]}
                onChange={(v) => togglePlugin(name, v)}
              />
            </HoverRow>
          ))}
        </CollapsibleSection>

        {/* Skills */}
        <CollapsibleSection
          label="Skills"
          count={skillsList.length}
          expanded={skillsExpanded}
          onToggle={() => setSkillsExpanded((p) => !p)}
        >
          {skillsList.map((name) => (
            <HoverRow key={name} id={`skill-${name}`} description={skillDescriptions[name]} hoveredItem={hoveredItem} setHoveredItem={setHoveredItem}>
              <ToggleSwitch
                label={name}
                checked={skills[name]}
                onChange={(v) => toggleSkill(name, v)}
              />
            </HoverRow>
          ))}
        </CollapsibleSection>

        {/* Comandi OpenCode */}
        <div className="mb-1">
          <button
            type="button"
            onClick={() => setActiveNav(activeNav === 'comandi' ? 'panoramica' : 'comandi')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all duration-200 flex items-center gap-2 group ${
              activeNav === 'comandi'
                ? 'text-blue-300 bg-[#ffffff05]'
                : 'text-[#5a6585] hover:text-[#8a96b4] hover:bg-[#ffffff04]'
            }`}
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              className={`transition-transform duration-200 ${activeNav === 'comandi' ? 'rotate-90' : ''}`}
            >
              <path d="M2 1L6 4L2 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[10px] font-semibold tracking-wider">Comandi</span>
            {Object.keys(opencodeConfig?.commands ?? {}).length > 0 && (
              <span className="text-[8px] text-[#4a5575] bg-[#ffffff08] px-1.5 py-0.5 rounded-full font-mono">
                {Object.keys(opencodeConfig?.commands ?? {}).length}
              </span>
            )}
          </button>
          {activeNav === 'comandi' && (
            <div className="ml-3 flex flex-col gap-0.5 py-1.5 px-1">
              {Object.entries(opencodeConfig?.commands ?? {}).map(([id, cmd]) => (
                <CmdItem key={id} id={id} cmd={cmd} hoveredCmd={hoveredCmd} setHoveredCmd={setHoveredCmd} sendChat={sendChat} />
              ))}
              {Object.keys(opencodeConfig?.commands ?? {}).length === 0 && (
                <span className="text-[10px] text-[#4a5575] italic px-2">Nessun comando trovato</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sistema widget — glass */}
      <div className="mx-3 mb-3 p-3 bg-gradient-to-br from-[#161b27] to-[#0f1525] border border-[#1e2a45] rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[8px] font-bold text-[#4a5575] tracking-[0.2em] uppercase">Sistema</span>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${
              connected ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
            }`} />
            <span className={`text-[9px] font-semibold ${connected ? 'text-green-400' : 'text-red-400'}`}>
              {connected ? 'Operativo' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Link rapidi memoria e regole */}
        <div className="flex flex-col gap-0.5 mb-2">
          <button
            type="button"
            onClick={onMemoryClick}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#ffffff05] transition-all duration-150 group text-left"
          >
            <span className="text-[8px]">📝</span>
            <span className="text-[9px] text-[#8a96b4] group-hover:text-blue-400 transition-colors">Memoria Progetto</span>
            <span className="ml-auto text-[7px] text-[#3a4575] opacity-0 group-hover:opacity-100 transition-opacity">modifica</span>
          </button>
          <button
            type="button"
            onClick={onMemoryClick}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#ffffff05] transition-all duration-150 group text-left"
          >
            <span className="text-[8px]">📋</span>
            <span className="text-[9px] text-[#8a96b4] group-hover:text-purple-400 transition-colors">Regole Globali</span>
            <span className="ml-auto text-[7px] text-[#3a4575] opacity-0 group-hover:opacity-100 transition-opacity">modifica</span>
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-[#1e2a45] to-transparent mb-2" />

        <div className="flex flex-col gap-1.5 text-[10px]">
          {[
            { label: 'Memoria', value: `${metrics.memory_used_gb.toFixed(0)} GB / ${(metrics.memory_total_gb / 1024).toFixed(2)} TB`, color: 'text-blue-400' },
            { label: 'CPU', value: `${metrics.cpu_percent}%`, color: metrics.cpu_percent > 70 ? 'text-red-400' : 'text-green-400' },
            { label: 'Network', value: '12.4 MB/s', color: 'text-cyan-400' },
          ].map((s) => (
            <div key={s.label} className="flex justify-between items-center px-1.5 py-1 rounded-lg bg-[#ffffff04]">
              <span className="text-[9px] text-[#5a6585]">{s.label}</span>
              <span className={`text-[9px] font-mono font-semibold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </aside>
  );
}
