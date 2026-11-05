import { describe, expect, it } from 'vitest';
import { toUTC } from '@/utils/time';

describe('toUTC', () => {
  it.each([
    ['a zone without DST', '2026-11-02', '10:00', 'Asia/Tokyo', '2026-11-02T01:00:00.000Z'],
    ['Paris winter time', '2026-01-15', '12:00', 'Europe/Paris', '2026-01-15T11:00:00.000Z'],
    ['Paris summer time', '2026-07-15', '12:00', 'Europe/Paris', '2026-07-15T10:00:00.000Z'],
    // Within a few hours of a DST change, the offset must be taken at the real instant.
    ['Paris just before DST', '2026-03-29', '01:30', 'Europe/Paris', '2026-03-29T00:30:00.000Z'],
    ['Paris just after DST', '2026-03-29', '03:30', 'Europe/Paris', '2026-03-29T01:30:00.000Z'],
    [
      'New York just after DST',
      '2026-03-08',
      '03:30',
      'America/New_York',
      '2026-03-08T07:30:00.000Z',
    ],
    [
      'New York just before DST ends',
      '2026-11-01',
      '00:30',
      'America/New_York',
      '2026-11-01T04:30:00.000Z',
    ],
  ])('converts %s', (_case, date, time, tzId, expected) => {
    expect(toUTC(date, time, tzId)).toBe(expected);
  });

  it('returns null for missing values or an unknown time zone', () => {
    expect(toUTC('', '10:00', 'Asia/Tokyo')).toBeNull();
    expect(toUTC('2026-11-02', '10:00', 'Mars/Base')).toBeNull();
  });
});
