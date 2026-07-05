import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MockOrchestratorProvider } from '../test/MockOrchestratorProvider';
import RecentActivity from './RecentActivity';

function renderWithProvider(ui: React.ReactElement, overrides = {}) {
  return render(<MockOrchestratorProvider overrides={overrides}>{ui}</MockOrchestratorProvider>);
}

describe('RecentActivity', () => {
  it('renderizza titolo Attività Recenti', () => {
    renderWithProvider(<RecentActivity />);
    expect(screen.getByText('Attività Recenti')).toBeInTheDocument();
  });

  it('mostra attività dai messaggi (default)', () => {
    renderWithProvider(<RecentActivity />);
    expect(screen.getByText('Direttore')).toBeInTheDocument();
    expect(screen.getByText('Ciao, come va?')).toBeInTheDocument();
    expect(screen.getByText('Utente')).toBeInTheDocument();
    expect(screen.getByText('Bene, grazie!')).toBeInTheDocument();
  });

  it('mostra attività dai log quando messaggi vuoti', () => {
    const logs = [
      { time: '10:30', agent: 'Direttore', color: '#a78bfa', msg: 'Task completato', agent_id: 'direttore' },
    ];
    renderWithProvider(<RecentActivity />, { messages: [], logs });
    expect(screen.getByText('Task completato')).toBeInTheDocument();
  });

  it('mostra fallback quando messaggi e log vuoti', () => {
    renderWithProvider(<RecentActivity />, { messages: [], logs: [] });
    expect(screen.getByText('ha creato test_api.py')).toBeInTheDocument();
    expect(screen.getByText('ha iniziato main.py')).toBeInTheDocument();
    expect(screen.getByText('ha proposto la struttura')).toBeInTheDocument();
    expect(screen.getByText('ha avviato WeatherBot project')).toBeInTheDocument();
  });

  it('mostra bottone "Vedi tutte le attività →" di default', () => {
    renderWithProvider(<RecentActivity />);
    expect(screen.getByText('Vedi tutte le attività →')).toBeInTheDocument();
  });

  it('mostra "Mostra meno ↑" dopo click su Vedi tutte', () => {
    renderWithProvider(<RecentActivity />);
    fireEvent.click(screen.getByText('Vedi tutte le attività →'));
    expect(screen.getByText('Mostra meno ↑')).toBeInTheDocument();
  });

  it('mostra solo 4 attività di default con più di 4 messaggi', () => {
    const messages = Array.from({ length: 6 }, (_, i) => ({
      id: `m${i}`,
      sender: 'Agente',
      sender_color: '#3b82f6',
      text: `Messaggio ${i + 1}`,
      time: `10:3${i}`,
    }));
    renderWithProvider(<RecentActivity />, { messages, logs: [] });
    // Component reverses messages → ultimi 4 = Messaggio 6,5,4,3
    expect(screen.getByText('Messaggio 6')).toBeInTheDocument();
    expect(screen.getByText('Messaggio 4')).toBeInTheDocument();
    expect(screen.queryByText('Messaggio 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Messaggio 1')).not.toBeInTheDocument();
  });

  it('trunca action oltre 50 caratteri', () => {
    const longText =
      'Questo è un messaggio molto lungo che dovrebbe essere troncato perché supera i cinquanta caratteri di lunghezza massima consentita';
    const messages = [
      { id: 'm1', sender: 'Agente', sender_color: '#3b82f6', text: longText, time: '10:00' },
    ];
    renderWithProvider(<RecentActivity />, { messages, logs: [] });
    const truncated = longText.slice(0, 50) + '…';
    expect(screen.getByText(truncated)).toBeInTheDocument();
  });

  it('mostra feed con role="feed"', () => {
    renderWithProvider(<RecentActivity />);
    expect(screen.getByRole('feed')).toBeInTheDocument();
  });
});
