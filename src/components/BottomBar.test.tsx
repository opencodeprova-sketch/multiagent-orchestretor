import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BottomBar from './BottomBar';
import { MockOrchestratorProvider, defaultMetrics, defaultLogs } from '../test/MockOrchestratorProvider';

function renderWithProvider(ui: React.ReactElement, overrides = {}) {
  return render(<MockOrchestratorProvider overrides={overrides}>{ui}</MockOrchestratorProvider>);
}

describe('BottomBar', () => {
  it('renderizza CPU percentuale', () => {
    renderWithProvider(<BottomBar />);
    expect(screen.getByText(/CPU/)).toBeInTheDocument();
    expect(screen.getByText((t) => t.includes(defaultMetrics.cpu_percent.toFixed(1)))).toBeInTheDocument();
  });

  it('renderizza RAM usata / totale', () => {
    renderWithProvider(<BottomBar />);
    expect(screen.getByText(/RAM/)).toBeInTheDocument();
    expect(screen.getByText((t) => t.includes(defaultMetrics.memory_used_gb.toFixed(1)))).toBeInTheDocument();
    expect(screen.getByText((t) => t.includes(defaultMetrics.memory_total_gb.toFixed(1)))).toBeInTheDocument();
  });

  it('renderizza tokens per minuto', () => {
    renderWithProvider(<BottomBar />);
    expect(screen.getByText((t) => t.includes(String(defaultMetrics.tokens_per_min)) && t.includes('t/min'))).toBeInTheDocument();
  });

  it('renderizza costo', () => {
    renderWithProvider(<BottomBar />);
    const cost = (defaultMetrics.api_calls * 0.002).toFixed(4);
    expect(screen.getByText((t) => t.includes('$') && t.includes(cost))).toBeInTheDocument();
  });

  it('renderizza timer', () => {
    renderWithProvider(<BottomBar />);
    expect(screen.getByText(/⏱/)).toBeInTheDocument();
  });

  it('renderizza progresso progetto', () => {
    renderWithProvider(<BottomBar />);
    expect(screen.getByText((t) => t.includes(`${defaultMetrics.project_progress}%`))).toBeInTheDocument();
  });

  it('renderizza conteggio agenti', () => {
    renderWithProvider(<BottomBar />);
    expect(screen.getByText((t) => t.includes('agenti'))).toBeInTheDocument();
  });

  it('mostra pulsante Log', () => {
    renderWithProvider(<BottomBar />);
    expect(screen.getByRole('button', { name: 'Visualizza log attività' })).toBeInTheDocument();
  });

  it('mostra pulsante Report', () => {
    renderWithProvider(<BottomBar />);
    expect(screen.getByRole('button', { name: 'Esporta report' })).toBeInTheDocument();
  });

  it('apre modale log al click su Log', () => {
    renderWithProvider(<BottomBar />);
    fireEvent.click(screen.getByRole('button', { name: 'Visualizza log attività' }));
    expect(screen.getByText('Log Attività')).toBeInTheDocument();
  });

  it('mostra voci log nel modale', () => {
    renderWithProvider(<BottomBar />);
    fireEvent.click(screen.getByRole('button', { name: 'Visualizza log attività' }));
    expect(screen.getByText('Task completato')).toBeInTheDocument();
    expect(screen.getByText('Refactoring completato')).toBeInTheDocument();
  });

  it('mostra conteggio voci log', () => {
    renderWithProvider(<BottomBar />);
    fireEvent.click(screen.getByRole('button', { name: 'Visualizza log attività' }));
    expect(screen.getByText((t) => t.includes(`${defaultLogs.length} voci totali`))).toBeInTheDocument();
  });

  it('chiude modale log al click Chiudi', () => {
    renderWithProvider(<BottomBar />);
    fireEvent.click(screen.getByRole('button', { name: 'Visualizza log attività' }));
    const chiudiBtns = screen.getAllByText('Chiudi');
    fireEvent.click(chiudiBtns[0]);
    expect(screen.queryByText('Log Attività')).not.toBeInTheDocument();
  });

  it('mostra "Nessun log disponibile" quando logs vuoto', () => {
    renderWithProvider(<BottomBar />, { logs: [] });
    fireEvent.click(screen.getByRole('button', { name: 'Visualizza log attività' }));
    expect(screen.getByText('Nessun log disponibile')).toBeInTheDocument();
  });

  it('chiama exportReport al click Report', () => {
    const createSpy = vi.spyOn(document, 'createElement');
    renderWithProvider(<BottomBar />);
    fireEvent.click(screen.getByRole('button', { name: 'Esporta report' }));
    expect(createSpy).toHaveBeenCalledWith('a');
    createSpy.mockRestore();
  });
});
