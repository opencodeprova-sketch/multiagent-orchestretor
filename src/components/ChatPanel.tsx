import { useState, useRef, useEffect } from 'react';
import { AGENT_ICONS } from '../data/mockup';
import { useOrchestratorContext } from '../context/OrchestratorContext';

const FALLBACK_MESSAGES = [
  { id: '1', sender: 'Manager', sender_color: '#f97316', text: 'Start WeatherBot project. Implement API call.', time: '10:31' },
  { id: '2', sender: 'Architect', sender_color: '#3b82f6', text: 'Proposed structure: config for API keys, main for logic.', time: '10:32' },
  { id: '3', sender: 'Coder', sender_color: '#22c55e', text: 'Sounds good. Starting main.py.', time: '10:33' },
  { id: '4', sender: 'Tester', sender_color: '#a855f7', text: 'Will create basic test case now.', time: '10:34' },
];

export default function ChatPanel() {
  const { messages, connected, agentsList, sendChat, opencodeConfig, pendingProposal } = useOrchestratorContext();
  const [input, setInput] = useState('');
  const [recipient, setRecipient] = useState('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayMessages = messages.length > 0 ? messages : (connected ? [] : FALLBACK_MESSAGES);

  // Agenti da OpenCode config (tutti) con fallback ai live agents
  const configAgents = opencodeConfig?.agents ?? {};
  const allAgentNames = Object.keys(configAgents).length > 0
    ? Object.entries(configAgents).map(([id, data]) => ({ id, name: data.name ?? id }))
    : agentsList.map((a) => ({ id: a.id, name: a.name }));

  const recipients = [
    { id: 'all', label: 'Tutti gli agenti' },
    ...allAgentNames.map((a) => ({ id: a.id, label: a.name })),
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [displayMessages]);

  const send = () => {
    if (!input.trim() || !connected) return;
    sendChat(input.trim(), recipient);
    setInput('');
  };

  return (
    <div className={`flex flex-col h-full bg-gradient-to-b from-[#0f1525] to-[#0b0f19] border border-[#1e2a45] rounded-2xl overflow-hidden shadow-lg high-contrast chat-panel-output ${pendingProposal ? 'blink-attention' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a45] flex-shrink-0 bg-[#0b0f19]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <h3 className="text-xs font-bold text-[#e8edf8]">Chat Inter-Agenti</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-[#5a6585] tracking-wider uppercase">Verso</span>
          <select
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={!connected}
            className="bg-[#161b27] border border-[#1e2a45] rounded-lg px-2.5 py-1 text-[10px] text-[#8a96b4] outline-none focus:border-blue-400/50 disabled:opacity-50 max-w-[150px] transition-all"
          >
            {recipients.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 py-4 flex flex-col gap-2 high-contrast">
        {displayMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-2 opacity-30">💬</div>
              <p className="text-[10px] text-[#4a5575]">
                {connected ? 'Invia un messaggio per avviare la discussione.' : 'Connessione al backend...'}
              </p>
            </div>
          </div>
        ) : (
          displayMessages.map((m) => {
            const icon = AGENT_ICONS[m.sender];
            const isSystem = m.sender === 'System';
            const isUser = m.sender === 'Utente';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''} group`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110 ${
                    isUser ? 'bg-gradient-to-br from-blue-500 to-cyan-400' : ''
                  }`}
                  style={!isUser ? {
                    background: `${m.sender_color}20`,
                    border: `1px solid ${m.sender_color}40`,
                  } : undefined}
                >
                  {icon?.emoji ?? (isUser ? '👤' : m.sender[0])}
                </div>

                {/* Message */}
                <div className={`flex flex-col ${isUser ? 'items-end' : ''} max-w-[80%]`}>
                  <div className="flex items-center gap-2 mb-0.5 px-1">
                    <span className="text-[10px] font-bold" style={{ color: m.sender_color }}>
                      {m.sender}
                    </span>
                    <span className="text-[8px] text-[#4a5575]">{m.time}</span>
                  </div>
                  <div
                    className={`px-3 py-2 text-[11px] leading-relaxed ${
                      isSystem
                        ? 'bg-[#ffffff05] text-[#6a7595] italic rounded-xl'
                        : isUser
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-[#e8edf8] rounded-2xl rounded-tr-md border border-blue-500/20'
                          : 'bg-[#ffffff05] text-[#c8d0e0] rounded-2xl rounded-tl-md border border-[#ffffff08] hover:border-[#ffffff15] transition-colors'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-[#1e2a45] flex-shrink-0 bg-[#0b0f19]">
        <div className={`flex items-center gap-2 bg-[#161b27] rounded-2xl px-4 py-2.5 border transition-all duration-200 ${
          connected ? 'border-[#1e2a45] focus-within:border-blue-400/30 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.05)]' : 'border-orange-500/30'
        }`}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            disabled={!connected}
            placeholder={connected ? 'Intervieni nella discussione...' : 'In attesa del backend...'}
            className="flex-1 bg-transparent text-[11px] text-[#e8edf8] placeholder:text-[#4a5575] outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={send}
            disabled={!connected || !input.trim()}
            className="w-7 h-7 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center disabled:opacity-30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 disabled:hover:shadow-none flex-shrink-0"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
