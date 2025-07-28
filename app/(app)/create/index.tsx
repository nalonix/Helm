// app/(app)/events/create.tsx


import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

import { Feather } from "@expo/vector-icons";


// Import modularized components and functions
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
// import { createEvent } from '@/lib/events'; // No longer called directly here
import LocationInput from '@/components/LocationInput';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useAuth } from '@/providers/AuthProvider';
import { CreateEventFormData, createEventSchema } from '@/schemas/eventSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ScrollView } from 'react-native-gesture-handler';


export default function CreateEventScreen() {
  const [loading, setLoading] = React.useState(false); // Loading state for the preview button
  const router = useRouter();
  const { user } = useAuth(); // Get the authenticated user from your AuthContext
  
  const defaultImage = require('@/assets/images/default-poster.jpg');
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  
  const [date, setDate] = React.useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [time, setTime] = React.useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [selectedLocation, setSelectedLocation] = React.useState<{
    name: string;
    City: string;
    Country: string;
    latitude: number;
    longitude: number;
    type: string;
  } | null>(null);
  // Date picker handler
  // const onDateChange = (event: any, selected?: Date) => {
  //   setShowDatePicker(false);
  //   if (selected) setDate(selected);
  // };
  
  // // Time picker handler
  // const onTimeChange = (event: any, selected?: Date) => {
  //   setShowTimePicker(false);
  //   if (selected) setTime(selected);
  // };
  
  const { openSheet, closeSheet } = useBottomSheet();

  const handleLocationInput = () => {
    openSheet(
      LocationInput, 
      { 
        name: 'location', 
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
          setValue('locationName', place.name);
          setValue('city', place.City);
          setValue('country', place.Country);
          setValue('latitude', place.latitude);
          setValue('longitude', place.longitude);

        }
      }, 
      'Select Location' 
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
      setValue('poster', result.assets[0].uri); // Set the poster field in the form
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
      title: '',
      description: '',
      date: '',
      time: '',
      locationName: '',
      city: '',
      country: '',
      latitude: undefined,
      longitude: undefined,
    },
  });

  // if(errors){
  //   console.error('Form errors:', errors);
  // }

  // This function now handles navigating to the preview page
  const onPreview = async (data: CreateEventFormData) => {
    if (!user?.id) {
      Alert.alert('Authentication Required', 'You must be logged in to create an event.');
      router.replace('/(auth)/login'); // Redirect to login if no user
      return;
    }

    setLoading(true);
    
    console.log("👉👉: ",data)

    router.push({
      pathname: '/(app)/create/preview',
      params: {
        // Stringify complex objects if necessary, but simple strings/numbers are fine
        poster: data.poster,
        title: data.title,
        description: data.description || '', // Ensure optional fields are handled
        date: data.date,
        time: data.time,
        locationName: data.locationName,
        city: data.city || '',
        country: data.country || '',
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
        // Pass any other fields from CreateEventFormData
      },
    });
    setLoading(false); // Reset loading state after navigation attempt
  };

  // Date picker handler
  const onDateChange = (event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      setDate(selected);
      setValue('date', selected.toISOString().split('T')[0]); // e.g. '2025-07-17'
    }
  };

  // Time picker handler
  const onTimeChange = (event: any, selected?: Date) => {
    setShowTimePicker(false);
    if (selected) {
      console.log(selected?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }))
      setTime(selected);

      setValue('time', selected.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }));
    }
  };


  return (
    <ImageBackground
      source={selectedImage ? { uri: selectedImage } : defaultImage}
      className="flex-1 w-full h-full justify-end items-center"
      resizeMode="cover"
      blurRadius={20}
    >
      <ScrollView
        className='flex-1 w-full h-full bg-zinc-100/5'
        // className='flex-1 rounded-t-3xl overflow-hidden w-full h-full bg-zinc-100/5'
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            className="flex-1 pt-28 px-6"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >

            {/* Image Selector Square Preview */}
            <View className="w-full mb-6 items-center aspect-square overflow-hidden rounded-md">
              <TouchableOpacity onPress={pickImage} activeOpacity={0.8} className='w-full h-full'>
                <View className='border-2 border-white/60 rounded-lg overflow-hidden bg-black/20 justify-center items-center'>
                  <Image
                    source={selectedImage ? { uri: selectedImage } : defaultImage}
                    className='w-full h-full'
                  />
                </View>
                <Text className="text-xs text-helm-beige mt-2 text-center">Tap to select event image</Text>
              </TouchableOpacity>
            </View>


            {/* Form inputs  */}
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
          <Feather name="map-pin" size={20} color="#a3a3a3" className="mr-2" />
          <Text className="text-center text-white/60 font-semibold text-wrap">
            {selectedLocation ? selectedLocation.name : 'Select Location'}
          </Text>
        </TouchableOpacity>


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

            {/* Date Picker */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="w-full py-3 bg-black/30 rounded-t-xl mt-2 border border-gray-400/30 flex-col items-center justify-center"
              activeOpacity={0.8}
            >
              <Feather name="calendar" size={20} color="#a3a3a3" className="mb-1" />
              <Text className="text-center text-white/60 font-semibold">
                {date ? date.toLocaleDateString() : 'Date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            {/* Time Picker */}
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="w-full py-3 bg-black/30 rounded-b-xl border border-gray-400/30 border-t-0 flex-col items-center justify-center"
              activeOpacity={0.8}
            >
              <Feather name="clock" size={20} color="#a3a3a3" className="mb-1"/>
              <Text className="text-center text-white/60 font-semibold">
                {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time'}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={time || new Date()}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
              />
            )}
{/* 
            <View className='h-72'>

            </View> */}

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
              <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/events')}>
                <Text className="text-helm-dark-red font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
            <View className='h-20'></View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </ScrollView>
    </ImageBackground>
  );
}




