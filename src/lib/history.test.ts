import { beforeEach, describe, expect, it } from 'vitest';
import { PASS_VERSION } from '../data/training';
import type { WorkoutCompletion } from '../types';
import {
  HISTORY_STORAGE_KEY,
  addWorkoutCompletion,
  createStoredHistory,
  createWorkoutCompletion,
  loadWorkoutHistory,
  parseStoredHistoryPayload,
  sortCompletionsDescending
} from './history';

function completion(
  localDate: string,
  completedAt = `${localDate}T18:00:00.000Z`
): WorkoutCompletion {
  return {
    localDate,
    completedAt,
    durationSeconds: 240,
    passVersion: PASS_VERSION
  };
}

describe('workout history', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('creates a completion with local calendar date and exact end time', () => {
    const completedAt = new Date(2026, 6, 15, 23, 30, 0);
    const created = createWorkoutCompletion(completedAt, 240, PASS_VERSION);

    expect(created.localDate).toBe('2026-07-15');
    expect(created.completedAt).toBe(completedAt.toISOString());
    expect(created.durationSeconds).toBe(240);
    expect(created.passVersion).toBe(PASS_VERSION);
  });

  it('does not store the same local date twice', () => {
    const first = completion('2026-07-15', '2026-07-15T08:00:00.000Z');
    const second = completion('2026-07-15', '2026-07-15T18:00:00.000Z');

    expect(addWorkoutCompletion([first], second)).toEqual([first]);
  });

  it('sorts history by local date descending and then completion time descending', () => {
    const sorted = sortCompletionsDescending([
      completion('2026-07-14'),
      completion('2026-07-15', '2026-07-15T08:00:00.000Z'),
      completion('2026-07-15', '2026-07-15T19:00:00.000Z')
    ]);

    expect(sorted.map((item) => item.completedAt)).toEqual([
      '2026-07-15T19:00:00.000Z',
      '2026-07-15T08:00:00.000Z',
      '2026-07-14T18:00:00.000Z'
    ]);
  });

  it('parses valid history and drops invalid entries defensively', () => {
    const parsed = parseStoredHistoryPayload({
      schemaVersion: 1,
      completions: [
        completion('2026-07-15'),
        { localDate: '2026-02-29', completedAt: 'nope', durationSeconds: 0, passVersion: 'old' },
        null
      ]
    });

    expect(parsed).toEqual([completion('2026-07-15')]);
  });

  it('handles empty localStorage history', () => {
    expect(loadWorkoutHistory()).toEqual([]);
  });

  it('handles invalid localStorage data defensively', () => {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, '{not-json');

    expect(loadWorkoutHistory()).toEqual([]);
  });

  it('handles old or malformed schema defensively', () => {
    expect(
      parseStoredHistoryPayload({ schemaVersion: 0, completions: [completion('2026-07-15')] })
    ).toEqual([]);
    expect(parseStoredHistoryPayload({ schemaVersion: 1, completions: 'bad' })).toEqual([]);
  });

  it('creates a stable stored schema', () => {
    expect(createStoredHistory([completion('2026-07-15')])).toEqual({
      schemaVersion: 1,
      completions: [completion('2026-07-15')]
    });
  });
});
