// app/(app)/(tabs)/events/index.tsx
import { format, isThisWeek, isToday, isTomorrow, parseISO } from "date-fns";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import EventCard from "@/components/EventCard"; // Import the EventCard component
import { useUpcomingEvents } from "@/hooks/useUpcomingEvents";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

// Define a more accurate type for your event data, matching what useUpcomingEvents provides
interface Event {
  id: string;
  title: string;
  description?: string;
  date: string; // Assuming YYYY-MM-DD format
  start_time: string;
  end_time?: string;
  poster?: string | null;
  host?: string;
  hosting: boolean;
  address?: {
    name?: string;
    city?: string;
    country?: string;
  };
}

// Function to get the display header for a date
const getSectionHeader = (dateString: string): string => {
  const eventDate = parseISO(dateString);

  if (isToday(eventDate)) {
    return "Today";
  }
  if (isTomorrow(eventDate)) {
    return "Tomorrow";
  }
  if (isThisWeek(eventDate, { weekStartsOn: 1 })) {
    // weekStartsOn: 1 for Monday
    return "This Week";
  }
  return format(eventDate, "MMMM yyyy"); // e.g., "July 2025"
};

export default function EventsIndex() {
  const {
    data: upcomingEvents,
    isLoading,
    isError,
    error,
  } = useUpcomingEvents();

  // Memoize the categorized events to avoid re-calculating on every render
  const categorizedEvents = useMemo(() => {
    if (!upcomingEvents) return [];

    const sectionsMap = new Map<string, Event[]>();

    upcomingEvents.forEach((event) => {
      if (!event.date) return;

      const header = getSectionHeader(event.date);
      if (!sectionsMap.has(header)) {
        sectionsMap.set(header, []);
      }
      sectionsMap.get(header)?.push(event);
    });

    // Convert map to an array of sections for SectionList
    const sections = Array.from(sectionsMap.entries()).map(([title, data]) => ({
      title,
      data: data.sort(
        (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
      ), // Sort events within each section by date
    }));

    // Define a custom sort order for the section titles
    const customOrder = ["Today", "Tomorrow", "This Week"];

    sections.sort((a, b) => {
      const indexA = customOrder.indexOf(a.title);
      const indexB = customOrder.indexOf(b.title);

      // If both are in customOrder, sort by their index
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only A is in customOrder, A comes first
      if (indexA !== -1) {
        return -1;
      }
      // If only B is in customOrder, B comes first
      if (indexB !== -1) {
        return 1;
      }
      // Otherwise, sort chronologically by month name (e.g., "July 2025" vs "August 2025")
      return (
        parseISO(a.data[0].date).getTime() - parseISO(b.data[0].date).getTime()
      );
    });

    return sections;
  }, [upcomingEvents]);

  // Define the navigation handler to be passed to EventCard
  const handleEventPress = (id: string, isHosted: boolean) => {
    router.push(
      isHosted ? `/(app)/(tabs)/events/host/${id}` : `/(app)/view/${id}`
    );
  };

  // Render function for each item in the SectionList, using EventCard
  const renderEventItem = ({ item }: { item: Event }) => {
    return <EventCard item={item} onPress={handleEventPress} />;
  };

  return (
    <View className="relative flex flex-1">
      <View className="flex flex-1 px-5 pb-24">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3b82f6" className="mt-10" />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-red-600 text-center mt-5 text-base">
              Error: {error?.message || "Failed to load events."}
            </Text>
          </View>
        ) : (
          <SectionList
            sections={categorizedEvents}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section: { title } }) => (
              <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">
                {title}
              </Text>
            )}
            renderItem={renderEventItem}
            ListHeaderComponent={
              <Text className="text-3xl font-bold text-gray-900 mt-6 mb-2">
                Upcoming Events
              </Text>
            }
            ListEmptyComponent={
              <View className="flex flex-col items-center py-24 px-6">
                <Feather name="cloud" size={48} color={"grey"} />
                <Text className="text-gray-500 text-center text-lg">
                  No upcoming events found. Be the first to create one!
                </Text>
              </View>
            }
            contentContainerStyle={{
              paddingBottom: 32,
            }}
            className="flex flex-1 h-full"
          />
        )}
      <View className="h-16" />
      </View>

      <BlurView
        intensity={100}
        className="absolute bottom-28 py-2 px-2 w-full flex"
      >
        <TouchableOpacity
          onPress={() => router.push("/(app)/create")}
          className="bg-helm-orange-red p-4 rounded-lg items-center shadow-lg"
        >
          <Text className="text-white text-lg font-bold">Create New Event</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}
