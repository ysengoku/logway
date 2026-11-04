const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// True for an existing calendar date in YYYY-MM-DD form (the format of <input type="date">).
export function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }
  // Round-trip through UTC so overflowing dates like 2026-02-30 (→ March 2) are rejected
  // and the local time zone cannot shift the day.
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidTime(value: string): boolean {
  return TIME_PATTERN.test(value);
}

export function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
