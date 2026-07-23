import type { PassVersion, WorkoutExercise, WorkoutPhase, WorkoutPlan } from '../types';

export const PASS_VERSION: PassVersion = 'kotten-v1';

export const WORKOUT_PLAN: WorkoutPlan = {
  version: PASS_VERSION,
  exercises: [
    {
      id: 'balance-board',
      title: 'Balansbräda',
      preparationText: '1 minut per ben.',
      phases: [
        {
          id: 'balance-first-leg',
          exerciseId: 'balance-board',
          title: 'Balansbräda',
          label: 'Första benet',
          durationSeconds: 60
        },
        {
          id: 'balance-second-leg',
          exerciseId: 'balance-board',
          title: 'Balansbräda',
          label: 'Andra benet',
          durationSeconds: 60
        }
      ]
    },
    {
      id: 'stair-calf-raises',
      title: 'Tåhävningar i trappa',
      preparationText: '10 tåhävningar.',
      phases: [
        {
          id: 'stair-calf-raises',
          exerciseId: 'stair-calf-raises',
          title: 'Tåhävningar i trappa',
          durationSeconds: 60,
          mode: 'manual',
          instruction:
            'Gör 10 tåhävningar i trappan. Sänk hälen långsamt under trappsteget och tryck upp igen. Tryck på Klar när du är färdig.'
        }
      ]
    },
    {
      id: 'ball-calf-raises',
      title: 'Tåhävningar med tennisboll',
      preparationText: '10 tåhävningar.',
      phases: [
        {
          id: 'ball-calf-raises',
          exerciseId: 'ball-calf-raises',
          title: 'Tåhävningar med tennisboll',
          durationSeconds: 60,
          mode: 'manual',
          instruction:
            'Gör 10 tåhävningar med tennisbollen mellan hälarna. Tryck på Klar när du är färdig.'
        }
      ]
    }
  ]
};

export const WORKOUT_PHASES: WorkoutPhase[] = WORKOUT_PLAN.exercises.flatMap(
  (exercise) => exercise.phases
);

export function getWorkoutDurationSeconds(plan: WorkoutPlan = WORKOUT_PLAN): number {
  return plan.exercises.reduce(
    (exerciseSum, exercise) =>
      exerciseSum +
      exercise.phases.reduce((phaseSum, phase) => phaseSum + phase.durationSeconds, 0),
    0
  );
}

export function getExerciseIndexForPhase(phaseIndex: number): number {
  const phase = WORKOUT_PHASES[Math.min(Math.max(phaseIndex, 0), WORKOUT_PHASES.length - 1)];
  return WORKOUT_PLAN.exercises.findIndex((exercise) => exercise.id === phase.exerciseId);
}

export function getFirstPhaseIndexForExercise(exercise: WorkoutExercise): number {
  return WORKOUT_PHASES.findIndex((phase) => phase.exerciseId === exercise.id);
}
