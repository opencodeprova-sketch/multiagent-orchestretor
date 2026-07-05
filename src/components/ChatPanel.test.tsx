import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatPanel from './ChatPanel';
import { MockOrchestratorProvider } from '../test/MockOrchestratorProvider';

beforeEach(() => {
  // jsdom does not implement scrollTo
  Element.prototype.scrollTo = vi.fn() as unknown as (
    options?: ScrollToOptions | undefined,
  ) => void;
});

function renderWithProvider(ui: React.ReactElement, overrides = {}) {
  return render(<MockOrchestratorProvider overrides={overrides}>{ui}</MockOrchestratorProvider>);
}

describe('ChatPanel', () => {
  it('renderizza titolo chat', () => {
    renderWithProvider(<ChatPanel />);
    expect(screen.getByText('Chat Inter-Agenti')).toBeInTheDocument();
  });

  it('mostra selettore destinatario', () => {
    renderWithProvider(<ChatPanel />);
    expect(screen.getByText('Verso')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tutti gli agenti')).toBeInTheDocument();
  });

  it('mostra messaggi dal contesto', () => {
    renderWithProvider(<ChatPanel />);
    expect(screen.getByText('Ciao, come va?')).toBeInTheDocument();
    expect(screen.getByText('Bene, grazie!')).toBeInTheDocument();
  });

  it('mostra nome mittente messaggio', () => {
    renderWithProvider(<ChatPanel />);
    expect(screen.getByText('Direttore')).toBeInTheDocument();
    expect(screen.getByText('Utente')).toBeInTheDocument();
  });

  it('mostra input chat', () => {
    renderWithProvider(<ChatPanel />);
    expect(screen.getByPlaceholderText('Intervieni nella discussione...')).toBeInTheDocument();
  });

  it('mostra input disabilitato quando non connesso', () => {
    renderWithProvider(<ChatPanel />, { connected: false });
    expect(screen.getByPlaceholderText('In attesa del backend...')).toBeDisabled();
  });

  it('mostra FALLBACK_MESSAGES quando disconnesso e nessun messaggio', () => {
    renderWithProvider(<ChatPanel />, { connected: false, messages: [] });
    expect(screen.getByText('Start WeatherBot project. Implement API call.')).toBeInTheDocument();
    expect(screen.getByText('Proposed structure: config for API keys, main for logic.')).toBeInTheDocument();
    expect(screen.getByText('Sounds good. Starting main.py.')).toBeInTheDocument();
    expect(screen.getByText('Will create basic test case now.')).toBeInTheDocument();
  });

  it('mostra stato vuoto quando connesso e nessun messaggio', () => {
    renderWithProvider(<ChatPanel />, { messages: [] });
    expect(screen.getByText('Invia un messaggio per avviare la discussione.')).toBeInTheDocument();
  });

  it('pulsante invio disabilitato se input vuoto', () => {
    renderWithProvider(<ChatPanel />);
    const sendBtn = screen.getByRole('button', { name: '' });
    expect(sendBtn).toBeDisabled();
  });

  it('abilita pulsante invio se input non vuoto', () => {
    renderWithProvider(<ChatPanel />);
    const input = screen.getByPlaceholderText('Intervieni nella discussione...');
    fireEvent.change(input, { target: { value: 'test messaggio' } });
    const sendBtn = screen.getByRole('button', { name: '' });
    expect(sendBtn).not.toBeDisabled();
  });

  it('chiama sendChat al click invio', () => {
    const sendChat = vi.fn();
    renderWithProvider(<ChatPanel />, { sendChat });
    const input = screen.getByPlaceholderText('Intervieni nella discussione...');
    fireEvent.change(input, { target: { value: 'test messaggio' } });
    const sendBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(sendBtn);
    expect(sendChat).toHaveBeenCalledWith('test messaggio', 'all');
  });

  it('chiama sendChat con Enter', () => {
    const sendChat = vi.fn();
    renderWithProvider(<ChatPanel />, { sendChat });
    const input = screen.getByPlaceholderText('Intervieni nella discussione...');
    fireEvent.change(input, { target: { value: 'test messaggio' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(sendChat).toHaveBeenCalledWith('test messaggio', 'all');
  });

  it('svuota input dopo invio', () => {
    const sendChat = vi.fn();
    renderWithProvider(<ChatPanel />, { sendChat });
    const input = screen.getByPlaceholderText('Intervieni nella discussione...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test messaggio' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input.value).toBe('');
  });

  it('mostra selettore con agente da config', () => {
    const opencodeConfig = {
      agents: { 'tester': { name: 'Tester', content: '' } },
      skills: {}, commands: {}, rules: '', mcp_servers: {}, plugins: [], raw_config: {},
    };
    renderWithProvider(<ChatPanel />, { opencodeConfig });
    expect(screen.getByDisplayValue('Tutti gli agenti')).toBeInTheDocument();
  });

  it('disabilita selettore quando non connesso', () => {
    renderWithProvider(<ChatPanel />, { connected: false });
    expect(screen.getByDisplayValue('Tutti gli agenti')).toBeDisabled();
  });

  it('non invia se non connesso', () => {
    const sendChat = vi.fn();
    renderWithProvider(<ChatPanel />, { connected: false, sendChat });
    const input = screen.getByPlaceholderText('In attesa del backend...');
    fireEvent.change(input, { target: { value: 'test' } });
    const sendBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(sendBtn);
    expect(sendChat).not.toHaveBeenCalled();
  });
});
