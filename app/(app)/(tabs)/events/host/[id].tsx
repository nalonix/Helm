import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

export default function HostEventDetail() {
  const { id } = useLocalSearchParams();

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['70%'], []);


  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);


  const openSheet = () => {
    bottomSheetRef.current?.expand();
  };



  return (
    <View className='flex-1'>
      <Text>HostEventDetail {id}</Text>
      <TouchableOpacity
        onPress={() => router.push(`/events/host/${id}/manage/general`)}
        >
        <Text>Manage</Text>
      </TouchableOpacity>
      <TouchableOpacity
          onPress={openSheet}
          className="self-center px-4 py-2 bg-gray-300 rounded"
        >
        <Text className="text-black text-base">Open Invite Modal</Text>
      </TouchableOpacity>


      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        onChange={handleSheetChanges}
        enablePanDownToClose
        snapPoints={snapPoints}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </BottomSheetView>
      </BottomSheet>
    </View>
  )
}


const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
    backgroundColor: 'pink',
  },

});




