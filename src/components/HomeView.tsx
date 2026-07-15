import type { StreakStats } from '../lib/streak';

interface HomeViewProps {
  stats: StreakStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onStart: () => void;
}

export function HomeView({ stats, soundEnabled, onToggleSound, onStart }: HomeViewProps) {
  return (
    <main className="app-shell home-view">
      <section className="hero-panel" aria-labelledby="home-title">
        <div className="pinecone-mark" aria-hidden="true" />
        <p className="kicker">Dagens träning</p>
        <h1 id="home-title">Kotten</h1>
        <p className="duration">4 minuter</p>
        <p className="streak-line">{stats.currentStreak} dagar i rad</p>
      </section>

      <div className="home-actions">
        <button className="button button--primary" type="button" onClick={onStart}>
          Starta passet
        </button>
        <button
          className="sound-toggle"
          type="button"
          aria-pressed={soundEnabled}
          onClick={onToggleSound}
        >
          Ljud {soundEnabled ? 'på' : 'av'}
        </button>
      </div>
    </main>
  );
}
