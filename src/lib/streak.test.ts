import { describe, expect, it } from 'vitest';
import { PASS_VERSION } from '../data/training';
import type { WorkoutCompletion } from '../types';
import { calculateStreakStats } from './streak';

function completion(localDate: string): WorkoutCompletion {
  return {
    localDate,
    completedAt: `${localDate}T18:00:00.000Z`,
    durationSeconds: 240,
    passVersion: PASS_VERSION
  };
}

describe('streak calculation', () => {
  it('handles empty history', () => {
    expect(calculateStreakStats([], '2026-07-15')).toMatchObject({
      todayCompleted: false,
      currentStreak: 0,
      longestStreak: 0,
      totalUniqueDays: 0,
      datesDescending: []
    });
  });

  it('calculates the current streak from today when today is completed', () => {
    const stats = calculateStreakStats(
      [completion('2026-07-13'), completion('2026-07-14'), completion('2026-07-15')],
      '2026-07-15'
    );

    expect(stats.currentStreak).toBe(3);
    expect(stats.todayCompleted).toBe(true);
  });

  it('calculates the current streak from yesterday when today is not completed', () => {
    const stats = calculateStreakStats(
      [completion('2026-07-12'), completion('2026-07-13'), completion('2026-07-14')],
      '2026-07-15'
    );

    expect(stats.currentStreak).toBe(3);
    expect(stats.todayCompleted).toBe(false);
  });

  it('returns zero for a broken current streak', () => {
    const stats = calculateStreakStats([completion('2026-07-13')], '2026-07-15');

    expect(stats.currentStreak).toBe(0);
  });

  it('calculates the longest streak', () => {
    const stats = calculateStreakStats(
      [
        completion('2026-07-01'),
        completion('2026-07-03'),
        completion('2026-07-04'),
        completion('2026-07-05'),
        completion('2026-07-08')
      ],
      '2026-07-09'
    );

    expect(stats.longestStreak).toBe(3);
  });

  it('counts a streak across a month boundary', () => {
    const stats = calculateStreakStats(
      [completion('2026-01-31'), completion('2026-02-01'), completion('2026-02-02')],
      '2026-02-02'
    );

    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
  });

  it('counts a streak across a year boundary', () => {
    const stats = calculateStreakStats(
      [completion('2026-12-31'), completion('2027-01-01')],
      '2027-01-01'
    );

    expect(stats.currentStreak).toBe(2);
    expect(stats.longestStreak).toBe(2);
  });

  it('counts duplicate completions on the same day once', () => {
    const stats = calculateStreakStats(
      [completion('2026-07-15'), completion('2026-07-15')],
      '2026-07-15'
    );

    expect(stats.totalUniqueDays).toBe(1);
    expect(stats.currentStreak).toBe(1);
  });
});
