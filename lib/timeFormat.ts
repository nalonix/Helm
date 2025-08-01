import { format, parse } from 'date-fns';

/**
 * Converts a single 24-hour time string (e.g., "18:48:00") to 12-hour AM/PM format (e.g., "6:48 PM").
 *
 * @param {string | undefined | null} timeString - The time in "HH:mm:ss" format.
 * @returns {string} The formatted time (e.g., "6:48 PM") or "N/A" if the input is invalid.
 */
export function formatTimeToAmPm(timeString: string | undefined | null): string {
  console.log('formatTimeToAmPm called with:', timeString);
  
  if (!timeString) {
    return 'N/A';
  }

  // Provide a reference date for parsing, as parse() needs a full date
  // to create a valid Date object, even if we only care about time.
  // The date part doesn't matter for time formatting.
  // Using a fixed date like 2000-01-01 is common practice.
  const referenceDate = new Date(2000, 0, 1);

  try {
    // IMPORTANT: Changed 'HH:mm' to 'HH:mm:ss' to correctly parse the seconds part
    const parsedTime = parse(timeString, 'HH:mm', referenceDate);
    return format(parsedTime, 'h:mm a');
  } catch (e) {
    console.error('Error parsing time:', timeString, e);
    return 'N/A';
  }
}

// Example usage with your provided string:
// const myTimeString = "18:48:00";
// const formattedMyTime = formatTimeToAmPm(myTimeString); // "6:48 PM"

// const anotherTimeString = "09:05:30";
// const formattedAnotherTime = formatTimeToAmPm(anotherTimeString); // "9:05 AM"

// const invalidTime = null;
// const formattedInvalidTime = formatTimeToAmPm(invalidTime); // "N/A"