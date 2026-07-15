import type { WorkoutStep } from '../types';
import { ExerciseNavigation } from './ExerciseNavigation';
import { ProgressDots } from './ProgressDots';

interface PrepareViewProps {
  step: WorkoutStep;
  onStart: () => void;
  onAbort: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPreviousExercise: () => void;
  onNextExercise: () => void;
}

export function PrepareView({
  step,
  onStart,
  onAbort,
  canGoPrevious,
  canGoNext,
  onPreviousExercise,
  onNextExercise
}: PrepareViewProps) {
  return (
    <main className="app-shell flow-view">
      <header className="flow-header">
        <p className="eyebrow">
          Övning {step.exerciseIndex + 1} av {step.totalExercises}
        </p>
        <h1>{step.exercise.title}</h1>
        <ProgressDots total={step.totalPhases} currentIndex={step.globalPhaseIndex} />
        <ExerciseNavigation
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onPrevious={onPreviousExercise}
          onNext={onNextExercise}
        />
      </header>

      <section className="instruction-panel" aria-labelledby="prepare-title">
        <h2 id="prepare-title">Gör dig redo</h2>
        <ul className="instruction-list">
          {step.exercise.preparation.map((instruction) => (
            <li key={instruction}>{instruction}</li>
          ))}
        </ul>
      </section>

      <section className="next-panel" aria-labelledby="next-title">
        <h2 id="next-title">När timern startar</h2>
        <p>{step.phase.instruction}</p>
      </section>

      <div className="button-stack">
        <button className="button button--primary" type="button" onClick={onStart}>
          Starta
        </button>
        <button className="button button--quiet" type="button" onClick={onAbort}>
          Till startsidan
        </button>
      </div>
    </main>
  );
}
