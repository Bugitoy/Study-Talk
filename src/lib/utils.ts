import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts decimal hours to a readable hours and minutes format
 * @param decimalHours - Hours in decimal format (e.g., 2.5)
 * @returns Formatted string (e.g., "2h 30m" or "45m" or "1h")
 */
export function formatStudyTime(decimalHours: number): string {
  if (decimalHours === 0) return '0m';
  
  const totalMinutes = Math.round(decimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}
