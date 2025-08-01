import { addNotification } from '@/lib/db/notifications';
import { supabase } from '@/lib/supabase'; // Adjust this import path as needed
import { useAuth } from '@/providers/AuthProvider'; // Assuming your AuthProvider
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Define the props for this component
interface RSVPResponseProps {
  eventId: string;
  hostId: string;
  rsvpStatus: 'Going' | 'May Be' | 'Not Going' | null; // The specific status for this form
  onSuccess: () => void; // Callback to close the sheet after successful RSVP
}



// Define the payload for inserting into the 'rsvp' table
interface RsvpPayload {
  user_id: string;
  event_id: string;
  response: 'Going' | 'May Be' | 'Not Going' | null;
  message?: string | null; // Optional message
}

// --- Supabase Insertion Function ---
const insertRsvpRecord = async (payload: RsvpPayload) => {
  const { data, error } = await supabase
    .from('rsvp')
    .upsert(
      {
        user_id: payload.user_id,
        event_id: payload.event_id,
        response: payload.response,
        message: payload.message,
      },
      {
        onConflict: 'user_id, event_id', 
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Supabase RSVP insertion/update error:', error);
    throw new Error(error.message || 'Failed to submit RSVP');
  }

  return data;
};

// --- RSVPResponse Component ---
export default function RSVPResponse({ eventId, hostId, rsvpStatus, onSuccess }: RSVPResponseProps) {
  const { user } = useAuth(); // Get the current user from your AuthContext
  const userId = user?.id; // The ID of the user submitting the RSVP

  const [message, setMessage] = useState<string>('');
  const queryClient = useQueryClient(); // For cache invalidation

  
  // Mutation for submitting the RSVP
  const {
    mutate: submitRsvp,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: insertRsvpRecord,
    onSuccess: (data) => {
      console.log('RSVP submitted successfully:', data);
      Alert.alert('Success', `Your RSVP for "${rsvpStatus}" has been recorded!`);
      // Invalidate relevant queries to refetch and update UI across the app
      // Example: Invalidate a query that shows the user's RSVP status for this event
      queryClient.invalidateQueries({ queryKey: ['userRsvpStatus', userId, eventId] });
      // Invalidate the overall event details query if it includes RSVP counts
      queryClient.invalidateQueries({ queryKey: ['eventDetails', eventId] });
      // Invalidate fetched events
      queryClient.invalidateQueries({ queryKey: ['myUpcomingEvents', userId] });
      // Send notification
      addNotification({
        event_id: eventId,
        user_id: hostId,
        message: `@${user?.username} RSVP Update: ${rsvpStatus}`,
        type: 'rsvpupdate'
      })
      // Clear input
      setMessage('')


      onSuccess(); // Call the parent's success callback to close the sheet
    },
    onError: (err) => {
      Alert.alert('Error', `Failed to submit RSVP: ${err.message}`);
    },
  });

  const handleSubmit = () => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to RSVP.');
      return;
    }
    if (!eventId) {
      Alert.alert('Error', 'Event ID is missing. Cannot submit RSVP.');
      return;
    }

    submitRsvp({
        user_id: userId,
        event_id: eventId,
        response: rsvpStatus,
        message: message.trim() || null,
    });


  };

  return (
    <View className='flex-1 w-full'>
      <Text className='text-lg font-semibold mb-3'>
        Message (Optional):
      </Text>
      <TextInput
        className='flex flex-grow border border-gray-300 rounded-lg p-3 text-base mb-4 min-h-[80px] text-top'
        placeholder="Add a message (e.g., 'Looking forward to it!', 'Sorry I can't make it.')"
        value={message}
        onChangeText={setMessage}
        multiline={true} // Allow multiple lines
        textAlignVertical="top" // Align text to the top for multiline
      />

      <TouchableOpacity
        onPress={handleSubmit}
        className='bg-helm-orange-red p-4 rounded-lg items-center'
        disabled={isPending || !userId || !eventId} // Disable while submitting or if data is missing
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className='text-white text-lg font-bold'>Confirm</Text>
        )}
      </TouchableOpacity>

      {isError && (
        <Text className='text-red-500 text-center mt-3'>
          Error: {error?.message || 'Something went wrong.'}
        </Text>
      )}
    </View>
  );
}