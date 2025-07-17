// lib/events.ts

import { supabase } from '@/lib/supabase';
import { CreateEventFormData } from '@/schemas/eventSchema';
import { Alert } from 'react-native';

/**
 * Inserts a new event into the Supabase database.
 * @param {CreateEventFormData} data - The validated form data for the event.
 * @param {string} organizerId - The ID of the user creating the event.
 * @returns {Promise<boolean>} True if the event was created successfully, false otherwise.
 */


export async function createEvent(data: CreateEventFormData, organizerId: string): Promise<boolean> {
  console.log('Attempting to create event:', data.title, 'by organizer:', organizerId);

  try {
    const { error } = await supabase
      .from('events') // Ensure you have an 'events' table in Supabase
      .insert({
        title: data.title,
        description: data.description,
        // event_date: data.date, // Assuming your DB column is event_date
        // event_time: data.time, // Assuming your DB column is event_time
        // location: data.location,
        host: organizerId,
      });

    if (error) {
      Alert.alert('Event Creation Error', error.message);
      console.error('Supabase event creation error:', error);
      return false;
    }

    Alert.alert('Success', 'Event created successfully!');
    console.log('Event created successfully:', data.title);
    return true;
  } catch (err: any) {
    Alert.alert('Network Error', 'Could not connect to the server to create event. Please try again.');
    console.error('Unexpected event creation error:', err);
    return false;
  }
}