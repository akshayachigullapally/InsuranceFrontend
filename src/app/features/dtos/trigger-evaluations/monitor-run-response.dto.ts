export const MONITOR_RUN_STATUSES = [
  'RUNNING',
  'COMPLETED',
  'FAILED',
] as const;

export type MonitorRunStatus = (typeof MONITOR_RUN_STATUSES)[number];

export interface MonitorRunResponse {
  id: number;
  startedAt: string;
  completedAt?: string | null;
  status: MonitorRunStatus;
  observationsProcessed: number;
  eventsCreated: number;
  failureMessage?: string | null;
}

export interface MessageResponse {
  message: string;
}