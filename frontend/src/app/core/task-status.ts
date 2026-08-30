import type { UiBadgeTone } from '@globalart/platform-ui';
import type { TaskStatus } from './models';

const TONES: Record<TaskStatus, UiBadgeTone> = {
  waiting: 'neutral',
  starting: 'info',
  waiting_confirmation: 'warn',
  confirmed: 'info',
  rejected: 'danger',
  running: 'info',
  stopping: 'warn',
  stopped: 'neutral',
  success: 'ok',
  error: 'danger',
};

const LABELS: Record<TaskStatus, string> = {
  waiting: 'status_waiting',
  starting: 'status_starting',
  waiting_confirmation: 'status_waiting_confirmation',
  confirmed: 'status_confirmed',
  rejected: 'status_rejected',
  running: 'status_running',
  stopping: 'status_stopping',
  stopped: 'status_stopped',
  success: 'status_success',
  error: 'status_failed',
};

export function statusLabel(status: TaskStatus): string {
  return LABELS[status] ?? status;
}

export function statusTone(status: TaskStatus): UiBadgeTone {
  return TONES[status] ?? 'neutral';
}

export function isTaskActive(status: TaskStatus): boolean {
  return ['waiting', 'starting', 'waiting_confirmation', 'confirmed', 'running', 'stopping'].includes(status);
}

export function taskDuration(start?: string, end?: string): string {
  if (!start) {
    return '—';
  }

  const from = new Date(start).getTime();
  const to = end ? new Date(end).getTime() : Date.now();
  const seconds = Math.max(0, Math.round((to - from) / 1000));

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;

  if (hours) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes) {
    return `${minutes}m ${rest}s`;
  }
  return `${rest}s`;
}
