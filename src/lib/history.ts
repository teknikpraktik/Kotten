import { PASS_VERSION } from '../data/training';
import type { PassVersion, StoredWorkoutHistory, WorkoutCompletion } from '../types';
import { formatLocalDate, isLocalDateId } from './localDate';
import { readLocalStorage, writeLocalStorage } from './storage';

export const HISTORY_STORAGE_KEY = 'kotten.history.v1';
export const HISTORY_SCHEMA_VERSION = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPassVersion(value: unknown): value is PassVersion {
  return value === PASS_VERSION;
}

function isValidCompletedAt(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isValidDuration(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function isWorkoutCompletion(value: unknown): value is WorkoutCompletion {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.localDate === 'string' &&
    isLocalDateId(value.localDate) &&
    isValidCompletedAt(value.completedAt) &&
    isValidDuration(value.durationSeconds) &&
    isPassVersion(value.passVersion)
  );
}

export function sortCompletionsDescending(completions: WorkoutCompletion[]): WorkoutCompletion[] {
  return [...completions].sort((left, right) => {
    const dateComparison = right.localDate.localeCompare(left.localDate);
    if (dateComparison !== 0) {
      return dateComparison;
    }

    return Date.parse(right.completedAt) - Date.parse(left.completedAt);
  });
}

export function dedupeCompletionsByLocalDate(
  completions: WorkoutCompletion[]
): WorkoutCompletion[] {
  const byDate = new Map<string, WorkoutCompletion>();

  for (const completion of sortCompletionsDescending(completions)) {
    if (!byDate.has(completion.localDate)) {
      byDate.set(completion.localDate, completion);
    }
  }

  return sortCompletionsDescending([...byDate.values()]);
}

export function parseStoredHistoryPayload(payload: unknown): WorkoutCompletion[] {
  if (!isRecord(payload) || payload.schemaVersion !== HISTORY_SCHEMA_VERSION) {
    return [];
  }

  if (!Array.isArray(payload.completions)) {
    return [];
  }

  return dedupeCompletionsByLocalDate(payload.completions.filter(isWorkoutCompletion));
}

export function createStoredHistory(completions: WorkoutCompletion[]): StoredWorkoutHistory {
  return {
    schemaVersion: HISTORY_SCHEMA_VERSION,
    completions: dedupeCompletionsByLocalDate(completions)
  };
}

export function createWorkoutCompletion(
  completedAt: Date,
  durationSeconds: number,
  passVersion: PassVersion = PASS_VERSION
): WorkoutCompletion {
  return {
    localDate: formatLocalDate(completedAt),
    completedAt: completedAt.toISOString(),
    durationSeconds,
    passVersion
  };
}

export function addWorkoutCompletion(
  completions: WorkoutCompletion[],
  completion: WorkoutCompletion
): WorkoutCompletion[] {
  if (completions.some((item) => item.localDate === completion.localDate)) {
    return sortCompletionsDescending(completions);
  }

  return sortCompletionsDescending([...completions, completion]);
}

export function loadWorkoutHistory(): WorkoutCompletion[] {
  const storedValue = readLocalStorage(HISTORY_STORAGE_KEY);
  if (!storedValue) {
    return [];
  }

  try {
    return parseStoredHistoryPayload(JSON.parse(storedValue));
  } catch {
    return [];
  }
}

export function saveWorkoutHistory(completions: WorkoutCompletion[]): boolean {
  return writeLocalStorage(HISTORY_STORAGE_KEY, JSON.stringify(createStoredHistory(completions)));
}
