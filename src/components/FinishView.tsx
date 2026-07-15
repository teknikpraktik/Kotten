import type { StreakStats } from '../lib/streak';

interface FinishViewProps {
  stats: StreakStats;
  onHome: () => void;
}

export function FinishView({ stats, onHome }: FinishViewProps) {
  return (
    <main className="app-shell centered-view">
      <header className="finish-header">
        <img src="/icons/kotten-icon.svg" alt="" className="finish-icon" aria-hidden="true" />
        <p className="eyebrow">Sparat lokalt</p>
        <h1>Passet är klart</h1>
      </header>

      <section className="message-panel" aria-live="polite">
        <p className="message-main">Bra jobbat. Dagens träningsdag är sparad.</p>
        <p className="message-muted">
          Din aktuella streak är {stats.currentStreak} {stats.currentStreak === 1 ? 'dag' : 'dagar'}
          .
        </p>
      </section>

      <button className="button button--primary" type="button" onClick={onHome}>
        Till startsidan
      </button>
    </main>
  );
}
