import { EventDetails } from "@/hooks/useEventDetails";
import { useAuth } from "@/providers/AuthProvider";
import { Text, View } from "react-native";

export default function GetTicket({ event, onClose }: { event: EventDetails, onClose: () => void }) {
    const { user } = useAuth();
  
    
    return (
        <View className="flex-1">
            <Text>Get Ticket</Text>
            <Text>{event.title}</Text>
            <Text>{event.id}</Text>
            <Text>{user?.id}</Text>
            <Text>{event.host}</Text>
            <Text>{event.date}</Text>
            <Text>{event.start_time}</Text>
            <Text>{event.end_time}</Text>
        </View>
    );
}
  





// function RSVPSheet({ eventId, hostId, status, onClose }: RSVPSheetProps) {
//     // ref to the BottomSheet component
//     const bottomSheetRef = useRef<BottomSheet>(null);
  
//     // Memoize snap points to prevent unnecessary re-renders
//     const snapPoints = useMemo(() => ["35%"], []); // Adjust snap points as desired
  
//     // Callback to handle sheet changes (e.g., when it's fully closed by pan-down)
//     const handleSheetChanges = useCallback(
//       (index: number) => {
//         if (index === -1) {
//           onClose(); // Notify parent when sheet is fully closed
//         }
//       },
//       [onClose]
//     );
  
//     // Open the sheet when the status prop changes to a non-null value
//     // and close it when status becomes null
//     React.useEffect(() => {
//       if (status) {
//         bottomSheetRef.current?.snapToIndex(1); // Snap to a visible point (e.g., 50%)
//       } else {
//         bottomSheetRef.current?.close(); // Close the sheet
//       }
//     }, [status]);
  
//     return (
//       <BottomSheet
//         ref={bottomSheetRef}
//         index={-1}
//         enablePanDownToClose={true}
//         snapPoints={snapPoints}
//         onChange={handleSheetChanges}
//         backdropComponent={(props) => (
//           <BottomSheetBackdrop
//             {...props}
//             appearsOnIndex={0}
//             disappearsOnIndex={-1}
//             pressBehavior="close"
//           />
//         )}
//       >
//         <BottomSheetView className="flex-1 px-6 py-4">
//           {/* Header for the Bottom Sheet */}
//           <View className="flex flex-row justify-between items-center mb-4">
//             <Text className="text-3xl font-bold">
//               {status ? `${status}` : "RSVP"}
//             </Text>
//             <TouchableOpacity
//               onPress={() => bottomSheetRef.current?.close()}
//               className="p-1 items-center"
//             >
//               <Feather name="x-circle" size={28} />
//             </TouchableOpacity>
//           </View>
  
//           <View className="flex-1 items-center justify-center border border-dashed border-gray-400 p-4 rounded-lg">
//             <RSVPResponse
//               eventId={eventId}
//               hostId={hostId}
//               rsvpStatus={status}
//               onSuccess={() => bottomSheetRef.current?.close()}
//             />
//           </View>
//         </BottomSheetView>
//       </BottomSheet>
//     );
//   }