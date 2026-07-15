import type { StreakStats } from '../lib/streak';

interface HomeViewProps {
  stats: StreakStats;
  onStart: () => void;
}

export function HomeView({ stats, onStart }: HomeViewProps) {
  return (
    <main className="app-shell home-view">
      <header className="app-header">
        <img src="/icons/kotten-icon.svg" alt="" className="app-icon" aria-hidden="true" />
        <div>
          <h1>Kotten</h1>
        </div>
      </header>

      <section className="status-panel">
        <button className="button button--primary" type="button" onClick={onStart}>
          Starta passet
        </button>
      </section>

      <section className="stats-grid" aria-label="Träningsstatistik">
        <div className="stat-card">
          <span className="stat-value">{stats.currentStreak}</span>
          <span className="stat-label">rad</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.longestStreak}</span>
          <span className="stat-label">bäst</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalUniqueDays}</span>
          <span className="stat-label">dagar</span>
        </div>
      </section>
    </main>
  );
}
