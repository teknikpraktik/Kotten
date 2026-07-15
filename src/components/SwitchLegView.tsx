import type { WorkoutStep } from '../types';
import { ExerciseNavigation } from './ExerciseNavigation';
import { ProgressDots } from './ProgressDots';

interface SwitchLegViewProps {
  step: WorkoutStep;
  remainingSeconds: number;
  onAbort: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPreviousExercise: () => void;
  onNextExercise: () => void;
}

export function SwitchLegView({
  step,
  remainingSeconds,
  onAbort,
  canGoPrevious,
  canGoNext,
  onPreviousExercise,
  onNextExercise
}: SwitchLegViewProps) {
  return (
    <main className="app-shell centered-view">
      <header className="flow-header">
        <p className="eyebrow">
          Övning {step.exerciseIndex + 1} av {step.totalExercises}
        </p>
        <h1>Byt ben</h1>
        <ProgressDots total={step.totalPhases} currentIndex={step.globalPhaseIndex} />
        <ExerciseNavigation
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onPrevious={onPreviousExercise}
          onNext={onNextExercise}
        />
      </header>

      <section className="message-panel" aria-live="assertive">
        <p className="message-main">Byt till höger ben.</p>
        <p className="countdown-number">{remainingSeconds}</p>
        <p className="message-muted">Nästa minut startar snart.</p>
      </section>

      <button className="button button--danger" type="button" onClick={onAbort}>
        Avbryt passet
      </button>
    </main>
  );
}
