import type { WorkoutExercise } from '../types';

interface PrepareViewProps {
  exercise: WorkoutExercise;
  onStart: () => void;
  onAbort: () => void;
}

export function PrepareView({ exercise, onStart, onAbort }: PrepareViewProps) {
  return (
    <main className="app-shell simple-view">
      <section className="focus-panel prepare-panel" aria-labelledby="prepare-title">
        <h1 id="prepare-title">{exercise.title}</h1>
        <p className="short-copy prepare-copy">{exercise.preparationText}</p>
      </section>

      <div className="button-stack">
        <button className="button button--primary" type="button" onClick={onStart}>
          Starta
        </button>
        <button className="button button--quiet" type="button" onClick={onAbort}>
          Avbryt passet
        </button>
      </div>
    </main>
  );
}
