// src/components/QRScanner.tsx
import { useEventDetails } from '@/hooks/useEventDetails'; // Import EventDetails type
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

// Define the expected response structure for client-side feedback
interface CheckInResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  checkedInUsername?: string | null;
}

export default function QRScanner() {
  const { id: eventId } = useLocalSearchParams(); // Current event ID from the URL
  const { user: hostUser } = useAuth(); // Currently authenticated host user
  const hostUserId = hostUser?.id;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null); // To display check-in result

  const queryClient = useQueryClient();

  // Fetch event details to check ownership and date
  const { data: event, isLoading: isLoadingEvent, isError: isEventError } = useEventDetails(eventId as string);

  // Mutation to handle the client-side check-in process
  const { mutate: processCheckIn, isPending: isCheckingIn } = useMutation<CheckInResult, Error, { scannedTicketId: string }>({
    mutationFn: async ({ scannedTicketId }) => {
      if (!hostUserId) {
        return { status: 'error', message: 'Host user not authenticated.' };
      }
      if (!event) {
        return { status: 'error', message: 'Event details not loaded.' };
      }
      if (event.host !== hostUserId) {
        return { status: 'error', message: 'Unauthorized: You are not the host of this event.' };
      }

      const eventDate = new Date(event.date);
      const today = new Date();
      eventDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (eventDate.getTime() !== today.getTime()) {
        return { status: 'error', message: `Not event day: Tickets can only be scanned on ${event.date}.` };
      }

      // --- Core Client-Side Check-in Logic ---
      try {
        // 1. Fetch the RSVP record using the scanned ticket_id
        const { data: rsvpRecord, error: rsvpFetchError } = await supabase
          .from('rsvp')
          .select('id, user_id, event_id, response, checked_in') // Select necessary fields
          .eq('ticket_id', scannedTicketId)
          .single();

        if (rsvpFetchError) {
          if (rsvpFetchError.code === 'PGRST116') { // No rows found
            return { status: 'error', message: 'Invalid ticket ID.' };
          }
          console.error("Error fetching RSVP record:", rsvpFetchError);
          throw new Error(rsvpFetchError.message || 'Failed to verify ticket.');
        }

        if (!rsvpRecord) {
            return { status: 'error', message: 'Invalid ticket ID.' }; // Should be caught by PGRST116, but for safety
        }

        // 2. Verify it's the correct event for this ticket
        if (rsvpRecord.event_id !== event.id) {
          return { status: 'error', message: 'Ticket is for a different event.' };
        }

        // 3. Check RSVP status (only 'Going' or 'May Be' can check in)
        if (rsvpRecord.response !== 'Going' && rsvpRecord.response !== 'May Be') {
          // Fetch username for better feedback
          const { data: profile, error: profileError } = await supabase.from('profiles').select('username').eq('id', rsvpRecord.user_id).single();
          const username = profile?.username || 'User';
          return { status: 'warning', message: `${username} RSVP'd as "${rsvpRecord.response}". Cannot check in.`, checkedInUsername: username };
        }

        // 4. Check if already checked in
        if (rsvpRecord.checked_in) {
          const { data: profile, error: profileError } = await supabase.from('profiles').select('username').eq('id', rsvpRecord.user_id).single();
          const username = profile?.username || 'User';
          return { status: 'warning', message: `${username} already checked in.`, checkedInUsername: username };
        }

        // 5. Perform the check-in update
        const { error: updateError } = await supabase
          .from('rsvp')
          .update({
            checked_in: true,
            checked_in_at: new Date().toISOString(),
            checked_in_by: hostUserId,
          })
          .eq('id', rsvpRecord.id); // Update using the RSVP record's primary key

        if (updateError) {
          console.error("Error updating RSVP for check-in:", updateError);
          throw new Error(updateError.message || 'Failed to update check-in status.');
        }

        // Fetch username for success message
        const { data: profile, error: profileError } = await supabase.from('profiles').select('username').eq('id', rsvpRecord.user_id).single();
        const username = profile?.username || 'User';

        return { status: 'success', message: `${username} checked in successfully!`, checkedInUsername: username };

      } catch (err: any) {
        console.error("Check-in process error:", err);
        return { status: 'error', message: err.message || 'An unexpected error occurred during check-in.' };
      }
    },
    onSuccess: (result) => {
      setScanResult(result);
      // Invalidate the eventDetails query to update the host's view if needed
      queryClient.invalidateQueries({ queryKey: ['eventDetails', eventId] });
      // Invalidate a query that lists all RSVPs for this event (if you have one)
      queryClient.invalidateQueries({ queryKey: ['eventRsvps', eventId] });
    },
    onError: (err) => {
      setScanResult({
        status: 'error',
        message: err.message || 'An unexpected error occurred.',
      });
    },
  });

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    setScanned(true); // Pause scanning
    setScanResult(null); // Clear previous result
    console.log(`Scanned Data: ${data}`);

    // Trigger the mutation with the scanned data
    processCheckIn({ scannedTicketId: data });
  };

  // --- Permission Handling UI ---
  if (!permission || isLoadingEvent) {
    return (
      <View className='flex-1 flex-col justify-center items-center bg-black'>
        <ActivityIndicator size="large" color="white" />
        <Text className='text-white mt-4'>
          {isLoadingEvent ? 'Loading event details...' : 'Requesting camera permission...'}
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className='flex-1 flex-col justify-center items-center h-72 bg-red-500 p-4'>
        <Text className='text-white text-center mb-5'>
          We need your permission to show the camera.
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  if (isEventError || !event) {
    return (
      <View className='flex-1 flex-col justify-center items-center bg-red-800 p-4'>
        <Text className='text-white text-center text-lg'>
          Failed to load event details or event not found.
        </Text>
        <Text className='text-white text-center text-sm mt-2'>
          Ensure you are on a valid event host page.
        </Text>
      </View>
    );
  }

  // --- Main Scanner UI ---
  return (
    <View className='border-4 border-red-500 aspect-square flex flex-col justify-center items-center overflow-hidden rounded-lg bg-black'>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        facing='back'
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        style={styles.cameraPreview}
      />

      {/* Overlay for scan status or instructions */}
      {isCheckingIn ? (
        <View className='absolute top-1/2 -mt-10 z-10 p-4 bg-blue-700/80 rounded-lg items-center'>
          <ActivityIndicator size="small" color="white" />
          <Text className='text-white text-lg mt-2'>Checking in...</Text>
        </View>
      ) : scanResult ? (
        <View className={`absolute top-1/2 -mt-10 z-10 p-4 rounded-lg items-center ${
          scanResult.status === 'success' ? 'bg-green-700/80' :
          scanResult.status === 'warning' ? 'bg-yellow-700/80' : 'bg-red-700/80'
        }`}>
          <Text className='text-white text-xl font-bold mb-2'>{scanResult.status.toUpperCase()}</Text>
          <Text className='text-white text-base text-center'>{scanResult.message}</Text>
          {scanResult.checkedInUsername && (
            <Text className='text-white text-sm mt-2'>User: {scanResult.checkedInUsername}</Text>
          )}
          <Button title={'Scan New Ticket'} onPress={() => setScanned(false)} color="white" />
        </View>
      ) : (
        <Text className='absolute top-1/2 -mt-10 text-lg text-white bg-black/50 p-2.5 rounded-md z-10'>
          Scan A Ticket
        </Text>
      )}

      {/* Button to re-enable scanning if a result is shown */}
      {scanned && !isCheckingIn && scanResult && (
        <View className='absolute bottom-5 z-10'>
          <Button title={'Tap to Scan New'} onPress={() => {
            setScanned(false)
            setScanResult(null)
            }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cameraPreview: {
    ...StyleSheet.absoluteFillObject
  },
});