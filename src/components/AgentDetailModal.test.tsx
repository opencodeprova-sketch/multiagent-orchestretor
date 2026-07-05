import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AgentDetailModal from './AgentDetailModal';
import { MockOrchestratorProvider, defaultAgent, defaultLogs } from '../test/MockOrchestratorProvider';

function renderWithProvider(ui: React.ReactElement, overrides = {}) {
  return render(<MockOrchestratorProvider overrides={overrides}>{ui}</MockOrchestratorProvider>);
}

describe('AgentDetailModal', () => {
  it('non renderizza nulla quando agentId non corrisponde ad alcun agente', () => {
    const { container } = renderWithProvider(
      <AgentDetailModal agentId="inesistente" onClose={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renderizza nome agente quando agentId corrisponde', () => {
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={vi.fn()} />
    );
    expect(screen.getByText('Agente Test')).toBeInTheDocument();
  });

  it('mostra percentuale progresso', () => {
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={vi.fn()} />
    );
    expect(screen.getByText('65')).toBeInTheDocument();
  });

  it('mostra label stato mappato da STATUS_LABEL', () => {
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={vi.fn()} />
    );
    // STATUS_LABEL usa chiavi lowercase: defaultAgent.status='IDLE' → fallback 'OPERATIVO'
    expect(screen.getByText('OPERATIVO')).toBeInTheDocument();
  });

  it('mostra ID agente', () => {
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={vi.fn()} />
    );
    expect(screen.getByText(/test-agent/)).toBeInTheDocument();
  });

  it('mostra statistiche (Completati, In corso, In attesa)', () => {
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={vi.fn()} />
    );
    expect(screen.getByText('Completati')).toBeInTheDocument();
    expect(screen.getByText('In corso')).toBeInTheDocument();
    expect(screen.getByText('In attesa')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('mostra attività con label e status', () => {
    const agentWithActivities = {
      ...defaultAgent,
      activities: [
        { label: 'Analisi requisiti', status: 'OK' as const },
        { label: 'Pianificazione', status: 'RUNNING' as const },
      ],
    };
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={vi.fn()} />,
      {
        agentsList: [agentWithActivities],
        agents: { 'test-agent': agentWithActivities },
      }
    );
    expect(screen.getByText('Analisi requisiti')).toBeInTheDocument();
    expect(screen.getByText('Pianificazione')).toBeInTheDocument();
    expect(screen.getByText('[OK]')).toBeInTheDocument();
    expect(screen.getByText('[RUNNING]')).toBeInTheDocument();
  });

  it('mostra "Nessuna attività" quando lista attività vuota', () => {
    const agentNoActivities = {
      ...defaultAgent,
      activities: [],
    };
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={vi.fn()} />,
      {
        agentsList: [agentNoActivities],
        agents: { 'test-agent': agentNoActivities },
      }
    );
    expect(screen.getByText('Nessuna attività')).toBeInTheDocument();
  });

  it('mostra file aperti', () => {
    const agentWithFiles = {
      ...defaultAgent,
      files: ['PDR.md', 'piano.md'],
    };
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={vi.fn()} />,
      {
        agentsList: [agentWithFiles],
        agents: { 'test-agent': agentWithFiles },
      }
    );
    expect(screen.getByText('PDR.md')).toBeInTheDocument();
    expect(screen.getByText('piano.md')).toBeInTheDocument();
  });

  it('mostra sezione Trend (sparkline)', () => {
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={vi.fn()} />
    );
    expect(screen.getByText('Trend')).toBeInTheDocument();
  });

  it('mostra sezione Statistiche', () => {
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={vi.fn()} />
    );
    expect(screen.getByText('Statistiche')).toBeInTheDocument();
  });

  it('mostra sezione Terminale', () => {
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={vi.fn()} />
    );
    expect(screen.getByText('Terminale')).toBeInTheDocument();
  });

  it('mostra log del terminale quando presenti e filtrati per agente', () => {
    const agentLogs = [
      { time: '10:30', agent: 'Agente Test', color: '#3b82f6', msg: 'Task completato', agent_id: 'test-agent' },
      { time: '10:29', agent: 'Agente Test', color: '#3b82f6', msg: 'Refactoring completato', agent_id: 'test-agent' },
    ];
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={vi.fn()} />,
      { logs: agentLogs }
    );
    expect(screen.getByText('Task completato')).toBeInTheDocument();
    expect(screen.getByText('Refactoring completato')).toBeInTheDocument();
  });

  it('mostra "In attesa di output..." quando nessun log', () => {
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={vi.fn()} />,
      { logs: [] }
    );
    expect(screen.getByText('In attesa di output...')).toBeInTheDocument();
  });

  it('chiama onClose al click del pulsante chiudi', () => {
    const onClose = vi.fn();
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={onClose} />
    );
    const closeBtn = screen.getByLabelText('Chiudi dettaglio Agente Test');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('chiama onClose alla pressione di Escape', () => {
    const onClose = vi.fn();
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={onClose} />
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('chiama onClose al click sull\'overlay', () => {
    const onClose = vi.fn();
    renderWithProvider(
      <AgentDetailModal agentId="test-agent" onClose={onClose} />
    );
    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
