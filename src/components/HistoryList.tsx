import type { LocalDateId } from '../lib/localDate';

interface HistoryListProps {
  dates: LocalDateId[];
}

export function HistoryList({ dates }: HistoryListProps) {
  if (dates.length === 0) {
    return <p className="empty-state">Inga pass sparade än.</p>;
  }

  return (
    <ol className="history-list">
      {dates.slice(0, 10).map((date) => (
        <li key={date}>
          <time dateTime={date}>{date}</time>
        </li>
      ))}
    </ol>
  );
}
