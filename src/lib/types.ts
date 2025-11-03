// src/lib/types.ts
export type Signal = {
  key: string;
  value: string | number;
  weight?: number; // 0..1
};

export type Task = {
  id: string;
  kind:
    | 'SCORE_LEAD'
    | 'DRAFT_EMAIL'
    | 'PAUSE_SEQUENCE'
    | 'BOOK_MEETING'
    | 'RESEARCH_ACCOUNT'
    | 'ANALYZE_REPLIES'
    | 'RE_ENGAGE'
    | 'MONITOR_DELIVERY'
    | 'DRAFT_SUMMARY';
  title: string;
  ts: number; // epoch ms
  metadata: Record<string, any>;
};

export type Decision = {
  action: string;               // e.g., "PAUSE_SEQUENCE"
  reason_summary: string;       // 1-2 lines
  confidence: number;           // 0..1
  considered: string[];         // alternates
  signals: Signal[];            // evidence
};

// V2 Enhancements

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum FeedbackKind {
  AWESOME = 'AWESOME',
  NOT_IDEAL = 'NOT_IDEAL',
  NEVER_DO_THIS = 'NEVER_DO_THIS',
}

export type TaskStep = {
  name: string;
  completed: boolean;
};

export type InProgressTask = {
  id: string;
  task: Task;
  decision: Decision;
  steps: TaskStep[];
  currentStep: number;
};

export type CompletedTask = {
  id: string;
  task: Task;
  decision: Decision;
  completedAt: number;
  feedback?: FeedbackKind;
};

export type Feedback = {
  taskId: string;
  kind: FeedbackKind;
  impact?: string;
  timestamp: number;
};

