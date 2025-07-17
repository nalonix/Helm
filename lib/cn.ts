import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to conditionally join and merge Tailwind CSS class names.
 * Ensures no conflicting styles are applied when multiple classes define the same property.
 * @param inputs - A list of class values (strings, arrays, objects).
 * @returns A single string of merged Tailwind CSS class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}