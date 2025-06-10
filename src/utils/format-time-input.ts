import { TimeOnly } from '../classes/time-only';

/**
 * Formats a TimeOnly object as HH:MM string for use in time input fields.
 * @param time The TimeOnly object to format
 * @returns Time formatted as "HH:MM" (e.g., "09:30", "14:45")
 */
export function formatTimeInput(time: TimeOnly): string {
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
