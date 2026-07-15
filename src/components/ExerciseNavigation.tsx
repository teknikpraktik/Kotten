interface ExerciseNavigationProps {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function ExerciseNavigation({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext
}: ExerciseNavigationProps) {
  return (
    <nav className="exercise-navigation" aria-label="Byt övning">
      <button
        className="button button--nav"
        type="button"
        onClick={onPrevious}
        disabled={!canGoPrevious}
      >
        Föregående
      </button>
      <button className="button button--nav" type="button" onClick={onNext} disabled={!canGoNext}>
        Nästa
      </button>
    </nav>
  );
}
