/**
 * Date utility functions for safe local timezone date handling
 * Avoids UTC conversion issues that occur with toISOString()
 */

/**
 * Format a Date object to YYYY-MM-DD string using local timezone
 * This is safer than toISOString().split('T')[0] which converts to UTC first
 */
export const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date string in YYYY-MM-DD format (local timezone)
 */
export const getTodayString = (): string => {
  return formatDateToString(new Date());
};

/**
 * Get yesterday's date string in YYYY-MM-DD format (local timezone)
 */
export const getYesterdayString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDateToString(yesterday);
};

/**
 * Check if a date string represents today (local timezone)
 */
export const isToday = (dateStr: string): boolean => {
  return dateStr === getTodayString();
};

/**
 * Check if a date string represents yesterday (local timezone)
 */
export const isYesterday = (dateStr: string): boolean => {
  return dateStr === getYesterdayString();
};
