interface ProgressDotsProps {
  total: number;
  currentIndex: number;
}

export function ProgressDots({ total, currentIndex }: ProgressDotsProps) {
  return (
    <ol className="progress-dots" aria-label={`Fas ${currentIndex + 1} av ${total}`}>
      {Array.from({ length: total }, (_, index) => (
        <li
          key={index}
          className={index <= currentIndex ? 'progress-dot progress-dot--active' : 'progress-dot'}
          aria-current={index === currentIndex ? 'step' : undefined}
        >
          <span className="sr-only">
            {index === currentIndex ? 'Nuvarande fas' : 'Fas'} {index + 1}
          </span>
        </li>
      ))}
    </ol>
  );
}
