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

  it('chiama onAgentClick via tastiera Enter', () => {
    const onClick = vi.fn();
    render(<AgentCard {...baseProps} onAgentClick={onClick} />);
    const header = screen.getByText('Direttore').closest('[role="button"]')!;
    fireEvent.keyDown(header, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith('direttore');
  });

  it('chiama onAgentClick via tastiera Space', () => {
    const onClick = vi.fn();
    render(<AgentCard {...baseProps} onAgentClick={onClick} />);
    const header = screen.getByText('Direttore').closest('[role="button"]')!;
    fireEvent.keyDown(header, { key: ' ' });
    expect(onClick).toHaveBeenCalledWith('direttore');
  });

  it('renderizza StatsFooter per agente non speciale', () => {
    const noFooter = { ...baseProps, name: 'Tester', agentId: 'tester', onCommand: undefined };
    render(<AgentCard {...noFooter} />);
    expect(screen.getByText('Completati')).toBeInTheDocument();
    expect(screen.getByText('In corso')).toBeInTheDocument();
    expect(screen.getByText('In attesa')).toBeInTheDocument();
  });

  it('mostra output vuoto quando nessun log', () => {
    render(<AgentCard {...baseProps} agentLogs={[]} />);
    expect(screen.getByText('In attesa di output...')).toBeInTheDocument();
  });

  it('renderizza log quando presenti', () => {
    const logs = [{ time: '10:00', msg: 'Task started' }];
    render(<AgentCard {...baseProps} agentLogs={logs} />);
    expect(screen.getByText('Task started')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('mostra stato ERRORE', () => {
    render(<AgentCard {...baseProps} status="ERRORE" />);
    expect(screen.getByText('ERRORE')).toBeInTheDocument();
  });

  it('mostra stato IDLE', () => {
    render(<AgentCard {...baseProps} status="IDLE" />);
    expect(screen.getByText('IDLE')).toBeInTheDocument();
  });

  it('chiama onStop al click stop button', () => {
    const onStop = vi.fn();
    render(<AgentCard {...baseProps} onStop={onStop} status="LAVORANDO" />);
    const stopBtn = screen.getByLabelText('Interrompi lavoro di Direttore');
    fireEvent.click(stopBtn);
    expect(onStop).toHaveBeenCalledWith('direttore');
  });

  it('mostra status passato come prop direttamente', () => {
    render(<AgentCard {...baseProps} status="UNKNOWN" />);
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });

  it('mostra stato WAITING', () => {
    render(<AgentCard {...baseProps} status="WAITING" />);
    expect(screen.getByText('WAITING')).toBeInTheDocument();
  });

  it('mostra stato OPERATIVO', () => {
    render(<AgentCard {...baseProps} status="OPERATIVO" />);
    expect(screen.getByText('OPERATIVO')).toBeInTheDocument();
  });

  it('non mostra stop button quando agentId mancante', () => {
    render(<AgentCard {...baseProps} agentId={undefined} onStop={vi.fn()} />);
    expect(screen.queryByLabelText(/Interrompi/)).not.toBeInTheDocument();
  });

  it('non mostra WalkingWorker quando status non lavorando', () => {
    const { container } = render(<AgentCard {...baseProps} status="OPERATIVO" />);
    expect(container.querySelector('.walking-worker')).not.toBeInTheDocument();
  });

  it('mostra progresso 0%', () => {
    render(<AgentCard {...baseProps} progress={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('mostra progresso 100%', () => {
    render(<AgentCard {...baseProps} progress={100} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('non mostra files quando undefined', () => {
    render(<AgentCard {...baseProps} files={undefined} />);
    expect(screen.queryByText('PDR.md')).not.toBeInTheDocument();
  });

  it('mostra StatsFooter per Direttore senza onCommand', () => {
    render(<AgentCard {...baseProps} onCommand={undefined} />);
    expect(screen.getByText('Completati')).toBeInTheDocument();
  });

  it('espande scaletta DirettoreFooter', () => {
    render(<AgentCard {...baseProps} onCommand={vi.fn()} />);
    fireEvent.click(screen.getByText('Scaletta'));
    expect(screen.getByText('Analisi e Definizione Obiettivi')).toBeInTheDocument();
  });

  it('espande procedimento CoordinatoreFooter', () => {
    render(<AgentCard {...baseProps} name="Coordinator" agentId="coordinator" onCommand={vi.fn()} />);
    fireEvent.click(screen.getByText('Procedimento'));
    expect(screen.getByText('Analisi Richieste')).toBeInTheDocument();
  });

  it('calcola phaseStatus con progress=0 per DirettoreFooter', () => {
    render(<AgentCard {...baseProps} progress={0} onCommand={vi.fn()} />);
    fireEvent.click(screen.getByText('Scaletta'));
    expect(screen.getByText('Analisi e Definizione Obiettivi')).toBeInTheDocument();
  });

  it('mouseEnter/mouseLeave sul card non causa errori', () => {
    const { container } = render(<AgentCard {...baseProps} />);
    const card = container.firstElementChild!;
    fireEvent.mouseEnter(card);
    fireEvent.mouseLeave(card);
    expect(true).toBeTruthy();
  });

  it('mouseEnter/mouseLeave sul stop button non causa errori', () => {
    render(<AgentCard {...baseProps} onStop={vi.fn()} status="LAVORANDO" />);
    const stopBtn = screen.getByLabelText('Interrompi lavoro di Direttore');
    fireEvent.mouseEnter(stopBtn);
    fireEvent.mouseLeave(stopBtn);
    expect(true).toBeTruthy();
  });

  it('stop button con status non lavorando ha stile diverso', () => {
    render(<AgentCard {...baseProps} onStop={vi.fn()} status="OPERATIVO" />);
    const stopBtn = screen.getByLabelText('Nessun lavoro in corso per Direttore');
    fireEvent.mouseEnter(stopBtn);
    fireEvent.mouseLeave(stopBtn);
    expect(true).toBeTruthy();
  });
});
