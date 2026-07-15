import { formatRemainingTime, type TimerState } from '../lib/timer';

interface SwitchLegViewProps {
  timer: TimerState;
  onAbort: () => void;
}

export function SwitchLegView({ timer, onAbort }: SwitchLegViewProps) {
  return (
    <main className="app-shell simple-view">
      <section className="focus-panel transition-panel" aria-live="assertive">
        <p className="kicker">Balansbräda</p>
        <h1>Byt ben</h1>
        <output className="transition-count" aria-label="Sekunder kvar">
          {formatRemainingTime(timer.remainingMs).replace('0:', '')}
        </output>
      </section>

      <button className="button button--quiet" type="button" onClick={onAbort}>
        Avbryt
      </button>
    </main>
  );
}
