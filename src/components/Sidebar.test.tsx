import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';
import { MockOrchestratorProvider, defaultMetrics } from '../test/MockOrchestratorProvider';
import type { OpenCodeConfig } from '../types/orchestrator';

const opencodeConfig: OpenCodeConfig = {
  agents: {
    'direttore': { name: 'Direttore', content: '' },
    'coder': { name: 'Coder', content: '' },
  },
  skills: {
    'ponytail': 'description: Minimalist approach',
    'graphify': 'description: Knowledge graph',
  },
  commands: {
    'test': { name: 'test', description: 'Comando test', content: '' },
    'build': { name: 'build', description: 'Build progetto', content: '' },
  },
  rules: '',
  mcp_servers: { 'blender-mcp': true, 'arduino': false },
  plugins: ['plugin-x', 'plugin-y'],
  raw_config: {},
};

function renderWithProvider(ui: React.ReactElement, overrides = {}) {
  return render(<MockOrchestratorProvider overrides={overrides}>{ui}</MockOrchestratorProvider>);
}

describe('Sidebar', () => {
  it('renderizza navigazione Panoramica', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    expect(screen.getByText('Panoramica')).toBeInTheDocument();
  });

  it('renderizza sezione Agenti', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    expect(screen.getByText('Agenti')).toBeInTheDocument();
  });

  it('renderizza agenti da config', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    expect(screen.getByText('Direttore')).toBeInTheDocument();
    expect(screen.getByText('Coder')).toBeInTheDocument();
  });

  it('renderizza pulsante + Nuovo agente', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    expect(screen.getByText('+ Nuovo agente')).toBeInTheDocument();
  });

  it('mostra input crea agente al click', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    fireEvent.click(screen.getByText('+ Nuovo agente'));
    expect(screen.getByPlaceholderText('Nome agente')).toBeInTheDocument();
  });

  it('sezione MCP collassabile', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    expect(screen.getByText('MCP Servers')).toBeInTheDocument();
  });

  it('mostra server MCP quando espanso', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    fireEvent.click(screen.getByText('MCP Servers'));
    expect(screen.getByText('blender-mcp')).toBeInTheDocument();
    expect(screen.getByText('arduino')).toBeInTheDocument();
  });

  it('sezione Plugin collassabile', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    expect(screen.getByText('Plugin')).toBeInTheDocument();
  });

  it('mostra plugin quando espanso', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    fireEvent.click(screen.getByText('Plugin'));
    expect(screen.getByText('plugin-x')).toBeInTheDocument();
    expect(screen.getByText('plugin-y')).toBeInTheDocument();
  });

  it('sezione Skills collassabile', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    expect(screen.getByText('Skills')).toBeInTheDocument();
  });

  it('mostra skills quando espanso', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    fireEvent.click(screen.getByText('Skills'));
    expect(screen.getByText('ponytail')).toBeInTheDocument();
    expect(screen.getByText('graphify')).toBeInTheDocument();
  });

  it('sezione Comandi collassabile', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    expect(screen.getByText('Comandi')).toBeInTheDocument();
  });

  it('mostra comandi quando espanso', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    fireEvent.click(screen.getByText('Comandi'));
    expect(screen.getByText('/test')).toBeInTheDocument();
    expect(screen.getByText('/build')).toBeInTheDocument();
  });

  it('mostra sistema widget con stato operativo', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    expect(screen.getByText('Sistema')).toBeInTheDocument();
    expect(screen.getByText('Operativo')).toBeInTheDocument();
  });

  it('mostra sistema offline quando disconnected', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig, connected: false });
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('mostra metriche sistema', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    expect(screen.getByText('Memoria')).toBeInTheDocument();
    expect(screen.getByText('CPU')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
  });

  it('chiama onAgentRulesClick al click su agente', () => {
    const onAgentRulesClick = vi.fn();
    renderWithProvider(<Sidebar onAgentRulesClick={onAgentRulesClick} />, { opencodeConfig });
    fireEvent.click(screen.getByText('Direttore'));
    expect(onAgentRulesClick).toHaveBeenCalledWith('direttore');
  });

  it('chiama onMemoryClick al click su Memoria Progetto', () => {
    const onMemoryClick = vi.fn();
    renderWithProvider(<Sidebar onMemoryClick={onMemoryClick} />, { opencodeConfig });
    fireEvent.click(screen.getByText('Memoria Progetto'));
    expect(onMemoryClick).toHaveBeenCalled();
  });

  it('chiama onMemoryClick al click su Regole Globali', () => {
    const onMemoryClick = vi.fn();
    renderWithProvider(<Sidebar onMemoryClick={onMemoryClick} />, { opencodeConfig });
    fireEvent.click(screen.getByText('Regole Globali'));
    expect(onMemoryClick).toHaveBeenCalled();
  });

  it('mostra "Nessun comando trovato" quando comandi vuoti', () => {
    const configNoCmds = { ...opencodeConfig, commands: {} };
    renderWithProvider(<Sidebar />, { opencodeConfig: configNoCmds });
    fireEvent.click(screen.getByText('Comandi'));
    expect(screen.getByText('Nessun comando trovato')).toBeInTheDocument();
  });

  it('toggle MCP switch chiama toggleMcp', () => {
    const toggleMcp = vi.fn();
    renderWithProvider(<Sidebar />, { opencodeConfig, toggleMcp });
    fireEvent.click(screen.getByText('MCP Servers'));
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);
    expect(toggleMcp).toHaveBeenCalled();
  });

  it('mostra tooltip comando al mouseEnter', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    fireEvent.click(screen.getByText('Comandi'));
    fireEvent.mouseEnter(screen.getByText('/test'));
    expect(screen.getByText('Comando test')).toBeInTheDocument();
  });

  it('mostra tooltip MCP server al mouseEnter', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    fireEvent.click(screen.getByText('MCP Servers'));
    fireEvent.mouseEnter(screen.getByText('blender-mcp'));
    expect(screen.getByText(/Controllo Blender 3D/)).toBeInTheDocument();
  });

  it('toggle plugin switch chiama togglePlugin', () => {
    const togglePlugin = vi.fn();
    renderWithProvider(<Sidebar />, { opencodeConfig, togglePlugin });
    fireEvent.click(screen.getByText('Plugin'));
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);
    expect(togglePlugin).toHaveBeenCalled();
  });

  it('toggle skill switch chiama toggleSkill', () => {
    const toggleSkill = vi.fn();
    renderWithProvider(<Sidebar />, { opencodeConfig, toggleSkill });
    fireEvent.click(screen.getByText('Skills'));
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);
    expect(toggleSkill).toHaveBeenCalled();
  });

  it('conferma creazione agente con nome', () => {
    const createAgent = vi.fn();
    renderWithProvider(<Sidebar />, { opencodeConfig, createAgent });
    fireEvent.click(screen.getByText('+ Nuovo agente'));
    fireEvent.change(screen.getByPlaceholderText('Nome agente'), { target: { value: 'ReviewerAgent' } });
    fireEvent.change(screen.getByPlaceholderText('Ruolo'), { target: { value: 'Code Reviewer' } });
    fireEvent.click(screen.getByText('Crea'));
    expect(createAgent).toHaveBeenCalledWith('ReviewerAgent', 'Code Reviewer', '');
  });

  it('annulla creazione agente', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    fireEvent.click(screen.getByText('+ Nuovo agente'));
    fireEvent.click(screen.getByText('Annulla'));
    expect(screen.queryByPlaceholderText('Nome agente')).not.toBeInTheDocument();
  });

  it('gestisce opencodeConfig null', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig: null });
    expect(screen.getByText('Agenti')).toBeInTheDocument();
    expect(screen.queryByText('Direttore')).not.toBeInTheDocument();
  });

  it('mostra agente con stato working', () => {
    const agentsList = [
      { id: 'direttore', name: 'Direttore', status: 'working', color: '#f97316', progress: 50, activities: [], files: [], stats: { completed: 0, in_progress: 0, waiting: 0 }, spark_data: [] },
    ];
    renderWithProvider(<Sidebar />, { opencodeConfig, agentsList });
    expect(screen.getByText('Direttore')).toBeInTheDocument();
  });

  it('mostra agente con stato waiting', () => {
    const agentsList = [
      { id: 'direttore', name: 'Direttore', status: 'waiting', color: '#f97316', progress: 50, activities: [], files: [], stats: { completed: 0, in_progress: 0, waiting: 0 }, spark_data: [] },
    ];
    renderWithProvider(<Sidebar />, { opencodeConfig, agentsList });
    expect(screen.getByText('Direttore')).toBeInTheDocument();
  });

  it('mostra badge conteggio agenti e comandi', () => {
    renderWithProvider(<Sidebar />, { opencodeConfig });
    const twos = screen.getAllByText('2');
    expect(twos.length).toBeGreaterThanOrEqual(2); // agents count + commands count
  });
});
