import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle, AutonomyPanel, SyncPanel } from './SyncPanel';

describe('Toggle', () => {
  it('renderizza label', () => {
    render(<Toggle checked={false} onChange={vi.fn()} label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('mostra stato checked', () => {
    render(<Toggle checked={true} onChange={vi.fn()} label="Test" />);
    const btn = screen.getByRole('switch');
    expect(btn).toHaveAttribute('aria-checked', 'true');
  });

  it('mostra stato unchecked', () => {
    render(<Toggle checked={false} onChange={vi.fn()} label="Test" />);
    const btn = screen.getByRole('switch');
    expect(btn).toHaveAttribute('aria-checked', 'false');
  });

  it('chiama onChange al click', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} label="Test" />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('non chiama onChange quando disabled', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} label="Test" disabled />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('AutonomyPanel', () => {
  const base = {
    autonomyLevel: 'medium' as const,
    fullAuto: true,
    humanApproval: false,
    connected: true,
    onAutonomyChange: vi.fn(),
    onFullAutoChange: vi.fn(),
    onHumanApprovalChange: vi.fn(),
  };

  it('renderizza livello autonomia', () => {
    render(<AutonomyPanel {...base} />);
    expect(screen.getByText('MEDIA')).toBeInTheDocument();
  });

  it('renderizza livelli basso e alto', () => {
    render(<AutonomyPanel {...base} />);
    expect(screen.getByText('BASSA')).toBeInTheDocument();
    expect(screen.getByText('ALTA')).toBeInTheDocument();
  });

  it('renderizza toggle Full Auto', () => {
    render(<AutonomyPanel {...base} />);
    const fullAutoToggle = screen.getAllByRole('switch')[0];
    expect(fullAutoToggle).toHaveAttribute('aria-checked', 'true');
  });

  it('renderizza label livello', () => {
    render(<AutonomyPanel {...base} autonomyLevel="high" />);
    const labels = screen.getAllByText('ALTA');
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('slider range presente', () => {
    render(<AutonomyPanel {...base} />);
    const slider = document.querySelector('input[type="range"]');
    expect(slider).toBeInTheDocument();
  });
});

describe('SyncPanel', () => {
  it('mostra stato connesso quando connected + installed', () => {
    render(<SyncPanel connected={true} opencodeInstalled={true} lastSync="10:00" onSync={vi.fn()} />);
    expect(screen.getByText('Connesso')).toBeInTheDocument();
  });

  it('mostra backend ok quando connected ma non installed', () => {
    render(<SyncPanel connected={true} opencodeInstalled={false} lastSync="--:--" onSync={vi.fn()} />);
    expect(screen.getByText('Backend OK')).toBeInTheDocument();
  });

  it('mostra disconnesso quando non connected', () => {
    render(<SyncPanel connected={false} opencodeInstalled={false} lastSync="--:--" onSync={vi.fn()} />);
    expect(screen.getByText('Disconnesso')).toBeInTheDocument();
  });

  it('mostra ultimo sync', () => {
    render(<SyncPanel connected={true} opencodeInstalled={true} lastSync="14:30" onSync={vi.fn()} />);
    expect(screen.getByText(/Ultimo sync: 14:30/)).toBeInTheDocument();
  });

  it('bottone sync è disabilitato quando offline', () => {
    render(<SyncPanel connected={false} opencodeInstalled={false} lastSync="--:--" onSync={vi.fn()} />);
    expect(screen.getByText('Sincronizza')).toBeDisabled();
  });

  it('chiama onSync al click', () => {
    const onSync = vi.fn();
    render(<SyncPanel connected={true} opencodeInstalled={true} lastSync="10:00" onSync={onSync} />);
    fireEvent.click(screen.getByText('Sincronizza'));
    expect(onSync).toHaveBeenCalledOnce();
  });
});
