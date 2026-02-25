export const TIMEZONES = [
  { id: 'Asia/Tokyo',          label: 'Tokyo (JST, +9)' },
  { id: 'Asia/Seoul',          label: 'Seoul (KST, +9)' },
  { id: 'Asia/Shanghai',       label: 'Shanghai (CST, +8)' },
  { id: 'Asia/Hong_Kong',      label: 'Hong Kong (HKT, +8)' },
  { id: 'Asia/Singapore',      label: 'Singapore (SGT, +8)' },
  { id: 'Asia/Bangkok',        label: 'Bangkok (ICT, +7)' },
  { id: 'Asia/Jakarta',        label: 'Jakarta (WIB, +7)' },
  { id: 'Asia/Kolkata',        label: 'Mumbai (IST, +5:30)' },
  { id: 'Asia/Dubai',          label: 'Dubai (GST, +4)' },
  { id: 'Europe/Istanbul',     label: 'Istanbul (TRT, +3)' },
  { id: 'Europe/Moscow',       label: 'Moscow (MSK, +3)' },
  { id: 'Africa/Nairobi',      label: 'Nairobi (EAT, +3)' },
  { id: 'Europe/Helsinki',     label: 'Helsinki (EET, +2/3)' },
  { id: 'Europe/Paris',        label: 'Paris (CET, +1/2)' },
  { id: 'Europe/Berlin',       label: 'Berlin (CET, +1/2)' },
  { id: 'Europe/Rome',         label: 'Rome (CET, +1/2)' },
  { id: 'Europe/Madrid',       label: 'Madrid (CET, +1/2)' },
  { id: 'Europe/Amsterdam',    label: 'Amsterdam (CET, +1/2)' },
  { id: 'Europe/Zurich',       label: 'Zurich (CET, +1/2)' },
  { id: 'Europe/London',       label: 'London (GMT/BST, 0/+1)' },
  { id: 'Atlantic/Reykjavik',  label: 'Reykjavik (GMT, 0)' },
  { id: 'America/Sao_Paulo',   label: 'São Paulo (BRT, -3)' },
  { id: 'America/New_York',    label: 'New York (ET, -5/-4)' },
  { id: 'America/Chicago',     label: 'Chicago (CT, -6/-5)' },
  { id: 'America/Denver',      label: 'Denver (MT, -7/-6)' },
  { id: 'America/Los_Angeles', label: 'Los Angeles (PT, -8/-7)' },
  { id: 'America/Anchorage',   label: 'Anchorage (AKT, -9/-8)' },
  { id: 'Pacific/Honolulu',    label: 'Honolulu (HST, -10)' },
  { id: 'Pacific/Auckland',    label: 'Auckland (NZST, +12/13)' },
  { id: 'Australia/Sydney',    label: 'Sydney (AEST, +10/11)' },
];

export function toUTC(localDate: string, localTime: string, tzId: string): string | null {
  if (!localDate || !localTime || !tzId) return null;
  try {
    const naive = new Date(`${localDate}T${localTime}:00Z`).getTime();
    const d = new Date(naive);
    const p: Record<string, string> = {};
    new Intl.DateTimeFormat('en-CA', {
      timeZone: tzId,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).formatToParts(d).forEach(({ type, value }) => { p[type] = value; });
    const offset =
      new Date(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`).getTime() - naive;
    return new Date(naive - offset).toISOString();
  } catch {
    return null;
  }
}
