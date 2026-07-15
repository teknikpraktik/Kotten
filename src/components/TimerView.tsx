import { formatRemainingTime, type TimerState } from '../lib/timer';
import type { WorkoutPhase } from '../types';

interface TimerViewProps {
  phase: WorkoutPhase;
  timer: TimerState;
  onPause: () => void;
  onResume: () => void;
  onAbort: () => void;
}

export function TimerView({ phase, timer, onPause, onResume, onAbort }: TimerViewProps) {
  const isPaused = timer.status === 'paused';

  return (
    <main className="app-shell timer-view">
      <header className="timer-header">
        <h1>{phase.title}</h1>
        {phase.label && <p className="phase-label">{phase.label}</p>}
      </header>

      <section className="timer-panel" aria-labelledby="timer-title">
        <h2 id="timer-title" className="sr-only">
          Timer
        </h2>
        <output className="timer-value" aria-live="polite" aria-label="Återstående tid">
          {formatRemainingTime(timer.remainingMs)}
        </output>
      </section>

      <div className="button-stack">
        {isPaused ? (
          <button className="button button--primary" type="button" onClick={onResume}>
            Fortsätt
          </button>
        ) : (
          <button className="button button--secondary" type="button" onClick={onPause}>
            Pausa
          </button>
        )}
        <button className="button button--quiet" type="button" onClick={onAbort}>
          Avbryt
        </button>
      </div>
    </main>
  );
}
