import type { WorkoutPhase } from '../types';

interface ManualExerciseViewProps {
  phase: WorkoutPhase;
  onDone: () => void;
  onAbort: () => void;
}

export function ManualExerciseView({ phase, onDone, onAbort }: ManualExerciseViewProps) {
  return (
    <main className="app-shell simple-view">
      <section className="focus-panel prepare-panel" aria-labelledby="manual-title">
        <h1 id="manual-title">{phase.title}</h1>
        {phase.label && <p className="phase-label">{phase.label}</p>}
        <p className="short-copy prepare-copy">{phase.instruction}</p>
      </section>

      <div className="button-stack">
        <button className="button button--primary" type="button" onClick={onDone}>
          Klar
        </button>
        <button className="button button--quiet" type="button" onClick={onAbort}>
          Avbryt
        </button>
      </div>
    </main>
  );
}
