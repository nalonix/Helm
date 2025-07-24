// src/components/RSVPBottomSheetContent.tsx (formerly RSVPSheet.tsx)
import React from 'react';
import { View } from 'react-native';
import RSVPResponse from './RSVPResponse'; // Adjust path if needed

// Define the possible RSVP statuses
type RsvpStatus = 'Going' | 'May Be' | 'Not Going'; // No longer null here as it's passed when sheet is open

// Props for the content component
interface RSVPBottomSheetContentProps {
  eventId: string;
  hostId: string;
  status: RsvpStatus;
  onClose: () => void; // Passed from the global sheet to close itself
}

// This component is now just the content that the global sheet will render
export default function RSVPBottomSheetContent({ eventId, hostId, status, onClose }: RSVPBottomSheetContentProps) {
  return (
    <View className='flex-1'>
      {/* The header is now handled by FullScreenBottomSheet, but you can keep specific styling for the title if needed */}
      {/* The close button is also handled by FullScreenBottomSheet */}

      <View className='flex-1 justify-center items-center border border-dashed border-gray-400 p-4 rounded-lg'>
        <RSVPResponse
          eventId={eventId}
          hostId={hostId}
          rsvpStatus={status}
          onSuccess={onClose} // Call the passed onClose to close the global sheet
        />
      </View>
    </View>
  );
}