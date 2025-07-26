// src/components/QRScanner.tsx
// REMOVED: import { useEventDetails } from '@/hooks/useEventDetails'; // No longer needed
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
// REMOVED: useLocalSearchParams // No longer needed for eventId
import { useHostEvent } from '@/providers/HostEventProvider'; // Import the new hook
import React, { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

// Define the expected response structure for client-side feedback
interface CheckInResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  username?: string | null; // Changed from checkedInUsername to username for consistency with RPC
  event_title?: string | null; // Added for consistency with RPC response
}

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

  // Mutation to call the Supabase RPC function (still the secure backend logic)
  const { mutate: processCheckIn, isPending: isCheckingIn } = useMutation<CheckInResult, Error, { scannedTicketId: string }>({
    mutationFn: async ({ scannedTicketId }) => {
      // These checks are now minimal, focusing on client-side prerequisites
      if (!hostUserId) {
        throw new Error("Host user not authenticated. Please log in.");
      }
      if (!eventId) { // Ensure eventId is available from context
        throw new Error("Event ID not available from context. Cannot proceed.");
      }

      // Call the RPC function, relying on it for all validation and updates
      const { data, error: rpcError } = await supabase.rpc('check_in_user', {
        p_ticket_id: scannedTicketId,
        p_host_user_id: hostUserId,
        p_event_id: eventId, // Pass eventId to RPC for server-side verification
      });

      if (rpcError) {
        console.error("RPC Error:", rpcError);
        throw new Error(rpcError.message || "Failed to check in user via backend.");
      }

      // Supabase RPC returns an array of objects for TABLE functions, even if single row
      return data[0] as CheckInResult;
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
        message: err.message || 'An unexpected error occurred during check-in.',
        username: null, event_title: null,
      });
    },
  });

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    setScanned(true); // Pause scanning
    setScanResult(null); // Clear previous result
    console.log(`Scanned Data: ${data}`);

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

    // Trigger the mutation to call the backend check-in function
    processCheckIn({ scannedTicketId: data });
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