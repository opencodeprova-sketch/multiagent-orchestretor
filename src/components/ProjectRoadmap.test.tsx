import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectRoadmap from './ProjectRoadmap';

describe('ProjectRoadmap', () => {
  it('renderizza titolo', () => {
    render(<ProjectRoadmap />);
    expect(screen.getByText('Scaletta Operativa del Progetto')).toBeInTheDocument();
  });

  it('renderizza 5 fasi da ROADMAP_PHASES', () => {
    render(<ProjectRoadmap />);
    expect(screen.getByText('Analisi e Definizione Obiettivi')).toBeInTheDocument();
    expect(screen.getByText('Progettazione Architetturale')).toBeInTheDocument();
    expect(screen.getByText('Implementazione')).toBeInTheDocument();
    expect(screen.getByText('Testing e Validazione')).toBeInTheDocument();
    expect(screen.getByText('Deploy e Monitoraggio')).toBeInTheDocument();
  });

  it('mostra progresso quando projectProgress fornito', () => {
    render(<ProjectRoadmap projectProgress={55} />);
    expect(screen.getByText('55%')).toBeInTheDocument();
    expect(screen.getByText('Progresso complessivo')).toBeInTheDocument();
  });

  it('non mostra progress bar senza projectProgress', () => {
    render(<ProjectRoadmap />);
    expect(screen.queryByText('Progresso complessivo')).not.toBeInTheDocument();
  });

  it('fase 2 è espansa di default (has subtasks)', () => {
    render(<ProjectRoadmap />);
    expect(screen.getByText('Analisi requisiti')).toBeInTheDocument();
  });

  it('click su fase con subtask espande/collassa', () => {
    render(<ProjectRoadmap />);
    // Fase 3 non ha subtask di default, ma in ROADMAP_PHASES non ha subtasks
    // Fase 2 ha subtasks ed è già espansa - click deve collassare
    const fase2 = screen.getByText('Progettazione Architetturale');
    fireEvent.click(fase2);
    expect(screen.queryByText('Analisi requisiti')).not.toBeInTheDocument();
  });

  it('usa stato ROADMAP_PHASES quando projectProgress non fornito', () => {
    render(<ProjectRoadmap />);
    // ROADMAP_PHASES: fase1=completed, fase2=in_progress, altre=waiting
    expect(screen.getByText('COMPLETATO')).toBeInTheDocument();
    expect(screen.getByText('IN CORSO')).toBeInTheDocument();
  });

  it('computePhaseStatus usa progress per determinare stato', () => {
    render(<ProjectRoadmap projectProgress={10} />);
    // 10% → fase1 in_progress (>0), resto waiting
    expect(screen.getByText('IN CORSO')).toBeInTheDocument(); // fase1
  });

  it('computePhaseStatus completed al 100%', () => {
    render(<ProjectRoadmap projectProgress={100} />);
    const completed = screen.getAllByText('COMPLETATO');
    expect(completed.length).toBeGreaterThanOrEqual(5);
  });
});
