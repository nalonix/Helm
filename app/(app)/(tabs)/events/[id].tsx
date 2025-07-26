// src/app/events/[id].tsx (EventDetail component)
import RSVPBottomSheetContent from "@/components/RSVPBottomSheetContent"; // Import the content component
import { useBottomSheet } from "@/hooks/useBottomSheet"; // Import the new hook
import { EventDetails, useEventDetails } from "@/hooks/useEventDetails";
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GetTicket from "./_components/GetTicket";

// Define the possible RSVP statuses (remains the same)
type RsvpStatus = "Going" | "May Be" | "Not Going" | null;

export default function EventDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { openSheet, closeSheet } = useBottomSheet(); // Use the global bottom sheet hook

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useEventDetails(id as string);

  // No need for selectedRsvpStatus state anymore, as it's passed directly
  // No need for handleSheetClose or handleRsvpPress state management here
  // as the global sheet handles its own visibility and closing.

  const handleRsvpPress = (status: RsvpStatus) => {
    if (status) {
      openSheet(
        RSVPBottomSheetContent, // Pass the component itself
        { eventId: id as string, status: status, onClose: closeSheet }, // Pass props to the component
        `${status} to Event` // Header title for the global sheet
      );
    }
  };

  const handleGetTicketPress = (event: EventDetails) => {
    if (event.id) {
      openSheet(
        GetTicket, 
        { event, onClose: closeSheet }, 
        `Ticket` 
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading event details...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 p-4">
        <Text className="text-red-600 text-center text-lg">
          Error loading event: {error?.message || "Unknown error."}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 p-3 bg-gray-200 rounded-lg items-center"
        >
          <Text className="text-base">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 p-4">
        <Text className="text-gray-600 text-center text-lg">
          Event not found.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 p-3 bg-gray-200 rounded-lg items-center"
        >
          <Text className="text-base">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentUserRsvpStatus = event.rsvp?.response;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">

      <View className="p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4 p-2 bg-gray-200 rounded-lg items-center self-start"
        >
          <Text className="text-base">← Back to Events</Text>
        </TouchableOpacity>


        <Text className="text-3xl font-bold mb-2">{event.title}</Text>
        {event.description && <Text className="text-gray-700 text-base mb-4">{event.description}</Text>}
        <Text className="text-gray-600 text-sm">Date: {event.date}</Text>
        <Text className="text-gray-600 text-sm">Time: {event.start_time} - {event.end_time}</Text>
        <Text className="text-gray-600 text-sm">Host: {event.host}</Text>

        {event.poster && (
          <View className='mt-4 w-full h-48 rounded-lg overflow-hidden'>
            <Image
              source={{ uri: supabase.storage.from('posters').getPublicUrl(event.poster).data.publicUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
        )}

        {currentUserRsvpStatus && (
          <View className='mt-4 p-3 bg-blue-100 rounded-lg'>
            <Text className='text-blue-800 font-semibold'>
              Your RSVP: {currentUserRsvpStatus}
              {event.rsvp?.message && ` - "${event.rsvp.message}"`}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity onPress={() => handleGetTicketPress(event)}>
        <Text>Get Ticket</Text>
      </TouchableOpacity>

      <View className="mt-auto border py-3 px-3 bg-white border-t border-gray-200">
        <View className="border rounded-xl flex flex-row overflow-hidden">
          <TouchableOpacity
            className={`flex-1 items-center justify-center p-3 ${currentUserRsvpStatus === "Going" ? "bg-green-200" : "bg-green-50"}`}
            onPress={() => handleRsvpPress("Going")}
            disabled={currentUserRsvpStatus === "Going"}
          >
            <Text className="text-lg font-semibold">Going</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center justify-center p-3 border-x ${currentUserRsvpStatus === "May Be" ? "bg-yellow-200" : "bg-zinc-100"}`}
            onPress={() => handleRsvpPress("May Be")}
            disabled={currentUserRsvpStatus === "May Be"}
          >
            <Text className="text-lg font-semibold">May Be</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center justify-center p-3 ${currentUserRsvpStatus === "Not Going" ? "bg-red-200" : "bg-red-50"}`}
            onPress={() => handleRsvpPress("Not Going")}
            disabled={currentUserRsvpStatus === "Not Going"}
          >
            <Text className="text-lg font-semibold">Not Going</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}