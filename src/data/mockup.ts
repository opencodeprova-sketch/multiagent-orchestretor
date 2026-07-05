// Solo costanti decorative — tutto il resto viene da OpenCode config

export const AGENT_ICONS: Record<string, { emoji: string; color: string }> = {
  Manager: { emoji: '🧠', color: '#f97316' },
  Architect: { emoji: '🏗️', color: '#3b82f6' },
  Coder: { emoji: '💻', color: '#22c55e' },
  Tester: { emoji: '🧪', color: '#a855f7' },
};

export const ROADMAP_PHASES = [
  {
    id: 1,
    label: 'Analisi e Definizione Obiettivi',
    status: 'completed' as const,
    subtasks: [],
  },
  {
    id: 2,
    label: 'Progettazione Architetturale',
    status: 'in_progress' as const,
    subtasks: [
      { label: 'Analisi requisiti', status: 'completed' as const },
      { label: 'Architettura sistema', status: 'in_progress' as const },
      { label: 'Diagrammi componenti', status: 'waiting' as const },
    ],
  },
  {
    id: 3,
    label: 'Implementazione',
    status: 'waiting' as const,
    subtasks: [],
  },
  {
    id: 4,
    label: 'Testing e Validazione',
    status: 'waiting' as const,
    subtasks: [],
  },
  {
    id: 5,
    label: 'Deploy e Monitoraggio',
    status: 'waiting' as const,
    subtasks: [],
  },
];

export const STATUS_LABEL: Record<string, string> = {
  operational: 'OPERATIVO',
  working: 'LAVORANDO',
  waiting: 'WAITING',
  error: 'ERRORE',
  idle: 'IDLE',
};

export const STATUS_PANEL_LABEL: Record<string, string> = {
  Manager: 'Idle',
  Architect: 'Designing',
  Coder: 'Coding',
  Tester: 'Waiting',
  operational: 'Idle',
  working: 'Coding',
  waiting: 'Waiting',
  idle: 'Idle',
  error: 'Errore',
};

export const WORKFLOW_PHASES = [
  {
    id: 1,
    label: 'Analisi Richieste',
    status: 'completed' as const,
    subtasks: [
      { label: 'Ricezione input utente', status: 'completed' as const },
      { label: 'Scomposizione in sotto-task', status: 'completed' as const },
      { label: 'Classificazione priorità', status: 'completed' as const },
    ],
  },
  {
    id: 2,
    label: 'Selezione Specialisti',
    status: 'completed' as const,
    subtasks: [
      { label: 'Mappatura task → agente', status: 'completed' as const },
      { label: 'Verifica disponibilità', status: 'completed' as const },
      { label: 'Preparazione contesto', status: 'completed' as const },
    ],
  },
  {
    id: 3,
    label: 'Delega e Esecuzione',
    status: 'in_progress' as const,
    subtasks: [
      { label: 'Invio task via task()', status: 'in_progress' as const },
      { label: 'Monitoraggio avanzamento', status: 'in_progress' as const },
      { label: 'Raccolta output parziali', status: 'pending' as const },
    ],
  },
  {
    id: 4,
    label: 'Verifica e Controllo',
    status: 'waiting' as const,
    subtasks: [
      { label: 'Review codice', status: 'pending' as const },
      { label: 'Esecuzione test', status: 'pending' as const },
      { label: 'Validazione gate qualità', status: 'pending' as const },
    ],
  },
  {
    id: 5,
    label: 'Integrazione Finale',
    status: 'waiting' as const,
    subtasks: [
      { label: 'Delega a code-integrator', status: 'pending' as const },
      { label: 'Commit Git', status: 'pending' as const },
      { label: 'Aggiornamento documentazione', status: 'pending' as const },
    ],
  },
];

export const STATUS_DOT: Record<string, string> = {
  Idle: 'bg-green-400',
  Designing: 'bg-orange-400',
  Coding: 'bg-orange-400',
  Waiting: 'bg-blue-400',
  Errore: 'bg-red-400',
};
