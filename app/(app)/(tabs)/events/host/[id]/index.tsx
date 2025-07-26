import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import SendInvite from "@/components/SendInvite";
import { useHostEvent } from "@/providers/HostEventProvider";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HostEventDetail() {
  const { id } = useLocalSearchParams();
  const { hostEventData } = useHostEvent();

  

  // Ref for controlling the bottom sheet
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%"], []);
  const openSheet = () => bottomSheetRef.current?.expand();

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 px-4">
        <Text>HostEventDetail {id}</Text>
        <Text>{hostEventData?.event.title}</Text>

        <TouchableOpacity
          onPress={() => router.push(`/(app)/(tabs)/events/host/${id}/manage`)}
        >
          <Text>Manage</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push(`/(app)/(tabs)/events`)}>
          <Text>Close</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openSheet}
          className="self-center px-4 py-2 bg-gray-300 rounded mt-4"
        >
          <Text className="text-black text-base">Share</Text>
        </TouchableOpacity>
      </View>


      {/* TODO: UPDATE IMPLIMENTATION */}
      {/* BottomSheet outside of View for full-screen backdrop */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enablePanDownToClose={true}
        snapPoints={snapPoints}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetView className="h-full px-5 py-4">
          <SendInvite />
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}
