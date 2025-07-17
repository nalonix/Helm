// import { router } from 'expo-router'
// import React from 'react'
// import { Text, TouchableOpacity, View } from 'react-native'

// export default function preview() {
//   return (
//     <View>
//         <TouchableOpacity
//             onPress={() => router.push('/(app)/(tabs)/events')}
//         >
//             <Text>Complete</Text>
//       </TouchableOpacity>
//     </View>
//   )
// }



// app/(app)/events/preview.tsx

import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

// Import modularized components and functions
import { Button } from '@/components/Button';
import { createEvent } from '@/lib/db/events'; // Import the event creation function
import { useAuth } from '@/providers/AuthProvider'; // Import useAuth
import { CreateEventFormData } from '@/schemas/eventSchema'; // Import the type

export default function EventPreviewScreen() {
  const [loading, setLoading] = React.useState(false); // Loading state for the submit button
  const router = useRouter();
  const { user } = useAuth(); // Get the authenticated user
  const params = useLocalSearchParams(); // Get parameters from the router

  // Cast params to your form data type
  const eventData: CreateEventFormData = {
    title: params.title as string,
    description: (params.description as string) || '',
    // date: params.date as string,
    // time: params.time as string,
    // location: params.location as string,
    // Ensure all fields from CreateEventFormData are handled
  };

  const backgroundImage = require('@/assets/images/Helm.jpg');

  // Function to handle final submission to the database
  const handleFinalSubmit = async () => {
    if(!user?.id) {
      router.replace('/(auth)/login'); // Redirect to login if no user
      return;
    }

    setLoading(true);
    const success = await createEvent(eventData, user.id);
    if (success) {
      // After successful submission, navigate away
      Alert.alert('Event Created!', 'Your event has been successfully published.');
      router.replace('/events'); // Go back to the main events list
    }
    setLoading(false);
  };

  return (
    <ImageBackground
      source={backgroundImage}
      className="flex-1 w-full h-full justify-end items-center"
      resizeMode="cover"
      blurRadius={30}
    >
      <View
        className='rounded-t-xl overflow-hidden w-full h-[90%]'
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            className="flex-1 pt-28 px-6 bg-helm-dark-background/85"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <Text className="text-3xl font-bold text-center text-helm-beige mb-8">Preview Your Event</Text>

            <ScrollView className="flex-1 mb-4">
              <Text className="text-helm-beige text-xl font-semibold mb-2">Title:</Text>
              <Text className="text-white text-lg mb-4">{eventData.title}</Text>

              {eventData.description && (
                <>
                  <Text className="text-helm-beige text-xl font-semibold mb-2">Description:</Text>
                  <Text className="text-white text-lg mb-4">{eventData.description}</Text>
                </>
              )}
{/* 
              <Text className="text-helm-beige text-xl font-semibold mb-2">Date:</Text>
              <Text className="text-white text-lg mb-4">{eventData.date}</Text>

              <Text className="text-helm-beige text-xl font-semibold mb-2">Time:</Text>
              <Text className="text-white text-lg mb-4">{eventData.time}</Text>

              <Text className="text-helm-beige text-xl font-semibold mb-2">Location:</Text>
              <Text className="text-white text-lg mb-4">{eventData.location}</Text> */}

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