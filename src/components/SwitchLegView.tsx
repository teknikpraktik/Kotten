import type { WorkoutStep } from '../types';
import { ProgressDots } from './ProgressDots';

interface SwitchLegViewProps {
  step: WorkoutStep;
  remainingSeconds: number;
  onAbort: () => void;
}

export function SwitchLegView({ step, remainingSeconds, onAbort }: SwitchLegViewProps) {
  return (
    <main className="app-shell centered-view">
      <header className="flow-header">
        <h1>Byt ben</h1>
        <ProgressDots total={step.totalPhases} currentIndex={step.globalPhaseIndex} />
      </header>

      <section className="message-panel" aria-live="assertive">
        <p className="countdown-number">{remainingSeconds}</p>
      </section>

      <button className="button button--danger" type="button" onClick={onAbort}>
        Avbryt passet
      </button>
    </main>
  );
}
