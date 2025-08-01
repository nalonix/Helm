import { useWeather } from "@/hooks/useWeather"; // Import the useWeather hook
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface WeatherCardProps {
  latitude: string | undefined;
  longitude: string | undefined;
  dateString: string; // Date in ISO format (YYYY-MM-DD)
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  latitude,
  longitude,
  dateString,
}) => {
  const {
    data: weather,
    isLoading,
    isError,
    error,
  } = useWeather(
    parseFloat(latitude || ""),
    parseInt(longitude || ""),
    dateString
  );

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator size="small" color="#a3a3a3" />
        <Text>Loading weather...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View>
        <Text>Weather Error: {error?.message || "Failed to load weather"}</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View>
        <Text>No weather data available.</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-row gap-3 mt-2">
      <View className="p-2 rounded-lg bg-black/50">
        <Feather name="thermometer" size={54} color="white" />{" "}
        {/* Reverted to black */}
      </View>
      <View className="flex flex-row flex-grow gap-2 p-2 bg-zinc-800/40 rounded-lg">
        <View>
          <Text className="text-zinc-100/90 text-6xl font-semibold">
            {Math.round(weather.averageTemp)}°
          </Text>
        </View>
        <View>
          <Text className="text-zinc-100/90 text-2xl font-extrabold">
            {weather.description}
          </Text>
          <Text className="text-zinc-100 text-lg">
            H: {Math.round(weather.high)}°C L: {Math.round(weather.low)}°C
          </Text>
        </View>
      </View>
    </View>
  );
};

export default WeatherCard;
