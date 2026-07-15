import { useCallback, useEffect, useRef, useState } from 'react';
import {
  IDLE_TIMER,
  createRunningTimer,
  getRemainingMsFromEndTime,
  pauseRunningTimer,
  resumePausedTimer,
  type CompletedTimer,
  type TimerState
} from '../lib/timer';

const TICK_INTERVAL_MS = 250;

export interface AbsoluteTimerControls {
  state: TimerState;
  start: (durationMs: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

function toCompletedTimer(durationMs: number): CompletedTimer {
  return {
    status: 'completed',
    durationMs,
    remainingMs: 0
  };
}

export function useAbsoluteTimer(onComplete: () => void): AbsoluteTimerControls {
  const [state, setState] = useState<TimerState>(IDLE_TIMER);
  const onCompleteRef = useRef(onComplete);
  const completionTriggeredRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const triggerComplete = useCallback(() => {
    if (completionTriggeredRef.current) {
      return;
    }

    completionTriggeredRef.current = true;
    window.queueMicrotask(() => onCompleteRef.current());
  }, []);

  const syncRunningTimer = useCallback(() => {
    setState((current) => {
      if (current.status !== 'running') {
        return current;
      }

      const remainingMs = getRemainingMsFromEndTime(current.endTimeMs, Date.now());

      if (remainingMs === 0) {
        return toCompletedTimer(current.durationMs);
      }

      if (remainingMs === current.remainingMs) {
        return current;
      }

      return {
        ...current,
        remainingMs
      };
    });
  }, []);

  useEffect(() => {
    if (state.status === 'completed') {
      triggerComplete();
    }
  }, [state.status, triggerComplete]);

  useEffect(() => {
    if (state.status !== 'running') {
      return undefined;
    }

    syncRunningTimer();
    const intervalId = window.setInterval(syncRunningTimer, TICK_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [state.status, syncRunningTimer]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncRunningTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncRunningTimer]);

  const start = useCallback((durationMs: number) => {
    completionTriggeredRef.current = false;
    setState(createRunningTimer(durationMs, Date.now()));
  }, []);

  const pause = useCallback(() => {
    setState((current) => {
      if (current.status !== 'running') {
        return current;
      }

      return pauseRunningTimer(current, Date.now());
    });
  }, []);

  const resume = useCallback(() => {
    setState((current) => {
      if (current.status !== 'paused') {
        return current;
      }

      completionTriggeredRef.current = false;
      return resumePausedTimer(current, Date.now());
    });
  }, []);

  const stop = useCallback(() => {
    completionTriggeredRef.current = true;
    setState(IDLE_TIMER);
  }, []);

  return {
    state,
    start,
    pause,
    resume,
    stop
  };
}
