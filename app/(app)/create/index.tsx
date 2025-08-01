// app/(app)/events/create.tsx

import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
// import { ScrollView } from "react-native-gesture-handler"; // Removed this import
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"; // Imported the library

import { Feather } from "@expo/vector-icons";

// Import modularized components and functions
import { Button } from "@/components/Button";
import { FormInput } from "@/components/FormInput";
// import { createEvent } from '@/lib/events';
import LocationInput from "@/components/LocationInput";
import { useBottomSheet } from "@/hooks/useBottomSheet";
import { useAuth } from "@/providers/AuthProvider";
import { CreateEventFormData, createEventSchema } from "@/schemas/eventSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function CreateEventScreen() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const defaultImage = require("@/assets/images/default-banner.jpg");
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const [date, setDate] = React.useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [time, setTime] = React.useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [endTime, setEndTime] = React.useState<Date | null>(null);
  const [showEndTimePicker, setShowEndTimePicker] = React.useState(false);

  const [selectedLocation, setSelectedLocation] = React.useState<{
    name: string;
    City: string;
    Country: string;
    latitude: number;
    longitude: number;
    type: string;
  } | null>(null);

  const { openSheet, closeSheet } = useBottomSheet();

  const handleLocationInput = () => {
    openSheet(
      LocationInput,
      {
        name: "location",
        onClose: closeSheet,
        onLocationSelect: (place: {
          name: string;
          City: string;
          Country: string;
          latitude: number;
          longitude: number;
          type: string;
        }) => {
          setSelectedLocation(place);
          setValue("locationName", place.name);
          setValue("city", place.City);
          setValue("country", place.Country);
          setValue("latitude", place.latitude);
          setValue("longitude", place.longitude);
        },
      },
      "Select Location"
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setValue("poster", result.assets[0].uri);
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      poster: defaultImage.uri,
      title: "",
      description: "",
      date: "",
      start_time: "",
      end_time: "",
      locationName: "",
      city: "",
      country: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  const onPreview = async (data: CreateEventFormData) => {
    if (!user?.id) {
      Alert.alert(
        "Authentication Required",
        "You must be logged in to create an event."
      );
      router.replace("/(auth)/login");
      return;
    }

    setLoading(true);
    console.log("👉👉: ", data);

    router.push({
      pathname: "/(app)/create/preview",
      params: {
        poster: data.poster,
        title: data.title,
        description: data.description || "",
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time || "",
        locationName: data.locationName,
        city: data.city || "",
        country: data.country || "",
        latitude: data.latitude?.toString() || "",
        longitude: data.longitude?.toString() || "",
      },
    });
    setLoading(false);
  };

  const onDateChange = (event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      setDate(selected);
      setValue("date", selected.toISOString().split("T")[0]);
    }
  };

  const onTimeChange = (event: any, selected?: Date) => {
    setShowTimePicker(false);
    if (selected) {

      setTime(selected);

      setValue(
        "start_time",
        selected.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
        })
      );

    }
  };

  const onEndTimeChange = (event: any, selected?: Date) => {
    setShowEndTimePicker(false);
    if (selected) {
            console.log(
        selected?.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
        })
      );
      const startDate = new Date(date || new Date());
      const startTimeParts = (
        time?.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
        }) || "00:00"
      ).split(":");
      startDate.setHours(
        parseInt(startTimeParts[0]),
        parseInt(startTimeParts[1]),
        0,
        0
      );

      const endDate = new Date(date || new Date());
      endDate.setHours(selected.getHours(), selected.getMinutes(), 0, 0);

      if (endDate < startDate) {
        Alert.alert("Invalid Time", "End time cannot be before start time.");
        return;
      }

      setEndTime(selected);
      setValue(
        "end_time",
        selected.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
        })
      );
    }
  };

  return (
    <ImageBackground
      source={selectedImage ? { uri: selectedImage } : defaultImage}
      className="flex-1 w-full h-full justify-end items-center"
      resizeMode="cover"
      blurRadius={20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        {/* The single KeyboardAwareScrollView now handles all scrolling and keyboard behavior */}
        <KeyboardAwareScrollView
          className="flex-1 w-full bg-zinc-100/5 pt-28 px-6"
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === "ios" ? 150 : 110} // Increased scroll height for the longer form
        >
          {/* Image Selector Square Preview */}
          <View className="w-full mb-6 items-center aspect-square overflow-hidden rounded-md">
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.8}
              className="w-full h-full"
            >
              <View className="border-2 border-white/60 rounded-lg overflow-hidden bg-black/20 justify-center items-center">
                <Image
                  source={selectedImage ? { uri: selectedImage } : defaultImage}
                  className="w-full h-full"
                />
              </View>
              <Text className="text-xs text-helm-beige mt-2 text-center">
                Tap to select event image
              </Text>
            </TouchableOpacity>
          </View>
          {/* Form inputs  */}
          <View>
            <FormInput
              control={control}
              name="title"
              placeholder="Music Festival"
              placeholderTextColor="rgba(212, 212, 212, 0.83)"
              autoCapitalize="words"
              errors={errors}
              className="px-4 py-5 mb-0 text-white/90 text-3xl text-center font-bold bg-black/30 border-gray-400/30 rounded-2xl"
              multiline={true}
            />
            <FormInput
              control={control}
              name="description"
              placeholder="Add a description"
              placeholderTextColor="rgba(212, 212, 212, 0.83)"
              autoCapitalize="sentences"
              errors={errors}
              className="px-3 py-5 text-center bg-black/30 border-gray-400/30 rounded-xl"
              multiline={true}
            />
          </View>
          {/* Location Input */}
          <TouchableOpacity
            onPress={handleLocationInput}
            className="w-full py-3 px-2 bg-black/30 rounded-xl mt-2 border border-gray-400/30 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Feather
              name="map-pin"
              size={20}
              color="#a3a3a3"
              className="mr-2"
            />
            <Text className="text-center text-white/80 font-semibold text-wrap">
              {selectedLocation ? selectedLocation.name : "Select Location"}   
            </Text>
          </TouchableOpacity>
          {/* Date Picker */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="w-full py-3 bg-black/30 rounded-xl my-3 border border-gray-400/30 flex-col items-center justify-center"
            activeOpacity={0.8}
          >
            <Feather
              name="calendar"
              size={20}
              color="#c2c2c2"
              className="mb-1"
            />
            <Text className="text-center text-white/80 font-semibold">
              {date ? date.toLocaleDateString() : "Date"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
          {/* Start Time Picker */}
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="w-full py-3 bg-black/30 rounded-t-xl border border-gray-400/30 border-t-0 flex-col items-center justify-center"
            activeOpacity={0.8}
          >
            <Feather name="clock" size={20} color="#c2c2c2" className="mb-1" /> 
            <Text className="text-center text-white/90 font-semibold">
              {time
                ? time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hourCycle: "h23",
                  })
                : "Start Time"}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time || new Date()}
              mode="time"
              is24Hour={true}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onTimeChange}
            />
          )}
          {/* End Time Picker */}
          <TouchableOpacity
            onPress={() => setShowEndTimePicker(true)}
            className="w-full py-3 bg-black/30 rounded-b-xl border border-gray-400/30 border-t-0 flex-col items-center justify-center"
            activeOpacity={0.8}
          >
            <Feather name="clock" size={20} color="#c2c2c2" className="mb-1" /> 
            <Text className="text-center text-white/90 font-semibold">
              {endTime
                ? endTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hourCycle: "h23",
                  })
                : "End Time"}
            </Text>
          </TouchableOpacity>
          {showEndTimePicker && (
            <DateTimePicker
              value={endTime || time || new Date()}
              mode="time"
              is24Hour={true}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onEndTimeChange}
              minimumDate={time ? new Date(time) : undefined}
            />
          )}
          {/* Preview Button */}
          <View className="mt-2">
            <Button
              onPress={handleSubmit(onPreview)}
              isLoading={loading}
              variant={"primary"}
              className="mb-4 mt-4"
            >
              Preview Event
            </Button>
            <Button
              onPress={() => router.push("/(app)/(tabs)/events")}
              variant={"secondary"}
              className="bg-zinc-800"
            >
              <Text className="text-helm-orange-red">Cancel</Text>
            </Button>
            <View className="h-48"></View>
          </View>
          {/* Added a bottom space to ensure the last button isn't immediately at the bottom edge */}
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}
