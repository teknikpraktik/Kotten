interface FinishViewProps {
  onHome: () => void;
}

export function FinishView({ onHome }: FinishViewProps) {
  return (
    <main className="app-shell centered-view">
      <header className="finish-header">
        <img src="/icons/kotten-icon.svg" alt="" className="finish-icon" aria-hidden="true" />
        <h1>Klart</h1>
      </header>

      <button className="button button--primary" type="button" onClick={onHome}>
        Hem
      </button>
    </main>
  );
}
