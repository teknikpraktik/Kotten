import { describe, expect, it } from 'vitest';
import {
  createRunningTimer,
  getRemainingMsFromEndTime,
  pauseRunningTimer,
  resumePausedTimer
} from './timer';

describe('timer logic', () => {
  it('calculates remaining time from an absolute end time', () => {
    expect(getRemainingMsFromEndTime(10_000, 4_250)).toBe(5_750);
  });

  it('returns zero when the end time has passed', () => {
    expect(getRemainingMsFromEndTime(10_000, 12_000)).toBe(0);
  });

  it('pauses a running timer with the current remaining time', () => {
    const running = createRunningTimer(60_000, 1_000);
    const paused = pauseRunningTimer(running, 21_500);

    expect(paused).toEqual({
      status: 'paused',
      durationMs: 60_000,
      remainingMs: 39_500
    });
  });

  it('marks a timer completed when pausing after the end time', () => {
    const running = createRunningTimer(60_000, 1_000);
    const paused = pauseRunningTimer(running, 61_000);

    expect(paused).toEqual({
      status: 'completed',
      durationMs: 60_000,
      remainingMs: 0
    });
  });

  it('resumes a paused timer by creating a new absolute end time', () => {
    const resumed = resumePausedTimer(
      {
        status: 'paused',
        durationMs: 60_000,
        remainingMs: 15_000
      },
      100_000
    );

    expect(resumed).toEqual({
      status: 'running',
      durationMs: 60_000,
      endTimeMs: 115_000,
      remainingMs: 15_000
    });
  });
});
