// Shared helper for the rolling "next N months" tide-calendar links.
//
// Why this exists: the old code built `new Date(year, month + idx, 1)` in the SERVER's timezone
// (UTC on Vercel), then formatted the month NAME in America/New_York. Midnight UTC on the 1st is
// still the previous evening in New York, so every label landed one month early and the year could
// disagree with the name (e.g. /tides/december-2027). Here we read the current year/month in
// New York once, then do plain integer arithmetic so name and year can never drift apart.

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export interface MonthLink {
  label: string; // "October 2026"
  slug: string;  // "october-2026" (matches MONTH_MAP parsing in app/tides/[month]/page.tsx)
}

export function upcomingMonths(count: number, from: Date = new Date()): MonthLink[] {
  // formatToParts gives us the calendar year/month as seen in Vero Beach, not on the server.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(from);
  const year = Number(parts.find((p) => p.type === 'year')!.value);
  const monthIdx = Number(parts.find((p) => p.type === 'month')!.value) - 1;

  return Array.from({ length: count }, (_, i) => {
    const total = monthIdx + i;
    const y = year + Math.floor(total / 12); // rolls the year over correctly in December
    const name = MONTH_NAMES[total % 12];
    return { label: `${name} ${y}`, slug: `${name.toLowerCase()}-${y}` };
  });
}
