import { supabase } from '@/lib/supabase'; // Import your Supabase client setup
import { useQuery } from '@tanstack/react-query';
import { isSameDay, parseISO } from 'date-fns'; // Added isSameDay

// Define the structure of the weather data we need
interface WeatherSummary {
  high: number;
  low: number;
  averageTemp: number;
  description: string;
  iconCode: string; // OpenWeatherMap icon code (e.g., "04d")
}

/**
 * Fetches and processes weather data for a given latitude, longitude, and specific date
 * by invoking the Supabase Edge Function.
 *
 * @param {number | null | undefined} lat - Latitude of the location.
 * @param {number | null | undefined} lon - Longitude of the location.
 * @param {string | undefined} targetDateString - The date for which to fetch weather, in 'YYYY-MM-DD' format.
 * @returns {Promise<WeatherSummary | null>} A promise that resolves to the weather summary or null.
 */
const fetchWeatherData = async (
  lat: number | null | undefined,
  lon: number | null | undefined,
  targetDateString: string | undefined
): Promise<WeatherSummary | null> => {
  if (!lat || !lon || !targetDateString) {
    console.warn("Coordinates or target date are missing for weather fetch.");
    return null;
  }

  const targetDate = parseISO(targetDateString);
  if (isNaN(targetDate.getTime())) { // Check if date parsing was successful
    console.error("Invalid targetDateString provided:", targetDateString);
    return null;
  }

  try {
    // Invoke the Supabase Edge Function to get weather data
    // The function name 'Weather-API' matches your deployed Edge Function
    const { data: edgeFunctionResponse, error: edgeFunctionError } = await supabase.functions.invoke('Weather-API', {
      body: { lat, lon }, // Pass lat and lon as the payload
    });

    if (edgeFunctionError) {
      console.error('Error invoking Edge Function:', edgeFunctionError);
      throw new Error(edgeFunctionError.message || 'Failed to fetch weather data via Edge Function.');
    }

    // The 'data' property from the Edge Function response contains the OpenWeatherMap JSON
    const data = edgeFunctionResponse as any;

    if (!data || !data.list || data.list.length === 0) {
      return null;
    }

    // Filter forecasts for the specific target date
    const relevantForecasts = data.list.filter((item: any) => {
      const itemDate = new Date(item.dt * 1000); // Convert Unix timestamp to Date
      return isSameDay(itemDate, targetDate);
    });

    if (relevantForecasts.length === 0) {
      console.warn(`No weather data found for ${targetDateString} at (${lat}, ${lon}).`);
      return null;
    }

    // Calculate high, low, average, and get description from relevant forecasts
    let high = -Infinity;
    let low = Infinity;
    let sumTemp = 0;
    let countTemp = 0;
    let description = 'N/A';
    let iconCode = '01d'; // Default icon

    relevantForecasts.forEach((item: any) => {
      if (item.main.temp_max > high) high = item.main.temp_max;
      if (item.main.temp_min < low) low = item.main.temp_min;
      sumTemp += item.main.temp;
      countTemp++;
      if (item.weather && item.weather.length > 0) {
        // Prioritize the most common weather description or the first one
        description = item.weather[0].description;
        iconCode = item.weather[0].icon;
      }
    });

    const averageTemp = countTemp > 0 ? sumTemp / countTemp : 0;

    return {
      high: parseFloat(high.toFixed(1)),
      low: parseFloat(low.toFixed(1)),
      averageTemp: parseFloat(averageTemp.toFixed(1)),
      description: description.charAt(0).toUpperCase() + description.slice(1), // Capitalize first letter
      iconCode: iconCode,
    };

  } catch (error) {
    console.error("Failed to fetch or process weather data:", error);
    throw error;
  }
};

/**
 * Custom hook to fetch weather data for a given location and specific date.
 * The result is memoized and cached by TanStack Query.
 *
 * @param {number | null | undefined} lat - Latitude of the location.
 * @param {number | null | undefined} lon - Longitude of the location.
 * @param {string | undefined} targetDateString - The date for which to fetch weather, in 'YYYY-MM-DD' format.
 * @returns An object containing `data` (WeatherSummary or null), `isLoading`, `isError`, and `error`.
 */
export const useWeather = (
  lat: number | null | undefined,
  lon: number | null | undefined,
  targetDateString: string | undefined
) => {
  return useQuery<WeatherSummary | null, Error>({
    // Cache key now includes the targetDateString for specific date caching
    queryKey: ['weatherData', lat, lon, targetDateString],
    queryFn: () => fetchWeatherData(lat, lon, targetDateString),
    // Query is enabled only if valid coordinates AND a valid targetDateString are provided
    enabled: !!lat && !!lon && !!targetDateString,
    staleTime: 1000 * 60 * 30, // Data considered stale after 30 minutes
  });
};
