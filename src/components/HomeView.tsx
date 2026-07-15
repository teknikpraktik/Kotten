import type { StreakStats } from '../lib/streak';
import { HistoryList } from './HistoryList';

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
          <p className="eyebrow">Dagligt träningspass</p>
          <h1>Kotten</h1>
        </div>
      </header>

      <section className="status-panel" aria-labelledby="today-status-title">
        <h2 id="today-status-title">Idag</h2>
        <p className={stats.todayCompleted ? 'status-text status-text--done' : 'status-text'}>
          {stats.todayCompleted ? 'Passet är klart idag.' : 'Passet är inte gjort idag.'}
        </p>
        <button className="button button--primary" type="button" onClick={onStart}>
          Starta passet
        </button>
      </section>

      <section className="stats-grid" aria-label="Träningsstatistik">
        <div className="stat-card">
          <span className="stat-value">{stats.currentStreak}</span>
          <span className="stat-label">dagar i rad</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.longestStreak}</span>
          <span className="stat-label">längsta streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalUniqueDays}</span>
          <span className="stat-label">träningsdagar</span>
        </div>
      </section>

      <section className="history-section" aria-labelledby="history-title">
        <h2 id="history-title">Historik</h2>
        <HistoryList dates={stats.datesDescending} />
      </section>
    </main>
  );
}
