// src/app/events/[id].tsx (EventDetail component)
import { Button } from "@/components/Button";
import Poster from "@/components/Poster";
import RSVPBottomSheetContent from "@/components/RSVPBottomSheetContent"; // Import the content component
import { useBottomSheet } from "@/hooks/useBottomSheet"; // Import the new hook
import { EventDetails, useEventDetails } from "@/hooks/useEventDetails";
import openMapApp from "@/lib/openMaps"; // Import openMapApp
import posterPreview from "@/lib/previewPoster";
import { formatTimeToAmPm } from "@/lib/timeFormat"; // Import formatTimeToAmPm
import { Feather } from "@expo/vector-icons";
import { format, isSameDay, parseISO, startOfDay } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GetTicket from "./_components/GetTicket";
import WeatherCard from "./_components/WeatherCard";

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

  console.log("🟢🟢🟢: ", event)

  const handleRsvpPress = (status: RsvpStatus) => {
    if (status) {
      openSheet(
        RSVPBottomSheetContent, // Pass the component itself
        { eventId: id as string, status: status, onClose: closeSheet }, // Pass props to the component
        `${status}` // Header title for the global sheet
      );
    }
  };

  const handleGetTicketPress = (event: EventDetails) => {
    if (event.id) {
      openSheet(GetTicket, { event, onClose: closeSheet }, `Ticket`);
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
  const eventDate = parseISO(event.date);
  const today = startOfDay(new Date());
  const tomorrow = startOfDay(new Date());
  tomorrow.setDate(tomorrow.getDate() + 1); // Sets tomorrow to the start of the next day
  const dayAfterTomorrow = startOfDay(new Date());
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2); // Sets day after tomorrow to the start of the day after next

  const showWeatherCard =
    isSameDay(eventDate, today) || // Is the event today?
    isSameDay(eventDate, tomorrow) || // Is the event tomorrow?
    isSameDay(eventDate, dayAfterTomorrow); // Is the event the day after tomorrow?

  return (
    <ImageBackground
      source={posterPreview(event.poster) as ImageSourcePropType}
      className="flex-1 w-full h-full pt-14" // Ensure ImageBackground fills the screen
      resizeMode="cover"
      blurRadius={40}
    >
      <ScrollView className="flex flex-grow w-full h-full px-5">
      {/* <SafeAreaView className="flex w-full pb-0"> */}
      {/* SafeAreaView takes full height */}
      {/* This ScrollView now wraps only the content that should scroll */}
        <Close />
        {/* ScrollView takes remaining height, apply horizontal padding here */}
        <View className="w-full">
          <Poster url={event.poster || ""} />
        </View>
        <View className="w-full flex flex-col justify-start items-start py-2 rounded-lg bg-zinc-800/40 px-3">
          <Text className="text-zinc-100 text-4xl font-bold w-full">
            {event.title}
          </Text>
          <Text className="text-zinc-100 text-xl">
            Hosted By {event.hostDetails?.full_name}
          </Text>
        </View>
        {/* RSVP Buttons - Moved back to their original position, outside the ScrollView */}
        {/* but still within the SafeAreaView's flex flow, so they are fixed relative to the screen */}
        {/* This block was originally here, before the description and other details */}
        {!event.is_closed ? (
        <View className="shadow-sm rounded-xl flex flex-row overflow-hidden my-4">
          {/* Added mt-2 for spacing */}
          <TouchableOpacity
            className={`flex-1 items-center justify-center p-3 ${currentUserRsvpStatus === "Going" ? "bg-green-200/80" : "bg-green-50/50"}`}
            onPress={() => handleRsvpPress("Going")}
            disabled={currentUserRsvpStatus === "Going"}
          >
            <Feather name="check" size={24} color="black" />
            <Text className="text-lg font-semibold">Going</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center justify-center p-3 border-x border-black/50 ${currentUserRsvpStatus === "May Be" ? "bg-yellow-200/80" : "bg-zinc-100/40"}`}
            onPress={() => handleRsvpPress("May Be")}
            disabled={currentUserRsvpStatus === "May Be"}
          >
            <Feather name="help-circle" size={24} color="black" />
            <Text className="text-lg font-semibold">May Be</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center justify-center p-3 ${currentUserRsvpStatus === "Not Going" ? "bg-red-400/70" : "bg-red-50/40"}`}
            onPress={() => handleRsvpPress("Not Going")}
            disabled={currentUserRsvpStatus === "Not Going"}
          >
            <Feather name="x-circle" size={24} color="black" />
            <Text className="text-lg font-semibold">Not Going</Text>
          </TouchableOpacity>
        </View>):(
          <View className="border border-red-800 mt-2 p-2 rounded-md bg-red-900/60">
            <Text className="font-semibold text-center text-red-200">Registration Closed</Text>
          </View>
        )}

        {/* The rest of the content (description, time, location, get ticket) goes inside the ScrollView */}
        {event.description && (
          <View className="flex flex-col justify-center items-center w-full px-3 py-2 rounded-lg bg-zinc-800/40 mt-2">
            <Text className="text-zinc-100 text-lg font-semibold w-full text-center">
              About
            </Text>
            <Text className="text-zinc-100/90 w-full leading-5 text-center">
              {event.description}
            </Text>
          </View>
        )}
        <View className="flex flex-row gap-2 mt-2">
          <View className="p-2 rounded-lg bg-black/50">
            <Feather name="clock" size={54} color="white" />
            {/* Reverted to black */}
          </View>
          <View className="flex grow p-2 bg-zinc-800/40 rounded-lg">
            <Text className="text-zinc-100 text-2xl font-extrabold">
              {format(parseISO(event.date), "EEEE, MMMM d")}
            </Text>
            <Text className="text-zinc-100 text-lg">
              {formatTimeToAmPm(event.start_time)} - {formatTimeToAmPm(event.end_time)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className="flex flex-row gap-2 mt-2"
          onPress={() =>
            openMapApp(
              event.address?.latitude || 0,
              event.address?.longitude || 0,
              event.address?.name || ""
            )
          }
        >
          <View className="p-2 rounded-lg bg-black/50">
            <Feather name="map-pin" size={54} color="white" />{" "}
            {/* Reverted to black */}
          </View>
          <View className="flex grow p-2 bg-zinc-800/40 rounded-lg">
            <Text className="text-zinc-100 text-xl font-bold capitalize">
              {event.address?.name?.substring(0, 29)}...
            </Text>
            <Text className="text-zinc-100 text-lg capitalize">
              {event.address?.city}, {event.address?.country}
            </Text>
          </View>
        </TouchableOpacity>
        {showWeatherCard && (
          <View>
            <WeatherCard
              latitude={event.address?.latitude?.toString()}
              longitude={event.address?.longitude?.toString()}
              dateString={event.date}
            />
          </View>
        )}
        <Button
          onPress={() => handleGetTicketPress(event)}
          className="bg-zinc-800 shadow-md mt-4 h-16"
        >
          <Text className="text-white text-xl font-semibold">
            Get Your Ticket
          </Text>
        </Button>
        <View className="h-24" />
        {/* Add some space at the bottom of the scroll view */}
      {/* </SafeAreaView> */}
      </ScrollView>
      {/* End ScrollView */}
    </ImageBackground>
  );
}

// function Poster({ url }: { url: string }) {
//   return (
//     <View className="w-full rounded-lg mb-4 aspect-square">
//       <Image
//         source={{ uri: url }}
//         className="w-full h-full rounded-2xl border-2 border-zinc-100"
//         resizeMode="cover"
//       />
//     </View>
//   );
// }

function Close() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      className="mb-4 p-2 items-center self-start bg-zinc-800/60 rounded-xl"
    >
      <Feather name="x-circle" size={26} color="white" />
    </TouchableOpacity>
  );
}
