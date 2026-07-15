export type PassVersion = 'kotten-v1';

export type SpeechCue = 'Start' | 'Byt ben' | 'Övningen är klar' | 'Passet är klart';

export interface PhaseTransition {
  kind: 'auto-countdown-to-next-phase';
  message: SpeechCue;
  countdownSeconds: number;
}

export interface TrainingPhase {
  id: string;
  title: string;
  instruction: string;
  durationSeconds: number;
  startSpeech: SpeechCue;
  completionSpeech: SpeechCue;
  transition?: PhaseTransition;
}

export interface TrainingExercise {
  id: string;
  title: string;
  preparation: string[];
  phases: TrainingPhase[];
}

export interface WorkoutPlan {
  version: PassVersion;
  exercises: TrainingExercise[];
}

export interface WorkoutStep {
  exercise: TrainingExercise;
  phase: TrainingPhase;
  exerciseIndex: number;
  phaseIndexInExercise: number;
  globalPhaseIndex: number;
  totalExercises: number;
  totalPhases: number;
  isLastPhaseOfExercise: boolean;
  isLastPhase: boolean;
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
