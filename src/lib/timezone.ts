/**
 * Get all IANA timezone names supported by the browser.
 */
export function getAllTimezones(): string[] {
  return Intl.supportedValuesOf('timeZone');
}

/**
 * Get the browser's current timezone.
 */
export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Build a Date from date, optional time, and timezone.
 * If time is omitted, defaults to midnight (00:00:00).
 * Uses the Intl API to resolve the timezone offset for that moment.
 */
export function buildDateInTimezone(
  dateStr: string,
  timeStr: string | null,
  timezone: string,
): Date {
  const time = timeStr || '00:00:00';
  const [hours, minutes, seconds] = time.split(':').map(Number);

  // Parse the date parts
  const [year, month, day] = dateStr.split('-').map(Number);

  // Create a rough UTC date first
  const roughUtc = new Date(
    Date.UTC(year, month - 1, day, hours, minutes, seconds || 0),
  );

  // Get the offset of the target timezone at this rough time
  const offsetMinutes = getTimezoneOffsetMinutes(roughUtc, timezone);

  // Adjust: if timezone is UTC+5, we need to subtract 5 hours from the wall-clock
  // time to get UTC
  const utcMs = roughUtc.getTime() - offsetMinutes * 60 * 1000;

  return new Date(utcMs);
}

/**
 * Get the UTC offset in minutes for a timezone at a given instant.
 * Positive = ahead of UTC (e.g. +60 for UTC+1).
 */
function getTimezoneOffsetMinutes(date: Date, timezone: string): number {
  // Format the date in the target timezone and in UTC, then diff
  const utcParts = getDateParts(date, 'UTC');
  const tzParts = getDateParts(date, timezone);

  const utcDate = new Date(
    Date.UTC(
      utcParts.year,
      utcParts.month - 1,
      utcParts.day,
      utcParts.hour,
      utcParts.minute,
      utcParts.second,
    ),
  );
  const tzDate = new Date(
    Date.UTC(
      tzParts.year,
      tzParts.month - 1,
      tzParts.day,
      tzParts.hour,
      tzParts.minute,
      tzParts.second,
    ),
  );

  return (tzDate.getTime() - utcDate.getTime()) / (60 * 1000);
}

function getDateParts(
  date: Date,
  timezone: string,
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parseInt(parts.find((p) => p.type === type)!.value);

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
}
