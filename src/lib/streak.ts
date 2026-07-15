import type { WorkoutCompletion } from '../types';
import {
  addLocalDays,
  formatLocalDate,
  sortLocalDateIdsAscending,
  sortLocalDateIdsDescending,
  type LocalDateId
} from './localDate';

export interface StreakStats {
  today: LocalDateId;
  todayCompleted: boolean;
  currentStreak: number;
  longestStreak: number;
  totalUniqueDays: number;
  datesDescending: LocalDateId[];
}

function uniqueDates(completions: WorkoutCompletion[]): LocalDateId[] {
  return [...new Set(completions.map((completion) => completion.localDate))];
}

export function calculateStreakStats(
  completions: WorkoutCompletion[],
  today: LocalDateId = formatLocalDate(new Date())
): StreakStats {
  const dates = uniqueDates(completions);
  const dateSet = new Set(dates);
  const yesterday = addLocalDays(today, -1);
  const todayCompleted = dateSet.has(today);
  const anchor = todayCompleted ? today : dateSet.has(yesterday) ? yesterday : null;

  let currentStreak = 0;
  if (anchor) {
    let cursor: LocalDateId = anchor;
    while (dateSet.has(cursor)) {
      currentStreak += 1;
      cursor = addLocalDays(cursor, -1);
    }
  }

  let longestStreak = 0;
  let runningStreak = 0;
  let previousDate: LocalDateId | null = null;

  for (const date of sortLocalDateIdsAscending(dates)) {
    if (previousDate && addLocalDays(previousDate, 1) === date) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    longestStreak = Math.max(longestStreak, runningStreak);
    previousDate = date;
  }

  return {
    today,
    todayCompleted,
    currentStreak,
    longestStreak,
    totalUniqueDays: dates.length,
    datesDescending: sortLocalDateIdsDescending(dates)
  };
}
