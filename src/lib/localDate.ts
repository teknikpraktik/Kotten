export type LocalDateId = string;

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function padDatePart(value: number): string {
  return value.toString().padStart(2, '0');
}

export function formatLocalDate(date: Date): LocalDateId {
  return [
    date.getFullYear().toString().padStart(4, '0'),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate())
  ].join('-');
}

export function isLocalDateId(value: string): value is LocalDateId {
  if (!LOCAL_DATE_PATTERN.test(value)) {
    return false;
  }

  return parseLocalDateId(value) !== null;
}

export function parseLocalDateId(value: string): Date | null {
  if (!LOCAL_DATE_PATTERN.test(value)) {
    return null;
  }

  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const day = Number(dayText);
  const date = new Date(year, monthIndex, day, 12, 0, 0, 0);

  if (date.getFullYear() !== year || date.getMonth() !== monthIndex || date.getDate() !== day) {
    return null;
  }

  return date;
}

export function addLocalDays(value: LocalDateId, days: number): LocalDateId {
  const date = parseLocalDateId(value);

  if (!date) {
    throw new Error(`Invalid local date: ${value}`);
  }

  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

export function sortLocalDateIdsAscending(dates: LocalDateId[]): LocalDateId[] {
  return [...dates].sort((left, right) => left.localeCompare(right));
}

export function sortLocalDateIdsDescending(dates: LocalDateId[]): LocalDateId[] {
  return [...dates].sort((left, right) => right.localeCompare(left));
}
