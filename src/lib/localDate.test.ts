import { describe, expect, it } from 'vitest';
import { addLocalDays, formatLocalDate, isLocalDateId } from './localDate';

describe('local date helpers', () => {
  it('formats a local calendar date without using a UTC date id', () => {
    const lateLocalEvening = new Date(2026, 6, 15, 23, 45, 0);

    expect(formatLocalDate(lateLocalEvening)).toBe('2026-07-15');
  });

  it('adds local days over a month boundary', () => {
    expect(addLocalDays('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('adds local days over a year boundary', () => {
    expect(addLocalDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('rejects invalid calendar dates', () => {
    expect(isLocalDateId('2026-02-29')).toBe(false);
    expect(isLocalDateId('2026-2-9')).toBe(false);
  });
});
