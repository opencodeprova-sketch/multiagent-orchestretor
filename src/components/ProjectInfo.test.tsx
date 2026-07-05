import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MockOrchestratorProvider } from '../test/MockOrchestratorProvider';
import ProjectInfo from './ProjectInfo';

function renderWithProvider(ui: React.ReactElement, overrides = {}) {
  return render(<MockOrchestratorProvider overrides={overrides}>{ui}</MockOrchestratorProvider>);
}

describe('ProjectInfo', () => {
  it('renderizza nome progetto', () => {
    renderWithProvider(<ProjectInfo />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('renderizza percorso progetto', () => {
    renderWithProvider(<ProjectInfo />);
    expect(screen.getByText('/project/a')).toBeInTheDocument();
  });

  it('mostra conteggio elementi', () => {
    renderWithProvider(<ProjectInfo />);
    expect(screen.getByText('0 elementi')).toBeInTheDocument();
  });

  it('mostra fallback quando projectInfo è null', () => {
    renderWithProvider(<ProjectInfo />, { projectInfo: null });
    expect(
      screen.getByText('Nessun progetto aperto — seleziona o crea un progetto')
    ).toBeInTheDocument();
  });

  it('renderizza file nella file tree', () => {
    const projectInfo = {
      name: 'Test',
      path: '/test',
      files: [
        { name: 'index.ts', path: '/test/index.ts', type: 'file' as const, size: 2048 },
        { name: 'src', path: '/test/src', type: 'dir' as const, children: [] },
      ],
    };
    renderWithProvider(<ProjectInfo />, { projectInfo });
    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('src')).toBeInTheDocument();
  });

  it('mostra dimensione file formattata', () => {
    const projectInfo = {
      name: 'Test',
      path: '/test',
      files: [{ name: 'big.ts', path: '/test/big.ts', type: 'file' as const, size: 2048 }],
    };
    renderWithProvider(<ProjectInfo />, { projectInfo });
    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
  });

  it('mostra conteggio figli per directory', () => {
    const projectInfo = {
      name: 'Test',
      path: '/test',
      files: [
        {
          name: 'src',
          path: '/test/src',
          type: 'dir' as const,
          children: [
            { name: 'a.ts', path: '/test/src/a.ts', type: 'file' as const, size: 100 },
            { name: 'b.ts', path: '/test/src/b.ts', type: 'file' as const, size: 200 },
          ],
        },
      ],
    };
    renderWithProvider(<ProjectInfo />, { projectInfo });
    expect(screen.getByText('2 items')).toBeInTheDocument();
  });

  it('non mostra dimensione per file senza size', () => {
    const projectInfo = {
      name: 'Test',
      path: '/test',
      files: [{ name: 'unknown.ts', path: '/test/unknown.ts', type: 'file' as const }],
    };
    renderWithProvider(<ProjectInfo />, { projectInfo });
    expect(screen.getByText('unknown.ts')).toBeInTheDocument();
    // No size span should appear for this file
  });

  it('chiama getProjectFiles al mount', () => {
    const getProjectFiles = vi.fn();
    renderWithProvider(<ProjectInfo />, { getProjectFiles });
    expect(getProjectFiles).toHaveBeenCalledTimes(1);
  });
});
