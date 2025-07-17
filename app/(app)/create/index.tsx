// import { router } from 'expo-router'
// import React from 'react'
// import { Text, TouchableOpacity, View } from 'react-native'

// export default function create() {
//   return (
//     <View>
//       <Text>Create new event</Text>
//       <TouchableOpacity
//           onPress={() => router.push('/(app)/create/preview')}
//         >
//           <Text>Preview</Text>
//       </TouchableOpacity>
//     </View>
//   )
// }





// app/(app)/events/create.tsx


import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

// Import modularized components and functions
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
// import { createEvent } from '@/lib/events'; // No longer called directly here
import { useAuth } from '@/providers/AuthProvider';
import { CreateEventFormData, createEventSchema } from '@/schemas/eventSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export default function CreateEventScreen() {
  const [loading, setLoading] = React.useState(false); // Loading state for the preview button
  const router = useRouter();
  const { user } = useAuth(); // Get the authenticated user from your AuthContext

  const defaultImage = require('@/assets/images/default-poster.jpg');
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset, // Keep reset for potential use after final submission from preview
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      description: '',
      // date: '',
      // time: '',
      // location: '',
    },
  });

  // This function now handles navigating to the preview page
  const onPreview = async (data: CreateEventFormData) => {
    if (!user?.id) {
      Alert.alert('Authentication Required', 'You must be logged in to create an event.');
      router.replace('/(auth)/login'); // Redirect to login if no user
      return;
    }

    setLoading(true); 

    router.push({
      pathname: '/(app)/create/preview',
      params: {
        // Stringify complex objects if necessary, but simple strings/numbers are fine
        poster: data.poster || defaultImage,
        title: data.title,
        description: data.description || '', // Ensure optional fields are handled
        // date: data.date,
        // time: data.time,
        // location: data.location,
        // Pass any other fields from CreateEventFormData
      },
    });
    setLoading(false); // Reset loading state after navigation attempt
  };

  // Image picker handler
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <ImageBackground
      source={selectedImage ? { uri: selectedImage } : defaultImage}
      className="flex-1 w-full h-full justify-end items-center"
      resizeMode="cover"
      blurRadius={50}
    >
      <View
        className='rounded-t-3xl overflow-hidden w-full h-[71%]'
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            className="flex-1 pt-28 px-6"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >

            {/* Image Selector Square Preview */}
            <View className="items-center mb-6">
              <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                <View style={{ width: 120, height: 120, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#fff', backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' }}>
                  <Image
                    source={selectedImage ? { uri: selectedImage } : defaultImage}
                    style={{ width: 120, height: 120, resizeMode: 'cover' }}
                  />
                </View>
                <Text className="text-xs text-helm-beige mt-2 text-center">Tap to select event image</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-3xl font-bold text-center text-helm-beige mb-8">Create New Event</Text>

            <FormInput
              control={control}
              name="title"
              label="Event Title"
              placeholder="Summer Music Festival"
              autoCapitalize="sentences"
              errors={errors}
              className="bg-white/10 border-white/20 rounded-xl px-6"
            />

            <FormInput
              control={control}
              name="description"
              label="Description (Optional)"
              placeholder="Tell us about your event..."
              autoCapitalize="sentences"
              errors={errors}
              className="bg-white/10 border-white/20 rounded-xl px-6"
            />
{/* 
            <FormInput
              control={control}
              name="date"
              label="Date"
              placeholder="YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
              errors={errors}
              className="bg-white/10 border-white/20 rounded-xl px-6"
            /> */}

            {/* <FormInput
              control={control}
              name="time"
              label="Time"
              placeholder="HH:MM (e.g., 18:00)"
              keyboardType="numbers-and-punctuation"
              errors={errors}
              className="bg-white/10 border-white/20 rounded-xl px-6"
            /> */}

            {/* <FormInput
              control={control}
              name="location"
              label="Location"
              placeholder="Central Park, New York"
              autoCapitalize="words"
              errors={errors}
              className="bg-white/10 border-white/20 rounded-xl px-6"
            /> */}

            {/* Preview Button */}
            <Button
              onPress={handleSubmit(onPreview)} // Call onPreview on submit
              isLoading={loading}
              variant={"primary"}
              className="mb-4"
            >
              Preview Event
            </Button>

            <View className="flex-row justify-center mt-2">
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-helm-dark-red font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
    </ImageBackground>
  );
}







