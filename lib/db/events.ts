// lib/events.ts

import { supabase } from '@/lib/supabase';
import { CreateEventFormData } from '@/schemas/eventSchema';
import { decode } from 'base64-arraybuffer'; // Import decode for converting base64 to ArrayBuffer
import * as FileSystem from 'expo-file-system'; // Import FileSystem for reading file as base64
import { Alert } from 'react-native';

/**
 * Inserts a new event into the Supabase database with address as JSON attribute and uploads poster.
 * @param {CreateEventFormData} data - The validated form data for the event.
 * @param {string} organizerId - The ID of the user creating the event.
 * @returns {Promise<boolean>} True if the event was created successfully, false otherwise.
 */
export async function createEvent(data: CreateEventFormData, organizerId: string): Promise<boolean> {

  let posterUrl: string | undefined = undefined;

  try {
    // --- 1. Handle Poster Upload ---
    // Check if a new image was selected (not the default local image)
    // Assuming defaultImage.uri is a local asset path, not a network URL
    if (data.poster && data.poster?.startsWith('file:///')) { // Check if it's a local file URI (Expo's asset URI)
      // Read the image file as base64
      const base64 = await FileSystem.readAsStringAsync(data.poster, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log(base64)

      // Generate a unique file name
      const fileExt = data.poster.split('.').pop();
      const fileName = `${organizerId}-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`; // Path within the 'poster' bucket

      // Upload the image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posters') // Your bucket name
        .upload(filePath, decode(base64), {
          contentType: `image/${fileExt}`,
          upsert: false, // Set to true if you want to overwrite existing files with the same name
        });

      if (uploadError) {
        Alert.alert('Image Upload Error', uploadError.message);
        console.error('Supabase image upload error:', uploadError);
        return false;
      }

      // Get the public URL of the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('posters')
        .getPublicUrl(filePath);

      if (publicUrlData) {
        posterUrl = publicUrlData.publicUrl;
        console.log('Poster uploaded successfully:', posterUrl);
      } else {
        Alert.alert('Image URL Error', 'Could not get public URL for uploaded image.');
        return false;
      }
    } else {
      // If no new image selected or it's the default local image,
      // you might want to handle this differently:
      // - If you want to store default image, upload it once and use its URL.
      // - If default image means no poster, set posterUrl to null.
      // For now, assuming if it's not a local file URI, it's already a valid URL or null.
      console.log("not a file");
      
      posterUrl = data.poster;
    }

    // --- 2. Create Address JSON Object ---
    const addressJson = {
      name: data.locationName,
      city: data.city,
      country: data.country,
      longitude: data.longitude,
      latitude: data.latitude,
    };

    // --- 3. Insert Event Data into Supabase Database ---
    const { error: insertError } = await supabase
      .from('events')
      .insert({
        title: data.title,
        description: data.description,
        date: data.date,
        start_time: data.startTime,
        end_time: data.endTime, // Assuming end_time is the same as start_time for now
        poster: posterUrl, // Use the uploaded poster URL
        host: organizerId,
        address: addressJson,
      });

    if (insertError) {
      Alert.alert('Event Creation Error', insertError.message);
      console.error('Supabase event creation error:', insertError);
      return false;
    }

    Alert.alert('Success', 'Event created successfully!');
    console.log('Event created successfully:', data.title);
    return true;
  } catch (err: any) {
    Alert.alert('Network Error', 'An unexpected error occurred while creating the event. Please try again.');
    console.error('Unexpected event creation error:', err);
    return false;
  }
}
