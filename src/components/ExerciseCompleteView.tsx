import type { WorkoutStep } from '../types';
import { ExerciseNavigation } from './ExerciseNavigation';
import { ProgressDots } from './ProgressDots';

interface ExerciseCompleteViewProps {
  completedStep: WorkoutStep;
  nextStep: WorkoutStep;
  onContinue: () => void;
  onAbort: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPreviousExercise: () => void;
  onNextExercise: () => void;
}

export function ExerciseCompleteView({
  completedStep,
  nextStep,
  onContinue,
  onAbort,
  canGoPrevious,
  canGoNext,
  onPreviousExercise,
  onNextExercise
}: ExerciseCompleteViewProps) {
  return (
    <main className="app-shell centered-view">
      <header className="flow-header">
        <p className="eyebrow">
          Klar med övning {completedStep.exerciseIndex + 1} av {completedStep.totalExercises}
        </p>
        <h1>Övningen är klar</h1>
        <ProgressDots
          total={completedStep.totalPhases}
          currentIndex={completedStep.globalPhaseIndex}
        />
        <ExerciseNavigation
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onPrevious={onPreviousExercise}
          onNext={onNextExercise}
        />
      </header>

      <section className="message-panel">
        <p className="message-main">Nästa övning är {nextStep.exercise.title}.</p>
        <p className="message-muted">Timern startar först när du trycker på start.</p>
      </section>

      <div className="button-stack">
        <button className="button button--primary" type="button" onClick={onContinue}>
          Fortsätt
        </button>
        <button className="button button--danger" type="button" onClick={onAbort}>
          Avbryt passet
        </button>
      </div>
    </main>
  );
}
