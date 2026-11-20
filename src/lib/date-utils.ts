/**
 * Date and Timezone Utilities for ToolWala Analytics
 * Configured specifically for Asia/Kolkata (IST = UTC+05:30)
 */

export const IST_OFFSET_MINUTES = 330; // 5 hours and 30 minutes
export const IST_OFFSET_MS = IST_OFFSET_MINUTES * 60 * 1000;

export interface DateRange {
  currentStart: Date;
  currentEnd: Date;
  prevStart: Date;
  prevEnd: Date;
  istYear: number;
  istMonth: number;
  istDate: number;
  istHours: number;
}

/**
 * Returns calendar date parts in Asia/Kolkata timezone.
 */
export function getIstCalendarParts(date = new Date()) {
  const istTime = new Date(date.getTime() + IST_OFFSET_MS);
  return {
    year: istTime.getUTCFullYear(),
    month: istTime.getUTCMonth(),
    date: istTime.getUTCDate(),
    hours: istTime.getUTCHours(),
    minutes: istTime.getUTCMinutes(),
    seconds: istTime.getUTCSeconds(),
  };
}

/**
 * Converts year, month, date, hour in Asia/Kolkata to an exact UTC Date object.
 */
export function istToUtc(
  year: number,
  month: number,
  date: number,
  hours = 0,
  minutes = 0,
  seconds = 0,
  ms = 0
): Date {
  return new Date(Date.UTC(year, month, date, hours, minutes, seconds, ms) - IST_OFFSET_MS);
}

/**
 * Formats a Date to an hourly label in Asia/Kolkata (e.g. "12 AM", "3 PM").
 */
export function formatIstHourLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

/**
 * Formats a Date to a day label in Asia/Kolkata (e.g. "Nov 20", "Wed").
 */
export function formatIstDayLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

/**
 * Resolves analytics time window boundaries based on filter type and Asia/Kolkata timezone.
 */
export function resolveAnalyticsTimeRange(
  filter: string,
  startParam?: string | null,
  endParam?: string | null,
  referenceDate = new Date()
): DateRange {
  const { year, month, date, hours } = getIstCalendarParts(referenceDate);

  let currentStart: Date;
  let currentEnd: Date;
  let prevStart: Date;
  let prevEnd: Date;

  if (filter === 'today') {
    // Current window: Today from 00:00:00.000 IST to 23:59:59.999 IST
    currentStart = istToUtc(year, month, date, 0, 0, 0, 0);
    currentEnd = istToUtc(year, month, date, 23, 59, 59, 999);

    // Previous window: Yesterday from 00:00:00.000 IST to 23:59:59.999 IST
    prevStart = istToUtc(year, month, date - 1, 0, 0, 0, 0);
    prevEnd = istToUtc(year, month, date - 1, 23, 59, 59, 999);
  } else if (filter === '30days') {
    // Current window: Last 30 calendar days in IST up to right now
    currentStart = istToUtc(year, month, date - 29, 0, 0, 0, 0);
    currentEnd = referenceDate;

    // Previous window: The 30 days prior to currentStart
    prevStart = istToUtc(year, month, date - 59, 0, 0, 0, 0);
    prevEnd = istToUtc(year, month, date - 30, 23, 59, 59, 999);
  } else if (filter === 'custom' && startParam && endParam) {
    currentStart = new Date(startParam);
    currentEnd = new Date(endParam);
    const duration = Math.abs(currentEnd.getTime() - currentStart.getTime());
    prevStart = new Date(currentStart.getTime() - duration);
    prevEnd = new Date(currentStart.getTime());
  } else {
    // Default '7days': Last 7 calendar days in IST up to right now
    currentStart = istToUtc(year, month, date - 6, 0, 0, 0, 0);
    currentEnd = referenceDate;

    // Previous window: The 7 days prior
    prevStart = istToUtc(year, month, date - 13, 0, 0, 0, 0);
    prevEnd = istToUtc(year, month, date - 7, 23, 59, 59, 999);
  }

  return {
    currentStart,
    currentEnd,
    prevStart,
    prevEnd,
    istYear: year,
    istMonth: month,
    istDate: date,
    istHours: hours,
  };
}
