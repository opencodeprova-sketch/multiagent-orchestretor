import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TopBar from './TopBar';
import { MockOrchestratorProvider } from '../test/MockOrchestratorProvider';

function renderWithProvider(ui: React.ReactElement, overrides = {}) {
  return render(<MockOrchestratorProvider overrides={overrides}>{ui}</MockOrchestratorProvider>);
}

describe('TopBar', () => {
  it('renderizza titolo progetto', () => {
    renderWithProvider(<TopBar />);
    expect(screen.getByText('Opencode Agentic Orchestrator')).toBeInTheDocument();
  });

  it('renderizza versione', () => {
    renderWithProvider(<TopBar />);
    expect(screen.getByText('v0.2.0')).toBeInTheDocument();
  });

  it('renderizza selettore modello', () => {
    renderWithProvider(<TopBar />);
    expect(screen.getByDisplayValue('Auto')).toBeInTheDocument();
  });

  it('mostra pulsante Nuovo Progetto', () => {
    renderWithProvider(<TopBar />);
    expect(screen.getByText('Nuovo Progetto')).toBeInTheDocument();
  });

  it('mostra pulsante Salva', () => {
    renderWithProvider(<TopBar />);
    expect(screen.getByText('Salva')).toBeInTheDocument();
  });

  it('mostra pulsante Sincronizza ora', () => {
    renderWithProvider(<TopBar />);
    expect(screen.getByText('🔄 Sincronizza ora')).toBeInTheDocument();
  });

  it('mostra pulsante Impostazioni Globali', () => {
    renderWithProvider(<TopBar />);
    const btns = screen.getAllByText('Impostazioni Globali');
    expect(btns.length).toBeGreaterThanOrEqual(1);
  });

  it('mostra pulsante Apri Progetto', () => {
    renderWithProvider(<TopBar />);
    expect(screen.getByText('📁 Apri Progetto')).toBeInTheDocument();
  });

  it('mostra pulsante Crea Nuovo Agente', () => {
    renderWithProvider(<TopBar />);
    expect(screen.getByText('Crea Nuovo Agente')).toBeInTheDocument();
  });

  it('mostra pulsante Memoria e Regole', () => {
    renderWithProvider(<TopBar />);
    const btns = screen.getAllByText('Memoria e Regole');
    expect(btns.length).toBeGreaterThanOrEqual(1);
  });

  it('mostra pulsante Carica file (globale)', () => {
    renderWithProvider(<TopBar />);
    expect(screen.getByText('Carica file (globale)')).toBeInTheDocument();
  });

  it('mostra progresso progetto', () => {
    renderWithProvider(<TopBar />);
    expect(screen.getByText('PROGRESSO PROGETTO')).toBeInTheDocument();
  });

  it('mostra temperatura', () => {
    renderWithProvider(<TopBar />);
    expect(screen.getByText((t) => t.includes('T:') && t.includes('0.7'))).toBeInTheDocument();
  });

  it('mostra stato connesso', () => {
    renderWithProvider(<TopBar />);
    expect(screen.getByText('Connesso')).toBeInTheDocument();
  });

  it('mostra stato disconnesso quando connected=false', () => {
    renderWithProvider(<TopBar />, { connected: false });
    expect(screen.getByText('Disconnesso')).toBeInTheDocument();
  });

  it('apre modale impostazioni al click', () => {
    renderWithProvider(<TopBar />);
    fireEvent.click(screen.getByText('Impostazioni Globali'));
    const headings = screen.getAllByText('Impostazioni Globali');
    expect(headings.length).toBe(2); // button + h3
    expect(headings[1].tagName).toBe('H3');
  });

  it('apre modale crea agente al click', () => {
    renderWithProvider(<TopBar />);
    fireEvent.click(screen.getByText('Crea Nuovo Agente'));
    expect(screen.getByText('NOME AGENTE')).toBeInTheDocument();
  });

  it('apre modale memoria al click', () => {
    renderWithProvider(<TopBar />);
    fireEvent.click(screen.getByText('Memoria e Regole'));
    const headings = screen.getAllByText('Memoria e Regole');
    expect(headings.length).toBe(2); // button + h3
    expect(headings[1].tagName).toBe('H3');
  });

  it('apre modale nuovo progetto al click', () => {
    renderWithProvider(<TopBar />);
    fireEvent.click(screen.getByText('Nuovo Progetto'));
    expect(screen.getByText('NOME PROGETTO')).toBeInTheDocument();
  });

  it('chiama syncFromOpencode al click Sincronizza ora', () => {
    const syncFromOpencode = vi.fn();
    renderWithProvider(<TopBar />, { syncFromOpencode });
    fireEvent.click(screen.getByText('🔄 Sincronizza ora'));
    expect(syncFromOpencode).toHaveBeenCalled();
  });

  it('chiama saveProject al click Salva', () => {
    const saveProject = vi.fn();
    renderWithProvider(<TopBar />, { saveProject });
    fireEvent.click(screen.getByText('Salva'));
    expect(saveProject).toHaveBeenCalled();
  });

  it('crea agente con nome e ruolo nel modale', () => {
    const createAgent = vi.fn();
    renderWithProvider(<TopBar />, { createAgent });
    fireEvent.click(screen.getByText('Crea Nuovo Agente'));
    fireEvent.change(screen.getByPlaceholderText('es. SecurityReviewer'), { target: { value: 'TestAgent' } });
    fireEvent.change(screen.getByPlaceholderText('es. Analisi sicurezza e vulnerability assessment'), { target: { value: 'Tester' } });
    fireEvent.click(screen.getByText('Crea'));
    expect(createAgent).toHaveBeenCalledWith('TestAgent', 'Tester', '');
  });

  it('non crea agente se nome vuoto', () => {
    const createAgent = vi.fn();
    renderWithProvider(<TopBar />, { createAgent });
    fireEvent.click(screen.getByText('Crea Nuovo Agente'));
    fireEvent.click(screen.getByText('Crea'));
    expect(createAgent).not.toHaveBeenCalled();
  });

  it('non crea agente se ruolo vuoto ma nome presente', () => {
    const createAgent = vi.fn();
    renderWithProvider(<TopBar />, { createAgent });
    fireEvent.click(screen.getByText('Crea Nuovo Agente'));
    fireEvent.change(screen.getByPlaceholderText('es. SecurityReviewer'), { target: { value: 'TestAgent' } });
    fireEvent.click(screen.getByText('Crea'));
    expect(createAgent).not.toHaveBeenCalled();
  });

  it('crea agente con task iniziale', () => {
    const createAgent = vi.fn();
    renderWithProvider(<TopBar />, { createAgent });
    fireEvent.click(screen.getByText('Crea Nuovo Agente'));
    fireEvent.change(screen.getByPlaceholderText('es. SecurityReviewer'), { target: { value: 'TestAgent' } });
    fireEvent.change(screen.getByPlaceholderText('es. Analisi sicurezza e vulnerability assessment'), { target: { value: 'Tester' } });
    fireEvent.change(screen.getByPlaceholderText('es. Analizza il progetto per vulnerabilità'), { target: { value: 'Analizza sicurezza' } });
    fireEvent.click(screen.getByText('Crea'));
    expect(createAgent).toHaveBeenCalledWith('TestAgent', 'Tester', 'Analizza sicurezza');
  });

  it('apre e chiude modale impostazioni', () => {
    renderWithProvider(<TopBar />);
    fireEvent.click(screen.getByText('Impostazioni Globali'));
    expect(screen.getByText('CARTELLA PROGETTO')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Annulla'));
    expect(screen.queryByText('CARTELLA PROGETTO')).not.toBeInTheDocument();
  });

  it('salva impostazioni', () => {
    const updateSettings = vi.fn();
    renderWithProvider(<TopBar />, { updateSettings });
    fireEvent.click(screen.getByText('Impostazioni Globali'));
    const saveBtns = screen.getAllByText('Salva');
    const modalSaveBtn = saveBtns.find(b => b.closest('.fixed')); // inside modal
    expect(modalSaveBtn).not.toBeUndefined();
    fireEvent.click(modalSaveBtn!);
    expect(updateSettings).toHaveBeenCalledWith(expect.objectContaining({ project_dir: '' }));
  });

  it('crea nuovo progetto con nome', () => {
    const send = vi.fn();
    renderWithProvider(<TopBar />, { send });
    fireEvent.click(screen.getByText('Nuovo Progetto'));
    fireEvent.change(screen.getByPlaceholderText('es. MyAwesomeProject'), { target: { value: 'TestProj' } });
    fireEvent.click(screen.getByText('Crea'));
    expect(send).toHaveBeenCalledWith('new_project', { name: 'TestProj', path: undefined });
  });

  it('chiude modale nuovo progetto senza creare', () => {
    renderWithProvider(<TopBar />);
    fireEvent.click(screen.getByText('Nuovo Progetto'));
    fireEvent.click(screen.getByText('Annulla'));
    expect(screen.queryByText('NOME PROGETTO')).not.toBeInTheDocument();
  });

  it('salva tutte le memorie nel modale memoria', () => {
    const saveGlobalRules = vi.fn();
    const saveGlobalMemory = vi.fn();
    const saveMemory = vi.fn();
    const saveProjectRules = vi.fn();
    renderWithProvider(<TopBar />, { saveGlobalRules, saveGlobalMemory, saveMemory, saveProjectRules });
    fireEvent.click(screen.getByText('Memoria e Regole'));
    fireEvent.click(screen.getByText('Salva Tutto'));
    expect(saveGlobalRules).toHaveBeenCalled();
    expect(saveGlobalMemory).toHaveBeenCalled();
    expect(saveMemory).toHaveBeenCalled();
    expect(saveProjectRules).toHaveBeenCalled();
  });

  it('chiude modale memoria con Chiudi', () => {
    renderWithProvider(<TopBar />);
    fireEvent.click(screen.getByText('Memoria e Regole'));
    fireEvent.click(screen.getByText('Chiudi'));
    expect(screen.queryByText('Memoria Globale')).not.toBeInTheDocument();
  });

  it('apre modale memoria tramite memoryTrigger', () => {
    renderWithProvider(<TopBar memoryTrigger={1} />);
    expect(screen.getByText('Memoria Globale')).toBeInTheDocument();
  });

  it('cambia selettore modello', () => {
    const updateSettings = vi.fn();
    renderWithProvider(<TopBar />, { updateSettings });
    const select = screen.getByDisplayValue('Auto');
    fireEvent.change(select, { target: { value: 'llama-3.3-70b' } });
    expect(updateSettings).toHaveBeenCalledWith({ model: 'llama-3.3-70b' });
  });

  it('mostra stato connesso con opencodeInstalled false', () => {
    renderWithProvider(<TopBar />, { connected: true, opencodeInstalled: false });
    expect(screen.getByText('Connesso')).toBeInTheDocument();
  });

  it('clicca pulsante Carica file (globale)', () => {
    renderWithProvider(<TopBar />);
    const btn = screen.getByText('Carica file (globale)');
    fireEvent.click(btn);
    // should not throw - triggers hidden file input
    expect(btn).toBeInTheDocument();
  });

  it('clicca pulsante Apri Progetto', () => {
    const sendChat = vi.fn();
    renderWithProvider(<TopBar />, { sendChat });
    const btn = screen.getByText('📁 Apri Progetto');
    fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });

  it('cambia temperatura tramite slider', async () => {
    vi.useFakeTimers();
    const updateSettings = vi.fn();
    renderWithProvider(<TopBar />, { updateSettings });
    fireEvent.click(screen.getByText('Impostazioni Globali'));
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: '1.5' } });
    // Display updates immediately
    expect(screen.getByText('1.5')).toBeInTheDocument();
    // Let debounce fire
    vi.advanceTimersByTime(600);
    expect(updateSettings).toHaveBeenCalledWith({ temperature: 1.5 });
    vi.useRealTimers();
  });

  it('apre progetto tramite folder picker', () => {
    const sendChat = vi.fn();
    renderWithProvider(<TopBar />, { sendChat });
    const picker = document.querySelector('[webkitdirectory]');
    expect(picker).not.toBeNull();
    const file = { webkitRelativePath: 'test-project/main.ts', name: 'main.ts' };
    Object.defineProperty(picker!, 'files', { value: [file] });
    fireEvent.change(picker!);
    expect(sendChat).toHaveBeenCalledWith('/boot-progetto test-project', 'coder');
  });

  it('gestisce handleFileUpload con file .md', async () => {
    renderWithProvider(<TopBar />);
    fireEvent.click(screen.getByText('Memoria e Regole'));
    const uploadBtns = screen.getAllByText('📂 Carica .md');
    fireEvent.click(uploadBtns[0]); // Project Memory upload

    const fileInputs = document.querySelectorAll('input[type="file"]');
    const modalInput = Array.from(fileInputs).find(i => i.getAttribute('accept')?.includes('.md,.markdown'));
    expect(modalInput).not.toBeNull();
    const file = new File(['test content'], 'test.md', { type: 'text/markdown' });
    Object.defineProperty(modalInput!, 'files', { value: [file] });
    fireEvent.change(modalInput!);
    await waitFor(() => {
      expect(screen.getByDisplayValue('test content')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
