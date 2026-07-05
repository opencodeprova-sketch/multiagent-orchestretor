import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AgentRulesModal from './AgentRulesModal';
import { MockOrchestratorProvider } from '../test/MockOrchestratorProvider';

function renderWithProvider(ui: React.ReactElement, overrides = {}) {
  return render(<MockOrchestratorProvider overrides={overrides}>{ui}</MockOrchestratorProvider>);
}

const opencodeConfigWithAgent = {
  agents: {
    'test-agent': { name: 'Agente Test', content: 'Regole personalizzate per test' },
  },
  skills: {},
  commands: {},
  rules: '',
  mcp_servers: {},
  plugins: [],
  raw_config: {},
};

describe('AgentRulesModal', () => {
  it('mostra "Nessuna descrizione" quando agentId non presente in config', () => {
    renderWithProvider(
      <AgentRulesModal agentId="inesistente" onClose={vi.fn()} />,
      { opencodeConfig: { ...opencodeConfigWithAgent, agents: {} } }
    );
    expect(screen.getByText('Nessuna descrizione o regole disponibile per questo agente.')).toBeInTheDocument();
  });

  it('renderizza nome agente quando agentId corrisponde', () => {
    renderWithProvider(
      <AgentRulesModal agentId="test-agent" onClose={vi.fn()} />,
      { opencodeConfig: opencodeConfigWithAgent }
    );
    expect(screen.getByText('Agente Test')).toBeInTheDocument();
  });

  it('mostra ID agente', () => {
    renderWithProvider(
      <AgentRulesModal agentId="test-agent" onClose={vi.fn()} />,
      { opencodeConfig: opencodeConfigWithAgent }
    );
    expect(screen.getByText('ID: test-agent')).toBeInTheDocument();
  });

  it('mostra contenuto regole quando presente', () => {
    renderWithProvider(
      <AgentRulesModal agentId="test-agent" onClose={vi.fn()} />,
      { opencodeConfig: opencodeConfigWithAgent }
    );
    expect(screen.getByText('Regole personalizzate per test')).toBeInTheDocument();
  });

  it('mostra "Nessuna descrizione" quando contenuto assente', () => {
    const configNoContent = {
      ...opencodeConfigWithAgent,
      agents: { 'test-agent': { name: 'Agente Test', content: '' } },
    };
    renderWithProvider(
      <AgentRulesModal agentId="test-agent" onClose={vi.fn()} />,
      { opencodeConfig: configNoContent }
    );
    expect(screen.getByText('Nessuna descrizione o regole disponibile per questo agente.')).toBeInTheDocument();
  });

  it('mostra titolo sezione Descrizione & Regole', () => {
    renderWithProvider(
      <AgentRulesModal agentId="test-agent" onClose={vi.fn()} />,
      { opencodeConfig: opencodeConfigWithAgent }
    );
    expect(screen.getByText('Descrizione & Regole')).toBeInTheDocument();
  });

  it('chiama onClose al click del pulsante chiudi', () => {
    const onClose = vi.fn();
    renderWithProvider(
      <AgentRulesModal agentId="test-agent" onClose={onClose} />,
      { opencodeConfig: opencodeConfigWithAgent }
    );
    const closeBtn = screen.getByLabelText('Chiudi regole Agente Test');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('chiama onClose alla pressione di Escape', () => {
    const onClose = vi.fn();
    renderWithProvider(
      <AgentRulesModal agentId="test-agent" onClose={onClose} />,
      { opencodeConfig: opencodeConfigWithAgent }
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('chiama onClose al click sull\'overlay', () => {
    const onClose = vi.fn();
    renderWithProvider(
      <AgentRulesModal agentId="test-agent" onClose={onClose} />,
      { opencodeConfig: opencodeConfigWithAgent }
    );
    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
