export type PassVersion = 'kotten-v1';

export type WorkoutExerciseId = 'balance-board' | 'stair-calf-raises' | 'ball-calf-raises';

export type WorkoutPhaseId =
  'balance-first-leg' | 'balance-second-leg' | 'stair-calf-raises' | 'ball-calf-raises';

export interface WorkoutPhase {
  id: WorkoutPhaseId;
  exerciseId: WorkoutExerciseId;
  title: string;
  label?: string;
  durationSeconds: number;
}

export interface WorkoutExercise {
  id: WorkoutExerciseId;
  title: string;
  preparationText: string;
  phases: WorkoutPhase[];
}

export interface WorkoutPlan {
  version: PassVersion;
  exercises: WorkoutExercise[];
}

export interface WorkoutCompletion {
  localDate: string;
  completedAt: string;
  durationSeconds: number;
  passVersion: PassVersion;
}

export interface StoredWorkoutHistory {
  schemaVersion: 1;
  completions: WorkoutCompletion[];
}
