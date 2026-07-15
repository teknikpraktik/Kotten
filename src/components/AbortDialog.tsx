interface AbortDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function AbortDialog({ onCancel, onConfirm }: AbortDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="abort-title">
        <h2 id="abort-title">Vill du avsluta passet?</h2>
        <div className="button-stack">
          <button className="button button--primary" type="button" onClick={onCancel}>
            Fortsätt träna
          </button>
          <button className="button button--quiet" type="button" onClick={onConfirm}>
            Avsluta passet
          </button>
        </div>
      </section>
    </div>
  );
}
