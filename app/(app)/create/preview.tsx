// @ts-nocheck
import { useLocalSearchParams, useRouter } from 'expo-router';

import React from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

// Import modularized components and functions
import { Button } from '@/components/Button';
import { createEvent } from '@/lib/db/events'; // Import the event creation function
import { useAuth } from '@/providers/AuthProvider'; // Import useAuth
import { CreateEventFormData } from '@/schemas/eventSchema'; // Import the type
import { useQueryClient } from '@tanstack/react-query';



type WithPosterFn<T> = Omit<T, 'poster'> & {
poster: () => { uri: string } | string;
};

export default function EventPreviewScreen() {
  const [loading, setLoading] = React.useState(false); // Loading state for the submit button
  const router = useRouter();
  const { user } = useAuth(); // Get the authenticated user
  const params = useLocalSearchParams(); // Get parameters from the router
  const queryClient = useQueryClient()



  const defaultPoster = require('@/assets/images/default-poster.jpg');

  // Cast params to your form data type
  const eventData: WithPosterFn<CreateEventFormData> = {
    title: params.title as string,
    description: (params.description as string) || '',
    date: params.date as string,
    time: params.time as string,
    poster: () => {
      const defaultPoster = require('@/assets/images/default-poster.jpg');
      let posterParam = params.poster as string
      if (params.poster && (posterParam.startsWith('http') || posterParam.startsWith('file'))){
        return { uri: posterParam}
      } else{
        return defaultPoster
      }
    },
  };


  // Function to handle final submission to the database
  const handleFinalSubmit = async () => {
    if(!user?.id) {
      router.replace('/(auth)/login'); // Redirect to login if no user
      return;
    }

    setLoading(true);
    // You'll need to re-parse date and time to Date objects here if createEvent expects them.
    // For now, I'm keeping the original structure as much as possible since you only
    // asked for poster update.
    const success = await createEvent(eventData, user.id); // Assuming eventData works as-is for now
    if (success) {
      // After successful submission, navigate away
      Alert.alert('Event Created!', 'Your event has been successfully published.');
      // router.replace('/events'); // This was originally '/events', keeping it as is.
      queryClient.invalidateQueries({ queryKey: ['myUpcomingEvents', user.id] });

      router.replace('/(app)/(tabs)/events'); // If this is the correct path for your tabs, use this.
      
    }
    setLoading(false);
  };

  return (
    <ImageBackground
      source={eventData.poster() as ImageSourcePropType}
      className="flex-1 w-full h-full justify-end items-center"
      resizeMode="cover"
      blurRadius={30}
    >
      {/* ONLY ADDED THIS OVERLAY FOR READABILITY (this is a good practice, but remove if you want 100% minimal) */}
      <View className="absolute inset-0 bg-black/50" />

      <View
        className='rounded-t-xl overflow-hidden w-full h-[90%]'
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            className="flex-1 pt-28 px-6 bg-helm-dark-background/85"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >

            <ScrollView className="flex-1 mb-4 border border-red-500">
              {/* ONLY ADDED THIS BLOCK: Display the non-blurred poster within the content area */}
              <View className="w-full mb-6 aspect-square border-2 border-white/60 rounded-lg overflow-hidden">
              {/* @ts-ignore */}
                <Image
                    source={eventData.poster() as ImageSourcePropType}
                    className="w-full h-full"
                  />
              </View>


              <Text className="text-helm-beige text-xl font-semibold mb-2">Date:</Text>
              <Text className="text-white text-lg mb-4">{eventData.date}</Text>

              <Text className="text-helm-beige text-xl font-semibold mb-2">Title:</Text>
              <Text className="text-white text-lg mb-4">{eventData.title}</Text>

              <Text className="text-helm-beige text-xl font-semibold mb-2">Title:</Text>
              <Text className="text-white text-lg mb-4">{eventData.title}</Text>

              {eventData.description && (
                <>
                  <Text className="text-helm-beige text-xl font-semibold mb-2">Description:</Text>
                  <Text className="text-white text-lg mb-4">{eventData.description}</Text>
                </>
              )}
              {/* Keep these commented out as you had them */}
              {/*
              <Text className="text-helm-beige text-xl font-semibold mb-2">Date:</Text>
              <Text className="text-white text-lg mb-4">{eventData.date}</Text>

              <Text className="text-helm-beige text-xl font-semibold mb-2">Time:</Text>
              <Text className="text-white text-lg mb-4">{eventData.time}</Text>

              <Text className="text-helm-beige text-xl font-semibold mb-2">Location:</Text>
              <Text className="text-white text-lg mb-4">{eventData.location}</Text>
              */}

              {/* Add other previewed fields here */}
            </ScrollView>

            {/* Submit Button */}
            <View className="fixed bottom-28">
              <Button
                onPress={handleFinalSubmit}
                isLoading={loading}
                variant={"primary"}
                className="mb-4"
              >
                Confirm & Create Event
              </Button>

              {/* Go Back / Edit Button */}
              <View className="flex-row justify-center mt-2">
                <TouchableOpacity onPress={() => router.back()}>
                  <Text className="text-helm-dark-red font-semibold">Go Back & Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
    </ImageBackground>
  );
}