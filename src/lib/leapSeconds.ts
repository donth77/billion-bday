/**
 * Complete list of all UTC leap seconds inserted since 1972.
 * Each entry is the date *after* which the leap second was inserted,
 * i.e. the leap second occurred at 23:59:60 UTC on that date.
 * No new leap seconds have been added since 2016-12-31, and the
 * practice was abolished effective 2035 by the CGPM in November 2022.
 */
export const LEAP_SECONDS: Date[] = [
  '1972-06-30',
  '1972-12-31',
  '1973-12-31',
  '1974-12-31',
  '1975-12-31',
  '1976-12-31',
  '1977-12-31',
  '1978-12-31',
  '1979-12-31',
  '1981-06-30',
  '1982-06-30',
  '1983-06-30',
  '1985-06-30',
  '1987-12-31',
  '1989-12-31',
  '1990-12-31',
  '1992-06-30',
  '1993-06-30',
  '1994-06-30',
  '1995-12-31',
  '1997-06-30',
  '1998-12-31',
  '2005-12-31',
  '2008-12-31',
  '2012-06-30',
  '2015-06-30',
  '2016-12-31',
].map((d) => new Date(d + 'T23:59:59Z'));

/**
 * Count how many leap seconds occurred between two UTC timestamps.
 */
export function countLeapSecondsBetween(from: Date, to: Date): number {
  const start = from < to ? from : to;
  const end = from < to ? to : from;
  return LEAP_SECONDS.filter((ls) => ls >= start && ls <= end).length;
}

/**
 * Count leap seconds that occurred from a given date until now.
 */
export function leapSecondsSinceBirth(birthDate: Date): number {
  return countLeapSecondsBetween(birthDate, new Date());
}
