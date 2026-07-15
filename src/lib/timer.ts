export interface RunningTimer {
  status: 'running';
  durationMs: number;
  endTimeMs: number;
  remainingMs: number;
}

export interface PausedTimer {
  status: 'paused';
  durationMs: number;
  remainingMs: number;
}

export interface CompletedTimer {
  status: 'completed';
  durationMs: number;
  remainingMs: 0;
}

export interface IdleTimer {
  status: 'idle';
  durationMs: 0;
  remainingMs: 0;
}

export type TimerState = IdleTimer | RunningTimer | PausedTimer | CompletedTimer;

export const IDLE_TIMER: IdleTimer = {
  status: 'idle',
  durationMs: 0,
  remainingMs: 0
};

export function getRemainingMsFromEndTime(endTimeMs: number, nowMs: number): number {
  return Math.max(0, endTimeMs - nowMs);
}

export function createRunningTimer(durationMs: number, nowMs: number): RunningTimer {
  const safeDurationMs = Math.max(0, Math.round(durationMs));
  return {
    status: 'running',
    durationMs: safeDurationMs,
    endTimeMs: nowMs + safeDurationMs,
    remainingMs: safeDurationMs
  };
}

export function pauseRunningTimer(
  timer: RunningTimer,
  nowMs: number
): PausedTimer | CompletedTimer {
  const remainingMs = getRemainingMsFromEndTime(timer.endTimeMs, nowMs);

  if (remainingMs === 0) {
    return {
      status: 'completed',
      durationMs: timer.durationMs,
      remainingMs: 0
    };
  }

  return {
    status: 'paused',
    durationMs: timer.durationMs,
    remainingMs
  };
}

export function resumePausedTimer(timer: PausedTimer, nowMs: number): RunningTimer {
  return {
    status: 'running',
    durationMs: timer.durationMs,
    endTimeMs: nowMs + timer.remainingMs,
    remainingMs: timer.remainingMs
  };
}

export function formatRemainingTime(remainingMs: number): string {
  const totalSeconds = Math.ceil(Math.max(0, remainingMs) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
