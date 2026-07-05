import { createContext, useContext, type ReactNode } from 'react';
import { useOrchestrator } from '../hooks/useOrchestrator';

type OrchestratorContextValue = ReturnType<typeof useOrchestrator>;

const OrchestratorContext = createContext<OrchestratorContextValue | null>(null);

export function OrchestratorProvider({ children }: { children: ReactNode }) {
  const value = useOrchestrator();
  return <OrchestratorContext.Provider value={value}>{children}</OrchestratorContext.Provider>;
}

export function useOrchestratorContext() {
  const ctx = useContext(OrchestratorContext);
  if (!ctx) throw new Error('useOrchestratorContext must be used within OrchestratorProvider');
  return ctx;
}
