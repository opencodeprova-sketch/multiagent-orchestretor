import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AgentCard from './AgentCard';

const baseProps = {
  name: 'Direttore',
  agentId: 'direttore',
  emoji: '🧠',
  progress: 50,
  color: '#f97316',
  status: 'LAVORANDO',
  activities: [
    { label: 'Analisi requisiti', status: 'OK' as const },
    { label: 'Pianificazione', status: 'RUNNING' as const },
  ],
  files: ['PDR.md', 'piano.md'],
  stats: { completed: 5, inProgress: 2, waiting: 3 },
  sparkData: [10, 20, 30, 25, 40],
};

describe('AgentCard', () => {
  it('renderizza nome agente', () => {
    render(<AgentCard {...baseProps} />);
    expect(screen.getByText('Direttore')).toBeInTheDocument();
  });

  it('renderizza percentuale progresso', () => {
    render(<AgentCard {...baseProps} />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('renderizza stato', () => {
    render(<AgentCard {...baseProps} />);
    expect(screen.getByText('LAVORANDO')).toBeInTheDocument();
  });

  it('renderizza attività', () => {
    render(<AgentCard {...baseProps} />);
    expect(screen.getByText('Analisi requisiti')).toBeInTheDocument();
    expect(screen.getByText('Pianificazione')).toBeInTheDocument();
  });

  it('renderizza file list', () => {
    render(<AgentCard {...baseProps} />);
    expect(screen.getByText('PDR.md')).toBeInTheDocument();
    expect(screen.getByText('piano.md')).toBeInTheDocument();
  });

  it('mostra stats (completati, in corso, attesa)', () => {
    render(<AgentCard {...baseProps} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('mostra stato vuoto quando nessuna attività', () => {
    render(<AgentCard {...baseProps} activities={[]} />);
    expect(screen.getByText('Nessuna attività')).toBeInTheDocument();
  });

  it('chiama onAgentClick al click nome', () => {
    const onClick = vi.fn();
    render(<AgentCard {...baseProps} onAgentClick={onClick} />);
    fireEvent.click(screen.getByText('Direttore'));
    expect(onClick).toHaveBeenCalledWith('direttore');
  });

  it('renderizza DirettoreFooter per direttore', () => {
    render(<AgentCard {...baseProps} onCommand={vi.fn()} />);
    expect(screen.getByText('/init')).toBeInTheDocument();
    expect(screen.getByText('/boot-project')).toBeInTheDocument();
    expect(screen.getByText('/copia-setup')).toBeInTheDocument();
  });

  it('renderizza CoordinatoreFooter per coordinator', () => {
    render(<AgentCard {...baseProps} name="Coordinator" agentId="coordinator" onCommand={vi.fn()} />);
    expect(screen.getByText('/analizza')).toBeInTheDocument();
    expect(screen.getByText('/goal')).toBeInTheDocument();
    expect(screen.getByText('/council')).toBeInTheDocument();
  });
});
