// app/(app)/(tabs)/events/index.tsx
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';

import { useUpcomingEvents } from '@/hooks/useUpcomingEvents'; // Import your hook

// Define a more accurate type for your event data, matching what useUpcomingEvents provides
interface Event {
  id: string; // Assuming string from keyExtractor and common UUIDs
  title: string;
  description?: string;
  date: string;
  start_time: string; // Corrected from 'time' as used in JSX
  end_time?: string; // Added 'end_time' as it's used in JSX
  poster?: string | null; // Allow null for poster
  host: string; // Changed from creator_id to host as per your hook logic
  hosting: boolean; // Added 'hosting' as it's used in conditional rendering
  // Add any other properties your hook returns from the event object
}

export default function EventsIndex() {
  const { data: upcomingEvents, isLoading, isError, error } = useUpcomingEvents();

  return (
    <View className="flex-1 p-5 bg-gray-50">
      <Text className="text-2xl font-bold text-center mb-5">Upcoming Events 🚀</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#3b82f6" className="mt-10" />
      ) : isError ? (
        <Text className="text-red-600 text-center mt-5 text-base">
          Error: {error?.message || 'Failed to load events.'}
        </Text>
      ) : (
        <FlatList
          data={upcomingEvents}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text className="text-gray-500 text-center mt-10 text-base">
              No upcoming events found. Be the first to create one!
            </Text>
          }
          renderItem={({ item }) => {
            if (item.hosting) {
              return (
                <TouchableOpacity
                  onPress={() => router.push(`/(app)/(tabs)/events/host/${item.id}`)}
                  className="bg-white p-4 rounded-lg mb-2 shadow"
                >
                  <Text>Hosting 👑</Text>
                  <Text className="text-lg font-semibold">{item.title}</Text>
                  <Text className="text-sm text-gray-600">{item.date}</Text>
                  <Text className="text-sm text-gray-600">{item.start_time} to {item.end_time}</Text>
                  {item.description && <Text className="text-xs text-gray-700 mt-1">{item.description.substring(0, 100)}...</Text>}
                </TouchableOpacity>
              );
            } else {
              return (
                <TouchableOpacity
                  onPress={() => router.push(`/(app)/(tabs)/events/${item.id}`)}
                  className="bg-white p-4 rounded-lg mb-2 shadow"
                >
                  <Text className="text-lg font-semibold">{item.title}</Text>
                  <Text className="text-sm text-gray-600">{item.date}</Text>
                  <Text className="text-sm text-gray-600">{item.start_time} to {item.end_time}</Text>
                  {item.description && <Text className="text-xs text-gray-700 mt-1">{item.description.substring(0, 100)}...</Text>}
                </TouchableOpacity>
              );
            }
          }}
        />
      )}

      <TouchableOpacity
        onPress={() => router.push('/(app)/create')}
        className="bg-blue-500 p-4 rounded-lg items-center mt-5"
      >
        <Text className="text-white text-lg font-bold">Create New Event</Text>
      </TouchableOpacity>
    </View>
  );
}