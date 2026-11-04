import { describe, expect, it } from 'vitest';
import { isValidDate, isValidTime, isValidTimeZone } from '@/validators';

describe('isValidDate', () => {
  it('accepts existing dates in YYYY-MM-DD form', () => {
    expect(isValidDate('2026-11-01')).toBe(true);
    expect(isValidDate('2026-12-31')).toBe(true);
    expect(isValidDate('2028-02-29')).toBe(true); // leap year
  });

  it('rejects other formats', () => {
    expect(isValidDate('')).toBe(false);
    expect(isValidDate('2026/11/01')).toBe(false);
    expect(isValidDate('2026-11-1')).toBe(false);
    expect(isValidDate('01-11-2026')).toBe(false);
    expect(isValidDate('2026-11-01T00:00:00Z')).toBe(false);
    expect(isValidDate(' 2026-11-01')).toBe(false);
    expect(isValidDate('abc')).toBe(false);
  });

  it('rejects dates that do not exist', () => {
    expect(isValidDate('2026-02-29')).toBe(false); // not a leap year
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('2026-04-31')).toBe(false);
    expect(isValidDate('2026-13-01')).toBe(false);
    expect(isValidDate('2026-00-10')).toBe(false);
    expect(isValidDate('2026-11-00')).toBe(false);
  });
});

describe('isValidTime', () => {
  it('accepts times in HH:MM form', () => {
    expect(isValidTime('00:00')).toBe(true);
    expect(isValidTime('09:05')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
  });

  it('rejects other formats', () => {
    expect(isValidTime('')).toBe(false);
    expect(isValidTime('9:05')).toBe(false);
    expect(isValidTime('12:00:00')).toBe(false);
    expect(isValidTime(' 12:00')).toBe(false);
    expect(isValidTime('abc')).toBe(false);
  });

  it('rejects times that do not exist', () => {
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('12:60')).toBe(false);
  });
});

describe('isValidTimeZone', () => {
  it('accepts IANA time zone names', () => {
    expect(isValidTimeZone('Asia/Tokyo')).toBe(true);
    expect(isValidTimeZone('Europe/Paris')).toBe(true);
    expect(isValidTimeZone('UTC')).toBe(true);
  });

  it('rejects empty or unknown values', () => {
    expect(isValidTimeZone('')).toBe(false);
    expect(isValidTimeZone('   ')).toBe(false);
    expect(isValidTimeZone('Mars/Base')).toBe(false);
    expect(isValidTimeZone('Asia/Tokyo ')).toBe(false);
  });
});
