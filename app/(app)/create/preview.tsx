// @ts-nocheck
import { Feather } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ImageBackground,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Import modularized components and functions
import { Button } from "@/components/Button";
import { createEvent } from "@/lib/db/events"; // Import the event creation function
import openMapApp from "@/lib/openMaps";
import { formatTimeToAmPm } from "@/lib/timeFormat";
import { useAuth } from "@/providers/AuthProvider"; // Import useAuth
import { CreateEventFormData } from "@/schemas/eventSchema"; // Import the type
import { useQueryClient } from "@tanstack/react-query";

type WithPosterFn<T> = Omit<T, "poster"> & {
  poster: () => { uri: string } | string;
};

export default function EventPreviewScreen() {
  const [loading, setLoading] = React.useState(false); // Loading state for the submit button
  const router = useRouter();
  const { user } = useAuth(); // Get the authenticated user
  const params = useLocalSearchParams(); // Get parameters from the router
  const queryClient = useQueryClient();

  const defaultPoster = require("@/assets/images/default-banner.jpg");

  // Cast params to your form data type
  const eventData: WithPosterFn<CreateEventFormData> = {
    title: params.title as string,
    description: (params.description as string) || "",
    date: params.date as string,
    start_time: params.startTime as string,
    end_time: params.endTime as string,
    poster: params.poster as string,
    posterPreview: () => {
      const defaultPoster = require("@/assets/images/default-banner.jpg");
      let posterParam = params.poster as string;
      if (
        params.poster &&
        (posterParam.startsWith("http") || posterParam.startsWith("file"))
      ) {
        return { uri: posterParam };
      } else {
        return defaultPoster;
      }
    },
    locationName: params.locationName,
    country: params.country,
    city: params.city,
    longitude: params.longitude,
    latitude: params.latitude,
  };

  console.log("Poster preview: ",eventData.posterPreview())

  // Function to handle final submission to the database
  const handleFinalSubmit = async () => {
    if (!user?.id) {
      router.replace("/(auth)/login"); // Redirect to login if no user
      return;
    }

    setLoading(true);
    // You'll need to re-parse date and time to Date objects here if createEvent expects them.
    // For now, I'm keeping the original structure as much as possible since you only
    // asked for poster update.
    const success = await createEvent(eventData, user.id); // Assuming eventData works as-is for now
    if (success) {
      // After successful submission, navigate away
      Alert.alert(
        "Event Created!",
        "Your event has been successfully published."
      );
      // router.replace('/events'); // This was originally '/events', keeping it as is.
      queryClient.invalidateQueries({
        queryKey: ["myUpcomingEvents", user.id],
      });

      router.replace("/(app)/(tabs)/events"); // If this is the correct path for your tabs, use this.
    }
    setLoading(false);
  };

  return (
    <ImageBackground
      source={eventData.posterPreview() as ImageSourcePropType}
      className="flex-1 w-full h-full pt-14"
      resizeMode="cover"
      blurRadius={40}
    >
      <ScrollView className="flex flex-grow w-full h-full px-5">
        <View className="w-full">
          <Poster url={eventData.posterPreview().uri || ""} />
        </View>
        <View className="w-full flex flex-col justify-start items-start py-2 rounded-lg bg-zinc-800/40 px-3">
          <Text className="text-zinc-100 text-4xl font-bold w-full">
            {eventData.title}
          </Text>
        </View>
        {eventData.description && (
          <View className="flex flex-col justify-center items-center w-full px-3 py-2 rounded-lg bg-zinc-800/40 mt-2">
            <Text className="text-zinc-100 text-lg font-semibold w-full text-center">
              About
            </Text>
            <Text className="text-zinc-100/90 w-full leading-5 text-center">
              {eventData.description}
            </Text>
          </View>
        )}
        <View className="flex flex-row gap-2 mt-2">
          <View className="p-2 rounded-lg bg-black/50">
            <Feather name="clock" size={54} color="white" />
          </View>
          <View className="flex grow p-2 bg-zinc-800/40 rounded-lg">
            <Text className="text-zinc-100 text-2xl font-extrabold">
              {format(parseISO(eventData.date), "EEEE, MMMM d")}
            </Text>
            <Text className="text-zinc-100 text-lg">
              {formatTimeToAmPm(eventData.start_time)} - {formatTimeToAmPm(eventData.end_time)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className="flex flex-row gap-2 mt-2"
          onPress={() =>
            openMapApp(
              eventData.latitude || 0,
              eventData.longitude || 0,
              eventData.locationName || ""
            )
          }
        >
          <View className="p-2 rounded-lg bg-black/50">
            <Feather name="map-pin" size={54} color="white" />
          </View>
          <View className="flex grow p-2 bg-zinc-800/40 rounded-lg">
            <Text className="text-zinc-100 text-xl font-bold capitalize">
              {eventData.locationName?.substring(0, 29)}...
            </Text>
            <Text className="text-zinc-100 text-lg capitalize">
              {eventData.city}, {eventData.country}
            </Text>
          </View>
        </TouchableOpacity>
        {/* <View className="h-24" /> */}
      <View className="w-full px-5 mt-5">
        <Button
          onPress={handleFinalSubmit}
          isLoading={loading}
          variant={"primary"}
          className="mb-4"
        >
          Confirm & Create Event
        </Button>
        <TouchableOpacity onPress={() => router.back()} className="mt-2">
          <Text className="text-center text-helm-dark-red font-semibold">
            Go Back & Edit
          </Text>
        </TouchableOpacity>
      </View>
        <View className="h-6"></View>
            </ScrollView>
    </ImageBackground>
  );
}

function Poster({ url }: { url: string }) {
  return (
    <View className="w-full rounded-lg mb-4 aspect-square">
      <Image
        source={{ uri: url }}
        className="w-full h-full rounded-2xl border-2 border-zinc-100"
        resizeMode="cover"
      />
    </View>
  );
}
