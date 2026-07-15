import { describe, expect, it } from 'vitest';
import { getWorkoutDurationSeconds, WORKOUT_PHASES, WORKOUT_PLAN } from './training';

describe('workout plan', () => {
  it('has the expected phase order', () => {
    expect(WORKOUT_PHASES.map((phase) => phase.id)).toEqual([
      'balance-first-leg',
      'balance-second-leg',
      'stair-calf-raises',
      'ball-calf-raises'
    ]);
  });

  it('lasts four minutes', () => {
    expect(getWorkoutDurationSeconds(WORKOUT_PLAN)).toBe(240);
  });
});
