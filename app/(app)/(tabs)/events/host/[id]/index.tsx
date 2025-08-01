// src/app/events/host/[id].tsx

import { Button } from "@/components/Button";
import Poster from "@/components/Poster";
import SendInvite from "@/components/SendInvite"; // Keep SendInvite for the invite button
import { useBottomSheet } from "@/hooks/useBottomSheet";
import { HostEvent } from "@/hooks/useHostEventData";
import openMapApp from "@/lib/openMaps";
import posterPreview from "@/lib/previewPoster";
import { formatTimeToAmPm } from "@/lib/timeFormat";
import { useHostEvent } from "@/providers/HostEventProvider";
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
import WeatherCard from "../../_components/WeatherCard"; // Assuming WeatherCard is still relevant for hosts




function HostEventCloseAndActions({ id }: { id: string }) {
  const router = useRouter();
  return (
    <View className="flex-row justify-between items-center w-full px-5 pt-4 pb-2 absolute top-0 left-0 right-0 z-10">
      <TouchableOpacity
        onPress={() => router.back()}
        className="p-2 items-center bg-zinc-800/60 rounded-xl"
      >
        <Feather name="x-circle" size={26} color="white" />
      </TouchableOpacity>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => router.push(`/(app)/(tabs)/events/host/${id}/manage`)}
          className="p-2 items-center bg-zinc-800/60 rounded-xl"
        >
          <Feather name="settings" size={26} color="white" />
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => router.push(`/(app)/(tabs)/events/host/${id}/edit`)}
          className="p-2 items-center bg-zinc-800/60 rounded-xl"
        >
          <Feather name="edit-3" size={26} color="white" />
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

export default function HostEventDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { hostEventData, isLoading, isError, error } = useHostEvent();
  const { openSheet, closeSheet } = useBottomSheet();  

  const handleInvitePress = () => {
    openSheet(
      SendInvite,
      { onClose: closeSheet, eventId: id as string },
      "Invite Guests"
    );
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

  if (!hostEventData?.event) {
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
  

  // TODO: Fix type pls
  const event = hostEventData.event as HostEvent

  const eventDate = parseISO(event.date);
  const today = startOfDay(new Date());
  const tomorrow = startOfDay(new Date());
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = startOfDay(new Date());
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);


  console.log("Event Data:", event);

  const showWeatherCard =
    isSameDay(eventDate, today) ||
    isSameDay(eventDate, tomorrow) ||
    isSameDay(eventDate, dayAfterTomorrow);

  return (
    <SafeAreaView className="flex-1">
      <ImageBackground
        source={posterPreview(event.poster) as ImageSourcePropType}
        className="flex-1 w-full h-full"
        resizeMode="cover"
        blurRadius={40}
      >
        <HostEventCloseAndActions id={id as string} />
        <ScrollView className="flex flex-grow w-full h-full px-5 pt-20"> {/* Added pt-20 to account for header */}
          <View className="w-full">
            <Poster url={event.poster || ""} />
          </View>
          <View className="w-full flex flex-col justify-start items-start py-2 rounded-lg bg-zinc-800/40 px-3">
            <Text className="text-zinc-100 text-4xl font-bold w-full">
              {event.title}
            </Text>
            <Text className="text-zinc-100 text-xl">
              Hosted By {hostEventData.hostDetails?.full_name || "Unknown Host"}
            </Text>
          </View>

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
              <Feather name="map-pin" size={54} color="white" />
            </View>
            <View className="flex grow p-2 bg-zinc-800/40 rounded-lg">
              <Text className="text-zinc-100 text-xl font-bold capitalize">
                {event.address?.name?.substring(0, 28)}...
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
            onPress={handleInvitePress}
            className="bg-zinc-800 shadow-md mt-4 h-16"
          >
            <Text className="text-white text-xl font-semibold">
              Invite Guests
            </Text>
          </Button>
          <View className="h-36" />
          {/* <View className="h-16" /> */}
          
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}
