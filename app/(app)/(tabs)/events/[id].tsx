import GetTicket from "@/components/GetTicket";
import RSVPResponse from "@/components/RSVPResponse";
import { useEventDetails } from "@/hooks/useEventDetails";
import { Feather } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Define the possible RSVP statuses
type RsvpStatus = "Going" | "May Be" | "Not Going" | null;

// RSVPSheet component now accepts props for status and eventId
interface RSVPSheetProps {
  eventId: string;
  hostId: string;
  status: RsvpStatus;
  onClose: () => void; // Callback to notify parent to close the sheet
}

function RSVPSheet({ eventId, hostId, status, onClose }: RSVPSheetProps) {
  // ref to the BottomSheet component
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Memoize snap points to prevent unnecessary re-renders
  const snapPoints = useMemo(() => ["35%"], []); // Adjust snap points as desired

  // Callback to handle sheet changes (e.g., when it's fully closed by pan-down)
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose(); // Notify parent when sheet is fully closed
      }
    },
    [onClose]
  );

  // Open the sheet when the status prop changes to a non-null value
  // and close it when status becomes null
  React.useEffect(() => {
    if (status) {
      bottomSheetRef.current?.snapToIndex(1); // Snap to a visible point (e.g., 50%)
    } else {
      bottomSheetRef.current?.close(); // Close the sheet
    }
  }, [status]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enablePanDownToClose={true}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetView className="flex-1 px-6 py-4">
        {/* Header for the Bottom Sheet */}
        <View className="flex flex-row justify-between items-center mb-4">
          <Text className="text-3xl font-bold">
            {status ? `${status}` : "RSVP"}
          </Text>
          <TouchableOpacity
            onPress={() => bottomSheetRef.current?.close()}
            className="p-1 items-center"
          >
            <Feather name="x-circle" size={28} />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center border border-dashed border-gray-400 p-4 rounded-lg">
          <RSVPResponse
            eventId={eventId}
            hostId={hostId}
            rsvpStatus={status}
            onSuccess={() => bottomSheetRef.current?.close()}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}





export default function EventDetail() {
  // This component will display the details of a specific event
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Use the new hook to fetch event details
  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useEventDetails(id as string); // Cast id to string for the hook

  // State to manage which RSVP sheet should be open
  const [selectedRsvpStatus, setSelectedRsvpStatus] =
    useState<RsvpStatus>(null);

  // Callback to open the sheet with a specific status
  const handleRsvpPress = (status: RsvpStatus) => {
    setSelectedRsvpStatus(status);
  };

  // Callback to close the sheet (passed to RSVPSheet)
  const handleSheetClose = useCallback(() => {
    setSelectedRsvpStatus(null);
  }, []);

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

  return (
    <SafeAreaView className="flex-1">
      <Text>EventDetail with {id}</Text>
      <Text className="text-lg font-semibold">{event.title}</Text>
      <Text>
        {event.start_time} - {event.end_time}
      </Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text>Close</Text>
      </TouchableOpacity>
      <GetTicket event={event} />
      <View className="border py-3 px-3">
        <View className="border rounded-xl flex flex-row overflow-hidden">
          <TouchableOpacity
            className={`flex-1 items-center justify-center p-3 ${event.rsvp?.response === "Going" ? "bg-green-300" : "bg-green-50"}`}
            onPress={() => handleRsvpPress("Going")}
          >
            <Text className="text-lg font-semibold">Going</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center justify-center p-3 border-x ${event.rsvp?.response === "May Be" ? "bg-yellow-300" : "bg-zinc-100"}`}
            onPress={() => handleRsvpPress("May Be")}
          >
            <Text className="text-lg font-semibold">May Be</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center justify-center p-3 ${event.rsvp?.response === "Not Going" ? "bg-red-300" : "bg-red-50"}`}
            onPress={() => handleRsvpPress("Not Going")}
          >
            <Text className="text-lg font-semibold">Not Going</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* The single RSVPSheet component, controlled by state */}
      <RSVPSheet
        eventId={id as string}
        hostId={event.host}
        status={selectedRsvpStatus}
        onClose={handleSheetClose}
      />
      

    </SafeAreaView>
  );
}
