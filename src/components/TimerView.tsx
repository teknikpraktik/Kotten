import { formatRemainingTime, type TimerState } from '../lib/timer';
import type { WorkoutStep } from '../types';
import { ProgressDots } from './ProgressDots';

interface TimerViewProps {
  step: WorkoutStep;
  timer: TimerState;
  onPause: () => void;
  onResume: () => void;
  onAbort: () => void;
}

export function TimerView({ step, timer, onPause, onResume, onAbort }: TimerViewProps) {
  const isPaused = timer.status === 'paused';
  const elapsedRatio =
    timer.durationMs > 0 ? 1 - Math.max(0, timer.remainingMs) / timer.durationMs : 0;
  const progressPercent = Math.min(100, Math.max(0, elapsedRatio * 100));

  return (
    <main className="app-shell timer-view">
      <header className="timer-header">
        <p className="eyebrow">
          Övning {step.exerciseIndex + 1} av {step.totalExercises} · Fas {step.globalPhaseIndex + 1}{' '}
          av {step.totalPhases}
        </p>
        <h1>{step.phase.title}</h1>
        <ProgressDots total={step.totalPhases} currentIndex={step.globalPhaseIndex} />
      </header>

      <section className="timer-panel" aria-labelledby="timer-title">
        <h2 id="timer-title" className="sr-only">
          Timer
        </h2>
        <p className="timer-instruction">{step.phase.instruction}</p>
        <output className="timer-value" aria-live="polite" aria-label="Återstående tid">
          {formatRemainingTime(timer.remainingMs)}
        </output>
        <div className="timer-track" aria-hidden="true">
          <span className="timer-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        {isPaused && (
          <p className="paused-label" role="status">
            Pausad
          </p>
        )}
      </section>

      <div className="button-stack timer-actions">
        {isPaused ? (
          <button className="button button--primary" type="button" onClick={onResume}>
            Fortsätt
          </button>
        ) : (
          <button className="button button--secondary" type="button" onClick={onPause}>
            Pausa
          </button>
        )}
        <button className="button button--danger" type="button" onClick={onAbort}>
          Avbryt passet
        </button>
      </div>
    </main>
  );
}
