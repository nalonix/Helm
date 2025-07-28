// src/components/QRScanner.tsx
// This version performs all check-in logic directly on the client-side.
// WARNING: This approach has SIGNIFICANT SECURITY IMPLICATIONS regarding Row Level Security (RLS).
// For a production application, it is STRONGLY RECOMMENDED to use a Supabase RPC function (PostgreSQL function)
// to handle check-in logic securely on the backend, as discussed previously.
// Direct client-side updates will likely require very permissive (and insecure) RLS policies
// on your 'rsvp' table (e.g., allowing any authenticated user to update any RSVP).

import { TICKET_PREFIX } from '@/constants';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useHostEvent } from '@/providers/HostEventProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

// Define the expected response structure for client-side feedback
interface CheckInResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  username?: string | null;
  event_title?: string | null;
}

// Define the expected prefix for your app's QR codes

export default function QRScanner() {
  // Get event data and loading/error states from the HostEventProvider context
  const { hostEventData, isLoading, isError, error } = useHostEvent();
  const event = hostEventData?.event; // Extract the event object
  const eventId = event?.id; // Get eventId directly from the context's event object

  const { user: hostUser } = useAuth(); // Currently authenticated host user
  const hostUserId = hostUser?.id;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null);

  const queryClient = useQueryClient();

  // Mutation to handle the client-side check-in process
  const { mutate: processCheckIn, isPending: isCheckingIn } = useMutation<CheckInResult, Error, { scannedTicketId: string }>({
    mutationFn: async ({ scannedTicketId }) => {
      // --- Client-side Pre-checks ---
      // These checks are now critical as they are the primary gate before DB interaction.
      if (!hostUserId) {
        throw new Error("Host user not authenticated. Please log in.");
      }
      if (!event) {
        // This should ideally be caught by the HostEventProvider's loading/error state
        // but included for robustness within the mutation.
        throw new Error("Event data not loaded. Cannot proceed with check-in.");
      }

      // Check if the scanning host is the owner of THIS event
      if (event.host !== hostUserId) {
        return { status: 'error', message: 'Unauthorized: You are not the host of this event.' };
      }

      // Check if it's the event date
      const eventDate = new Date(event.date);
      const today = new Date();
      eventDate.setHours(0, 0, 0, 0); // Normalize to start of day
      today.setHours(0, 0, 0, 0); // Normalize to start of day

      if (eventDate.getTime() !== today.getTime()) {
        return { status: 'error', message: `Not event day: Tickets can only be scanned on ${event.date}.` };
      }

      // --- Core Client-Side Check-in Logic (Direct Supabase Calls) ---
      try {
        // 1. Fetch the RSVP record using the scanned ticket_id
        const { data: rsvpRecord, error: rsvpFetchError } = await supabase
          .from('rsvp')
          .select('id, user_id, event_id, response, checked_in') // Select necessary fields
          .eq('ticket_id', scannedTicketId)
          .single();

        console.log("👉👉👉: ", rsvpRecord)

        if (rsvpFetchError) {
          if (rsvpFetchError.code === 'PGRST116') { // No rows found
            return { status: 'error', message: 'Invalid ticket ID.' };
          }
          console.error("Error fetching RSVP record:", rsvpFetchError);
          throw new Error(rsvpFetchError.message || 'Failed to verify ticket.');
        }

        if (!rsvpRecord) {
          // This case should theoretically be covered by PGRST116, but added for explicit safety.
          return { status: 'error', message: 'Invalid ticket ID.' };
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
          return { status: 'warning', message: `${username} RSVP'd as "${rsvpRecord.response}". Cannot check in.`, username: username };
        }

        // 4. Check if already checked in
        if (rsvpRecord.checked_in) {
          const { data: profile, error: profileError } = await supabase.from('profiles').select('username').eq('id', rsvpRecord.user_id).single();
          const username = profile?.username || 'User';
          return { status: 'warning', message: `${username} already checked in.`, username: username };
        }

        // 5. Perform the check-in update directly
        // IMPORTANT: Your RLS policy on 'rsvp' table MUST allow the 'hostUserId'
        // to UPDATE other users' RSVP records for this to work.
        // A common (but insecure) RLS policy for this would be:
        // FOR UPDATE TO authenticated USING (TRUE); -- This is very insecure!
        // A more secure RLS would check if auth.uid() is the event.host for the rsvp's event_id.
        const { data, error: updateError } = await supabase
          .from('rsvp')
          .update({
            checked_in: true,
            checked_in_at: new Date().toISOString(), // Use ISO string for TIMESTAMPTZ
            checked_in_by: hostUserId,
          })
          .eq('id', rsvpRecord.id); // Update using the RSVP record's primary key

          console.log("Updated data: 👉👉👉",data)

        if (updateError) {
          console.error("Error updating RSVP for check-in:", updateError);
          throw new Error(updateError.message || 'Failed to update check-in status.');
        }

        // Fetch username for success message (if not already fetched)
        const { data: profile, error: profileError } = await supabase.from('profiles').select('username').eq('id', rsvpRecord.user_id).single();
        const username = profile?.username || 'User';

        return { status: 'success', message: `${username} checked in successfully!`, username: username, event_title: event.title };

      } catch (err: any) {
        console.error("Check-in process error:", err);
        return { status: 'error', message: err.message || 'An unexpected error occurred during check-in.' };
      }
    },
    onSuccess: (result) => {
      setScanResult(result);
      // Invalidate the 'hostEventData' query to trigger a refetch in the provider,
      // which will then update all consuming components (like RSVP/Guest lists).
      queryClient.invalidateQueries({ queryKey: ['hostEventData', eventId] });
    },
    onError: (err) => {
      setScanResult({
        status: 'error',
        message: err.message || 'An unexpected error occurred.',
        username: null, event_title: null,
      });
    },
  });

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    setScanned(true); // Pause scanning
    setScanResult(null); // Clear previous result
    console.log(`Scanned Data: ${data}`);

    // --- NEW: Prefix Check ---
    if (!data.startsWith(TICKET_PREFIX)) {
      setScanResult({
        status: 'error',
        message: 'Invalid QR code: Not an AHelm ticket.',
        username: null,
        event_title: null,
      });
      setScanned(false); // Allow re-scan immediately for invalid format
      return;
    }

    // Extract the actual ticket ID by removing the prefix
    const ticketId = data.substring(TICKET_PREFIX.length);

    // Basic client-side checks before calling backend
    if (!hostUserId) {
      setScanResult({ status: 'error', message: 'You must be logged in to scan tickets.' });
      setScanned(false); // Allow re-scan immediately if auth issue
      return;
    }
    if (!event) { // Check if event data is available from context
      setScanResult({ status: 'error', message: 'Event data not loaded. Cannot proceed.' });
      setScanned(false); // Allow re-scan immediately if data issue
      return;
    }

    // Trigger the mutation with the extracted ticket ID
    processCheckIn({ scannedTicketId: ticketId });
  };

  // --- Loading/Error UI from Context ---
  // This component will show its own loading/error if hostEventData isn't ready
  // or if there's an error from the provider.
  if (isLoading) {
    return (
      <View className='flex-1 flex-col justify-center items-center bg-black'>
        <ActivityIndicator size="large" color="white" />
        <Text className='text-white mt-4'>Loading event data...</Text>
      </View>
    );
  }

  if (isError || !event) { // If provider reported an error or event is null
    return (
      <View className='flex-1 flex-col justify-center items-center bg-red-800 p-4'>
        <Text className='text-white text-center text-lg'>
          {isError ? `Error: ${error?.message || 'Unknown error.'}` : 'Event data not found.'}
        </Text>
        <Text className='text-white text-center text-sm mt-2'>
          Please ensure you are on a valid event management page.
        </Text>
      </View>
    );
  }

  // --- Camera Permission Handling UI ---
  if (!permission) {
    return (
      <View className='flex-1 flex-col justify-center items-center bg-black'>
        <Text className='text-white'>Requesting for camera permission...</Text>
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

      {/* Display event title from context */}
      <Text className='absolute top-5 text-xl font-bold text-white z-10'>
        {event.title} Check-in
      </Text>

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
          {scanResult.username && (
            <Text className='text-white text-sm mt-2'>User: {scanResult.username}</Text>
          )}
          {scanResult.event_title && (
            <Text className='text-white text-xs mt-1'>Event: {scanResult.event_title}</Text>
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
            setScanned(false);
            setScanResult(null); // Clear result on "Scan New"
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
