// src/components/TicketBottomSheetContent.tsx
import { TICKET_PREFIX } from '@/constants';
import { EventDetails } from '@/hooks/useEventDetails';
import { useAuth } from '@/providers/AuthProvider';
import React from 'react';
import { Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg'; // This is directly rendered

interface TicketBottomSheetContentProps {
  event: EventDetails;
  onClose: () => void;
}

export default function TicketBottomSheetContent({ event, onClose }: TicketBottomSheetContentProps) {
  const { user } = useAuth();

  const ticketId = event.rsvp?.ticket_id;
  const isCheckedIn = event.rsvp?.checked_in;
  const userName = user?.full_name || user?.username || 'Guest';

  if (!ticketId || (event.rsvp?.response !== 'Going')) {
    // If no ticket ID or invalid RSVP, show this message
    return (
      <View className='flex-1 justify-center items-center p-4'>
        <Text className='text-lg font-semibold text-red-600 mb-4'>
          No Ticket Available
        </Text>
        <Text className='text-gray-600 text-center'>
          You need to RSVP as "Going" to get a ticket for this event.
        </Text>
      </View>
    );
  }

  return (
    <View className='flex-1 items-center justify-center p-4 bg-white'>
      <Text className='text-2xl font-semibold mb-4 text-center'>Ticket for: {userName}</Text>
      {isCheckedIn ? (
        // If checked in, show this
        <View className='border-4 border-green-500 rounded-lg p-6 bg-green-100 items-center justify-center'>
          <Text className='text-3xl font-bold text-green-700 mb-2'>CHECKED IN!</Text>
          <Text className='text-lg text-green-600'>Welcome to the event!</Text>
        </View>
      ) : (
        // Otherwise, show the QR code
        <View className='p-4 border border-gray-300 rounded-lg shadow-md bg-white'>
          <QRCode
            value={`${TICKET_PREFIX}${ticketId}`}
            size={200}
            color="black"
            backgroundColor="white"
          />
        </View>
      )}

      <Text className='text-sm text-gray-400 mt-6 text-center'>
        {isCheckedIn ? 'This ticket has been used.' : 'Present this QR code at the entrance.'}
      </Text>
      <Text className='text-xs text-gray-400 mt-2 text-center'>
        Ticket ID: {ticketId}
      </Text>
    </View>
  );
}
  




// // src/components/TicketBottomSheetContent.tsx
// import React from 'react';
// import { View, Text } from 'react-native';
// import QRCode from 'react-native-qrcode-svg'; // This is directly rendered
// import { EventDetails } from '@/hooks/useEventDetails';
// import { useAuth } from '@/providers/AuthProvider';

// interface TicketBottomSheetContentProps {
//   event: EventDetails;
//   onClose: () => void;
// }

// export default function TicketBottomSheetContent({ event, onClose }: TicketBottomSheetContentProps) {
//   const { user } = useAuth();

//   const ticketId = event.rsvp?.ticket_id;
//   const isCheckedIn = event.rsvp?.checked_in;
//   const userName = user?.full_name || user?.username || 'Guest';

//   if (!ticketId || (event.rsvp?.response !== 'Going' && event.rsvp?.response !== 'May Be')) {
//     // If no ticket ID or invalid RSVP, show this message
//     return (
//       <View className='flex-1 justify-center items-center p-4'>
//         <Text className='text-lg font-semibold text-red-600 mb-4'>
//           No Ticket Available
//         </Text>
//         <Text className='text-gray-600 text-center'>
//           You need to RSVP as "Going" or "May Be" to get a ticket for this event.
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View className='flex-1 items-center justify-center p-4 bg-white'>
//       <Text className='text-2xl font-bold mb-4 text-center'>{event.title}</Text>
//       <Text className='text-lg text-gray-700 mb-2'>Ticket for: {userName}</Text>
//       <Text className='text-md text-gray-500 mb-6'>Status: {event.rsvp?.response}</Text>

//       {isCheckedIn ? (
//         // If checked in, show this
//         <View className='border-4 border-green-500 rounded-lg p-6 bg-green-100 items-center justify-center'>
//           <Text className='text-3xl font-bold text-green-700 mb-2'>CHECKED IN!</Text>
//           <Text className='text-lg text-green-600'>Welcome to the event!</Text>
//         </View>
//       ) : (
//         // Otherwise, show the QR code
//         <View className='p-4 border border-gray-300 rounded-lg shadow-md bg-white'>
//           <QRCode
//             value={ticketId} // The unique ticket_id (UUID)
//             size={200}
//             color="black"
//             backgroundColor="white"
//           />
//         </View>
//       )}

//       <Text className='text-sm text-gray-400 mt-6 text-center'>
//         {isCheckedIn ? 'This ticket has been used.' : 'Present this QR code at the entrance.'}
//       </Text>
//       <Text className='text-xs text-gray-400 mt-2 text-center'>
//         Ticket ID: {ticketId}
//       </Text>
//     </View>
//   );
// }