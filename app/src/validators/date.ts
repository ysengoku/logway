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
