import { Button } from "@/components/Button";
import { HostEvent } from "@/hooks/useHostEventData";
import { supabase } from "@/lib/supabase"; // Ensure this path is correct for your Supabase client
import { useHostEvent } from "@/providers/HostEventProvider";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Switch, Text, View } from "react-native"; // Added StyleSheet for potential future use
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
// import Switch from "react-native-switch-toggles";

// --- Type Definitions ---
interface EventUpdateData {
  is_closed?: boolean;
  guest_list_preference?: "public" | "hidden";
}

// Type for the context passed from onMutate to onError/onSettled
interface EventMutationContext {
  previousEvent: any; // Using 'any' for simplicity. Consider a more specific type like { event: Event } | undefined
}

// --- Supabase Database Functions (Modularized, outside the component) ---

/**
 * Updates properties of an event in the 'events' table.
 * @param eventId The ID of the event to update.
 * @param data An object containing the properties to update (e.g., { is_closed: true }).
 * @returns The updated event data.
 */
async function updateEvent(eventId: string, data: EventUpdateData) {
  const { data: updatedEvent, error } = await supabase
    .from("events")
    .update(data)
    .eq("id", eventId)
    .select()
    .single();

  if (error) {
    console.error("Error updating event:", error.message);
    throw new Error(`Failed to update event: ${error.message}`);
  }
  return updatedEvent;
}

/**
 * Deletes an event from the 'events' table and its associated poster from storage.
 * @param eventId The ID of the event to delete.
 * @param posterUrl The URL of the event poster to delete from storage.
 */
async function deleteEventAndPoster(eventId: string, posterUrl: string | null) {
  // 1. Delete poster from storage (if it exists and is a valid Supabase URL)
  if (posterUrl) {
    try {
      // Supabase public URLs typically look like:
      // https://[project_id].supabase.co/storage/v1/object/public/[bucket_name]/[path/to/file.jpg]
      const urlSegments = posterUrl.split('/public/');
      if (urlSegments.length > 1) {
        const pathAfterPublic = urlSegments[1]; // This will be "bucket_name/path/to/file.jpg"
        const [bucketName, ...filePathParts] = pathAfterPublic.split('/');
        const filePath = filePathParts.join('/'); // Reconstruct the path within the bucket

        if (bucketName && filePath) {
          const { error: storageError } = await supabase.storage
            .from(bucketName) // Use the extracted bucket name
            .remove([filePath]); // Use the extracted file path

          if (storageError) {
            console.warn(`Warning: Failed to delete poster '${filePath}' from storage bucket '${bucketName}':`, storageError.message);
            // Do not throw an error here; event deletion should still proceed
          } else {
            console.log(`Successfully deleted poster '${filePath}' from storage bucket '${bucketName}'.`);
          }
        } else {
          console.warn("Could not parse bucket name or file path from poster URL:", posterUrl);
        }
      } else {
        console.warn("Poster URL does not seem to be a valid Supabase public URL for deletion:", posterUrl);
      }
    } catch (e) {
      console.warn("Error processing poster URL or deleting from storage:", e);
    }
  }

  // 2. Delete the event from the 'events' table
  const { error: dbError } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  if (dbError) {
    console.error("Error deleting event from DB:", dbError.message);
    throw new Error(`Failed to delete event: ${dbError.message}`);
  }
  console.log(`Successfully deleted event with ID: ${eventId}`);
}

// --- React Component ---

export default function General() {
  const { id } = useLocalSearchParams();
  const eventId = typeof id === 'string' ? id : undefined;

  const { hostEventData, isLoading, isError, error } = useHostEvent();
  // Ensure 'event' is typed correctly based on your 'Event' type
  const event: HostEvent | undefined = hostEventData?.event;

  // Initialize state for toggles
  // `isRegistrationOpen` represents "Accept Registration"
  // If `event.is_closed` is true, then registration is NOT open.
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [isGuestListPublic, setIsGuestListPublic] = useState(false);

  // Use useEffect to synchronize local state with event data when it loads or changes
  useEffect(() => {
    if (event) {
      // Set the toggle based on the inverse of is_closed (true = open, false = closed)
      setIsRegistrationOpen(!event.is_closed);
      // Set the toggle based on guest_list_preference
      setIsGuestListPublic(event.guest_list_preference === "public");
    }
  }, [event]); // Dependency array: run when 'event' object changes

  const queryClient = useQueryClient();

  // Mutation for Registration Toggle
  const registrationMutation = useMutation<any, Error, boolean, EventMutationContext>({
    // `newOpenStatus` is the boolean from the toggle: true if "Accept Registration" is ON, false if OFF
    mutationFn: async (newOpenStatus: boolean) => {
      // `is_closed` in DB should be true if newOpenStatus is false, and vice-versa
      return await updateEvent(eventId!, { is_closed: !newOpenStatus });
    },
    onMutate: async (newOpenStatus) => {
      // Optimistically update the UI
      setIsRegistrationOpen(newOpenStatus);
      // Cancel any outgoing refetches for this query
      await queryClient.cancelQueries({ queryKey: ['hostEventData', eventId] });
      // Snapshot the previous value
      const previousEvent = queryClient.getQueryData(['hostEventData', eventId]);
      // Optimistically update the cache
      queryClient.setQueryData(['hostEventData', eventId], (oldData: any) => {
        if (!oldData || !oldData.event) return oldData;
        return {
          ...oldData,
          event: { ...oldData.event, is_closed: !newOpenStatus }, // Update is_closed property in cache
        };
      });
      return { previousEvent }; // Return context for onError/onSettled
    },
    onError: (err, newOpenStatus, context) => {
      // Revert to the previous state on error
      setIsRegistrationOpen(!newOpenStatus); // Revert the toggle state
      if (context?.previousEvent) {
        queryClient.setQueryData(['hostEventData', eventId], context.previousEvent); // Revert cache
      }
      Alert.alert("Error", `Failed to update registration status: ${err.message}`);
    },
    onSettled: () => {
      // Invalidate and refetch after mutation to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['hostEventData', eventId] });
    },
  });

  // Mutation for Public Guest List Toggle
  const guestListMutation = useMutation<any, Error, boolean, EventMutationContext>({
    // `newPublicStatus` is the boolean from the toggle: true if "Public Guest List" is ON, false if OFF
    mutationFn: async (newPublicStatus: boolean) =>
      await updateEvent(eventId!, { guest_list_preference: newPublicStatus ? "public" : "hidden" }),
    onMutate: async (newPublicStatus) => {
      setIsGuestListPublic(newPublicStatus);
      await queryClient.cancelQueries({ queryKey: ['hostEventData', eventId] });
      const previousEvent = queryClient.getQueryData(['hostEventData', eventId]);
      queryClient.setQueryData(['hostEventData', eventId], (oldData: any) => {
        if (!oldData || !oldData.event) return oldData;
        return {
          ...oldData,
          event: { ...oldData.event, guest_list_preference: newPublicStatus ? "public" : "hidden" },
        };
      });
      return { previousEvent };
    },
    onError: (err, newPublicStatus, context) => {
      setIsGuestListPublic(!newPublicStatus);
      if (context?.previousEvent) {
        queryClient.setQueryData(['hostEventData', eventId], context.previousEvent);
      }
      Alert.alert("Error", `Failed to update guest list preference: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['hostEventData', eventId] });
    },
  });

  // Mutation for Cancel Event
  const cancelEventMutation = useMutation<void, Error, void, EventMutationContext>({
    mutationFn: async () => {
      if (!eventId || !event) {
        throw new Error("Event ID or event data is missing.");
      }
      await deleteEventAndPoster(eventId, event.poster || null);
    },
    onSuccess: () => {
      Alert.alert("Success", "Event canceled and deleted.");
      // Navigate away after successful deletion
      queryClient.invalidateQueries({
        queryKey: ["myUpcomingEvents", event?.host],
      });
      router.push('/(app)/(tabs)/events');
    },
    onError: (err) => {
      Alert.alert("Error", `Failed to cancel event: ${err.message}`);
    },
    onSettled: () => {
      // Invalidate a query that lists all host events, if you have one.
      // This ensures the list of events is updated to remove the deleted one.
      queryClient.invalidateQueries({ queryKey: ['hostEvents'] });
    }
  });

  // Handle initial loading and error states for the main event data fetch
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#BB4017" />
        <Text className="mt-4 text-gray-700">Loading event settings...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !event) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-red-100 p-5">
        <Text className="text-red-800 text-center text-lg">
          Error loading event: {error?.message || "Event not found."}
        </Text>
        <Text className="text-red-600 text-center text-sm mt-2">
          Please ensure you have a valid event ID.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="px-5 flex-1">
      <ScrollView className="flex-1">
      {/* Registration Section */}
      <View className="flex flex-col bg-white rounded-lg px-4 pt-4 pb-2 mb-3 border border-gray-200 shadow-sm">
        <Feather name="clipboard" size={28} color="black" />
        <Text className="text-2xl mt-3 font-semibold">Registration</Text>
        <Text className="mt-1 text-zinc-600">
          Close registration to stop accepting new guests, including anyone who
          may have been invited.
        </Text>
        <View className="w-full flex flex-row justify-between mt-5 items-center pb-2">
          <Text className="text-xl font-semibold text-zinc-600">
            Accept Registration
          </Text>
          {registrationMutation.isPending ? (
            <ActivityIndicator size="small" color="#BB4017" />
          ) : (
            <Switch
              value={isRegistrationOpen} // Controls the "Accept Registration" toggle state
              // onChange={(value) => registrationMutation.mutate(value)} // Pass the new toggle state directly
              onValueChange={(value => registrationMutation.mutate(value))} // Use onValueChange for better compatibility
              // activeTrackColor={"#BB4017"}
            />
          )}
        </View>
      </View>

      {/* Guest List Section */}
      <View className="flex flex-col bg-white rounded-lg px-4 pt-4 pb-2 mb-3 border border-gray-200 shadow-sm">
        <Feather name="users" size={28} color="black" />
        <Text className="text-2xl mt-3 font-semibold">Guest List</Text>
        <Text className="mt-1 text-zinc-600">
          Control visibility of guest list to the public. Invitees with
          invitation will be able to see who’s going.
        </Text>
        <View className="w-full flex flex-row justify-between mt-5 items-center pb-2">
          <Text className="text-xl font-semibold text-zinc-600">
            Public Guest List
          </Text>
          {guestListMutation.isPending ? (
            <ActivityIndicator size="small" color="#BB4017" />
          ) : (
            <Switch
              value={isGuestListPublic}
              onValueChange={(value) => guestListMutation.mutate(value)}              
            />
          )}
        </View>
      </View>

      {/* Cancel Event Section */}
      <View className="flex flex-col bg-white rounded-lg px-4 pt-4 pb-2 mb-3 border border-gray-200 shadow-sm">
        <Feather name="info" size={28} color="black" />
        <Text className="text-2xl mt-3 font-semibold">Cancel Event</Text>
        <Text className="mt-1 text-zinc-600">
          Cancel and permanently delete this event. This operation cannot be
          undone. If there are any registered guests, we will notify them that
          the event has been canceled.
        </Text>
        <View className="w-full flex flex-row justify-between mt-5 items-center pb-2">
          <Button
            className="w-full border border-red-300"
            variant={"danger"}
            onPress={() =>
              Alert.alert(
                "Confirm Cancellation",
                "Are you sure you want to permanently delete this event? This action cannot be undone.",
                [
                  { text: "No", style: "cancel" },
                  {
                    text: "Yes",
                    onPress: () => cancelEventMutation.mutate(), 
                    style: "destructive",
                  },
                ]
              )
            }
            disabled={cancelEventMutation.isPending} // Disable button while deleting
          >
            {cancelEventMutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              "Cancel Event"
            )}
          </Button>
        </View>
      </View>
      <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}