// src/components/QRScanner.tsx
// This version performs all check-in logic directly on the client-side.
// WARNING: This approach has SIGNIFICANT SECURITY IMPLICATIONS regarding Row Level Security (RLS).
// For a production application, it is STRONGLY RECOMMENDED to use a Supabase RPC function (PostgreSQL function)
// to handle check-in logic securely on the backend, as discussed previously.
// Direct client-side updates will likely require very permissive (and insecure) RLS policies
// on your 'rsvp' table (e.g., allowing any authenticated user to update any RSVP).

import { TICKET_PREFIX } from "@/constants";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useHostEvent } from "@/providers/HostEventProvider";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Define the expected response structure for client-side feedback
interface CheckInResult {
  status: "success" | "warning" | "error";
  message: string;
  username?: string | null;
  event_title?: string | null;
}

const getStatusIcon = (status: CheckInResult['status'] | null) => {
  switch (status) {
    case 'success': return <Feather name="check-circle" size={24} color="white" className="mr-2" />;
    case 'warning': return <Feather name="alert-triangle" size={24} color="white" className="mr-2" />;
    case 'error': return <Feather name="x-circle" size={24} color="white" className="mr-2" />;
    default: return <Feather name="maximize" size={24} color="white" className="mr-2" />; // Default for "Scan A Ticket"
  }
};

export default function QRScanner() {
  // Get event data and loading/error states from the HostEventProvider context
  const { hostEventData, isLoading, isError, error } = useHostEvent();
  const event = hostEventData?.event; // Extract the event object
  const eventId = event?.id; // Get eventId directly from the context's event object

  const { user: hostUser } = useAuth(); // Currently authenticated host user
  const hostUserId = hostUser?.id;

  const [permission, requestPermission] = useCameraPermissions();
  // CORRECTED: Initialize 'scanned' to true. This means scanning is INITIALLY PAUSED.
  const [scanned, setScanned] = useState(true);
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null);

  const queryClient = useQueryClient();

  // REMOVED: The useEffect that automatically requested permission on mount.
  // Permission request will now be triggered by the "Tap to Scan" button.

  // Mutation to handle the client-side check-in process
  const { mutate: processCheckIn, isPending: isCheckingIn } = useMutation<
    CheckInResult,
    Error,
    { scannedTicketId: string }
  >({
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
        return {
          status: "error",
          message: "Unauthorized: You are not the host of this event.",
        };
      }

      // Check if it's the event date
      const eventDate = new Date(event.date);
      const today = new Date();
      eventDate.setHours(0, 0, 0, 0); // Normalize to start of day
      today.setHours(0, 0, 0, 0); // Normalize to start of day

      if (eventDate.getTime() !== today.getTime()) {
        return {
          status: "error",
          message: `Not event day: Tickets can only be scanned on ${event.date}.`,
        };
      }

      // --- Core Client-Side Check-in Logic (Direct Supabase Calls) ---
      try {
        // 1. Fetch the RSVP record using the scanned ticket_id
        const { data: rsvpRecord, error: rsvpFetchError } = await supabase
          .from("rsvp")
          .select("id, user_id, event_id, response, checked_in") // Select necessary fields
          .eq("ticket_id", scannedTicketId)
          .single();

        if (rsvpFetchError) {
          if (rsvpFetchError.code === "PGRST116") {
            // No rows found
            return { status: "error", message: "Invalid ticket ID." };
          }
          console.error("Error fetching RSVP record:", rsvpFetchError);
          throw new Error(rsvpFetchError.message || "Failed to verify ticket.");
        }

        if (!rsvpRecord) {
          // This case should theoretically be covered by PGRST116, but added for explicit safety.
          return { status: "error", message: "Invalid ticket ID." };
        }

        // 2. Verify it's the correct event for this ticket
        if (rsvpRecord.event_id !== event.id) {
          return {
            status: "error",
            message: "Ticket is for a different event.",
          };
        }

        // 3. Check RSVP status (only 'Going' or 'May Be' can check in)
        if (
          rsvpRecord.response !== "Going" &&
          rsvpRecord.response !== "May Be"
        ) {
          // Fetch username for better feedback
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", rsvpRecord.user_id)
            .single();
          const username = profile?.username || "User";
          return {
            status: "warning",
            message: `${username} RSVP'd as "${rsvpRecord.response}".`,
            username: username,
          };
        }

        // 4. Check if already checked in
        if (rsvpRecord.checked_in) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", rsvpRecord.user_id)
            .single();
          const username = profile?.username || "User";
          return {
            status: "warning",
            message: `${username} already checked in.`,
            username: username,
          };
        }

        // 5. Perform the check-in update directly
        // IMPORTANT: Your RLS policy on 'rsvp' table MUST allow the 'hostUserId'
        // to UPDATE other users' RSVP records for this to work.
        // A common (but insecure) RLS policy for this would be:
        // FOR UPDATE TO authenticated USING (TRUE); -- This is very insecure!
        // A more secure RLS would check if auth.uid() is the event.host for the rsvp's event_id.
        const { data, error: updateError } = await supabase
          .from("rsvp")
          .update({
            checked_in: true,
            checked_in_at: new Date().toISOString(), // Use ISO string for TIMESTAMPTZ
            checked_in_by: hostUserId,
          })
          .eq("id", rsvpRecord.id); // Update using the RSVP record's primary key

        if (updateError) {
          console.error("Error updating RSVP for check-in:", updateError);
          throw new Error(
            updateError.message || "Failed to update check-in status."
          );
        }

        // Fetch username for success message (if not already fetched)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", rsvpRecord.user_id)
          .single();
        const username = profile?.username || "User";

        return {
          status: "success",
          message: `${username} checked in successfully!`,
          username: username,
          event_title: event.title,
        };
      } catch (err: any) {
        console.error("Check-in process error:", err);
        return {
          status: "error",
          message:
            err.message || "An unexpected error occurred during check-in.",
        };
      }
    },
    onSuccess: (result) => {
      setScanResult(result);
      // Invalidate the 'hostEventData' query to trigger a refetch in the provider,
      // which will then update all consuming components (like RSVP/Guest lists).
      queryClient.invalidateQueries({ queryKey: ["hostEventData", eventId] });
    },
    onError: (err) => {
      setScanResult({
        status: "error",
        message: err.message || "An unexpected error occurred.",
        username: null,
        event_title: null,
      });
    },
  });

  const handleBarCodeScanned = async ({
    type,
    data,
  }: BarcodeScanningResult) => {
    setScanned(true); // Pause scanning after a scan is detected
    setScanResult(null); // Clear previous result

    // --- NEW: Prefix Check ---
    if (!data.startsWith(TICKET_PREFIX)) {
      setScanResult({
        status: "error",
        message: "Invalid QR code: Not an A Helm ticket.",
        username: null,
        event_title: null,
      });
      setScanned(true); // Keep scanned true (paused) if invalid format
      return;
    }

    // Extract the actual ticket ID by removing the prefix
    const ticketId = data.substring(TICKET_PREFIX.length);

    // Basic client-side checks before calling backend
    if (!hostUserId) {
      setScanResult({
        status: "error",
        message: "You must be logged in to scan tickets.",
      });
      setScanned(true); // Keep scanned true (paused) if auth issue
      return;
    }
    if (!event) {
      // Check if event data is available from context
      setScanResult({
        status: "error",
        message: "Event data not loaded. Cannot proceed.",
      });
      setScanned(true); // Keep scanned true (paused) if data issue
      return;
    }

    // Trigger the mutation with the extracted ticket ID
    processCheckIn({ scannedTicketId: ticketId });
  };

  // Function to handle the "Tap to Scan" button press
  const handleStartScan = async () => {
    // Request permission if not granted
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        setScanResult({
          status: "error",
          message: "Camera permission denied. Cannot scan tickets.",
          username: null,
          event_title: null,
        });
        return; // Stop if permission is not granted
      }
    }
    // If permission is granted, enable scanning
    setScanned(false);
    setScanResult(null); // Clear any previous scan result
  };


  // --- Loading/Error UI from Context ---
  // This component will show its own loading/error if hostEventData isn't ready
  // or if there's an error from the provider.
  if (isLoading) {
    return (
      <View className="flex-1 flex-col justify-center items-center bg-black">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">Loading event data...</Text>
      </View>
    );
  }

  if (isError || !event) {
    // If provider reported an error or event is null
    return (
      <View className="flex-1 flex-col justify-center items-center bg-green-800 p-4">
        <Text className="text-white text-center text-lg">
          {isError
            ? `Error: ${error?.message || "Unknown error."}`
            : "Event data not found."}
        </Text>
        <Text className="text-white text-center text-sm mt-2">
          Please ensure you are on a valid event management page.
        </Text>
      </View>
    );
  }

  // --- Camera Permission Handling UI ---
  // Check permission status directly from the hook
  if (!permission) {
    return (
      <View className="flex-1 flex-col justify-center items-center h-72 bg-blue-500 p-4">
        <Text className="text-white text-center mb-5">
          Requesting for camera permission...
        </Text>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 flex-col justify-center items-center h-72 bg-red-500 p-4">
        <Text className="text-white text-center mb-5">
          We need your permission to show the camera.
        </Text>
        {/* Button to request permission directly */}
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // --- Main Scanner UI ---
  return (
    <View>
      {/* Overlay for scan status or instructions */}
      {isCheckingIn ? (
        <View className="flex flex-row gap-2 p-4 bg-blue-700/80 rounded-lg">
          <ActivityIndicator size="small" color="white" />
          <Text className="text-white text-lg">Checking in...</Text>
        </View>
      ) : scanResult && (
        <View
          className={`flex flex-row gap-2 p-3 rounded-lg ${
            scanResult.status === "success"
              ? "bg-green-500/80"
              : scanResult.status === "warning"
                ? "bg-yellow-700/80"
                : "bg-red-700/80"
          }`}
        >
          <View>
          {getStatusIcon(scanResult.status)}
          </View>
          <View>
            <Text className="text-white text-base text-center">
              {scanResult.message}
            </Text>
          </View>
        </View>
      )}

      <View className="mt-2 border-4 border-red-500 aspect-square flex flex-col justify-center items-center overflow-hidden rounded-lg bg-black">
        <CameraView
          // onBarcodeScanned is only active when 'scanned' is false (meaning actively scanning)
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          style={styles.cameraPreview}
        />
        {/* Conditional text based on scanning state */}
        {!scanned && !isCheckingIn && (
          <Text className="absolute top-1/2 -mt-10 text-lg text-white bg-black/50 p-2.5 rounded-md z-10">
            Scanning...
          </Text>
        )}
        {scanned && !isCheckingIn && ( // Show "Tap to Scan" or "Tap to Scan New" when paused
          <View className="absolute bottom-5 z-10">
            <Button
              title={scanResult ? "Tap to Scan New" : "Tap to Scan"} // Change button text
              onPress={handleStartScan} // Use the new handler
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraPreview: {
    ...StyleSheet.absoluteFillObject,
  },
});
