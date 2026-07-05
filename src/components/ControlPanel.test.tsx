import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MockOrchestratorProvider } from '../test/MockOrchestratorProvider';
import ControlPanel from './ControlPanel';

function renderWithProvider(ui: React.ReactElement, overrides = {}) {
  return render(<MockOrchestratorProvider overrides={overrides}>{ui}</MockOrchestratorProvider>);
}

describe('ControlPanel', () => {
  it('renderizza nome progetto e percorso dal context', () => {
    renderWithProvider(<ControlPanel />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('/project/a')).toBeInTheDocument();
  });

  it('mostra fallback "Nessun progetto aperto" quando projectInfo è null', () => {
    renderWithProvider(<ControlPanel />, { projectInfo: null });
    expect(screen.getByText('Nessun progetto aperto')).toBeInTheDocument();
  });

  it('mostra agenti attivi quando presenti con status working/operational', () => {
    const activeAgent = {
      id: 'direttore',
      name: 'Direttore',
      status: 'working',
      color: '#f97316',
      progress: 50,
      activities: [],
      files: [],
      stats: { completed: 0, in_progress: 0, waiting: 0 },
      spark_data: [],
    };
    renderWithProvider(<ControlPanel />, {
      agents: { direttore: activeAgent },
      agentsList: [activeAgent],
    });
    expect(screen.getByText('Agenti Attivi')).toBeInTheDocument();
    expect(screen.getByText('Direttore')).toBeInTheDocument();
  });

  it('non mostra sezione agenti attivi se nessuno ha status working/operational', () => {
    renderWithProvider(<ControlPanel />);
    expect(screen.queryByText('Agenti Attivi')).not.toBeInTheDocument();
  });

  it('mostra pendingProposal quando presente', () => {
    const proposal = {
      id: 'p1',
      agent_id: 'coder',
      agent_name: 'Coder',
      command: 'npm install',
      args: [],
      reason: 'test',
    };
    renderWithProvider(<ControlPanel />, { pendingProposal: proposal });
    expect(screen.getByText('Approvazione richiesta')).toBeInTheDocument();
    expect(screen.getByText(/opencode npm install/)).toBeInTheDocument();
    expect(screen.getByText('Approva')).toBeInTheDocument();
    expect(screen.getByText('Rifiuta')).toBeInTheDocument();
  });

  it('non mostra pendingProposal quando null', () => {
    renderWithProvider(<ControlPanel />);
    expect(screen.queryByText('Approvazione richiesta')).not.toBeInTheDocument();
  });

  it('renderizza pannello Autonomia', () => {
    renderWithProvider(<ControlPanel />);
    expect(screen.getByText('Livello Autonomia')).toBeInTheDocument();
    expect(screen.getByText('Full Auto')).toBeInTheDocument();
    expect(screen.getByText('Approvazione Umana')).toBeInTheDocument();
  });

  it('renderizza pannello Sync con OpenCode', () => {
    renderWithProvider(<ControlPanel />);
    expect(screen.getByText('Sync con OpenCode')).toBeInTheDocument();
  });

  it('chiama getProjectFiles al mount', () => {
    const getProjectFiles = vi.fn();
    renderWithProvider(<ControlPanel />, { getProjectFiles });
    expect(getProjectFiles).toHaveBeenCalledTimes(1);
  });

  it('renderizza FileTree con file e directory', () => {
    const projectInfo = {
      name: 'Test',
      path: '/test',
      files: [
        { name: 'small.ts', path: '/test/small.ts', type: 'file' as const, size: 500 },
        { name: 'medium.ts', path: '/test/medium.ts', type: 'file' as const, size: 2048 },
        { name: 'large.ts', path: '/test/large.ts', type: 'file' as const, size: 2097152 },
        { name: 'src', path: '/test/src', type: 'dir' as const, children: [
          { name: 'index.ts', path: '/test/src/index.ts', type: 'file' as const, size: 100 },
        ]},
      ],
    };
    renderWithProvider(<ControlPanel />, { projectInfo });
    expect(screen.getByText('small.ts')).toBeInTheDocument();
    expect(screen.getByText('medium.ts')).toBeInTheDocument();
    expect(screen.getByText('large.ts')).toBeInTheDocument();
    expect(screen.getByText('src')).toBeInTheDocument();
  });

  it('mostra agenti con status operational', () => {
    const activeAgent = {
      id: 'supervisor',
      name: 'Supervisor',
      status: 'operational',
      color: '#22c55e',
      progress: 80,
      activities: [],
      files: [],
      stats: { completed: 10, in_progress: 1, waiting: 0 },
      spark_data: [5, 10, 15],
    };
    renderWithProvider(<ControlPanel />, {
      agents: { supervisor: activeAgent },
      agentsList: [activeAgent],
    });
    expect(screen.getByText('Agenti Attivi')).toBeInTheDocument();
    expect(screen.getByText('Supervisor')).toBeInTheDocument();
  });

  it('chiama approveCommand al click Approva', () => {
    const approveCommand = vi.fn();
    const proposal = { id: 'p1', agent_id: 'coder', agent_name: 'Coder', command: 'npm test', args: [], reason: 'test' };
    renderWithProvider(<ControlPanel />, { pendingProposal: proposal, approveCommand });
    fireEvent.click(screen.getByText('Approva'));
    expect(approveCommand).toHaveBeenCalledWith('p1');
  });

  it('chiama rejectCommand al click Rifiuta', () => {
    const rejectCommand = vi.fn();
    const proposal = { id: 'p1', agent_id: 'coder', agent_name: 'Coder', command: 'npm test', args: [], reason: 'test' };
    renderWithProvider(<ControlPanel />, { pendingProposal: proposal, rejectCommand });
    fireEvent.click(screen.getByText('Rifiuta'));
    expect(rejectCommand).toHaveBeenCalledWith('p1', 'Rifiutato');
  });

  it('chiama updateSettings su cambio autonomia via slider', () => {
    const updateSettings = vi.fn();
    renderWithProvider(<ControlPanel />, { updateSettings });
    const slider = document.querySelector('input[type="range"]');
    expect(slider).not.toBeNull();
    if (slider) fireEvent.change(slider, { target: { value: '2' } });
    expect(updateSettings).toHaveBeenCalled();
  });
});
