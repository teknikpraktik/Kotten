import type { StreakStats } from '../lib/streak';

interface FinishViewProps {
  stats: StreakStats;
  completedDate: string;
  onHome: () => void;
}

export function FinishView({ stats, completedDate, onHome }: FinishViewProps) {
  return (
    <main className="app-shell simple-view">
      <section className="focus-panel done-panel" aria-labelledby="done-title">
        <div className="done-mark" aria-hidden="true">
          ✓
        </div>
        <h1 id="done-title">Bra jobbat, du blir starkare!</h1>
        <p className="short-copy">{completedDate}</p>
        <p className="streak-line">{stats.currentStreak} dagar i rad</p>
      </section>

      <button className="button button--primary" type="button" onClick={onHome}>
        Till startsidan
      </button>
    </main>
  );
}
