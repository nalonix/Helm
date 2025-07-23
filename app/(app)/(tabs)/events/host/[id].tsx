import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import SendInvite from '@/components/SendInvite';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';



export default function HostEventDetail() {
  const { id } = useLocalSearchParams();
  
  return (
    <View className='flex-1'>
      <Text>HostEventDetail {id}</Text>
      <TouchableOpacity
        onPress={() => router.push(`/events/host/${id}/manage/general`)}
        >
        <Text>Manage</Text>
      </TouchableOpacity>
      <ShareSheet />
    </View>
  )
}

function ShareSheet(){
  const { id } = useLocalSearchParams();

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['70%'], []);

  const openSheet = () => {
    bottomSheetRef.current?.expand();
  };
  return (
    <View className='flex-1'>
      <TouchableOpacity
          onPress={openSheet}
          className="self-center px-4 py-2 bg-gray-300 rounded"
        >
        <Text className="text-black text-base">Share</Text>
      </TouchableOpacity>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enablePanDownToClose
        snapPoints={snapPoints}
      >
        <BottomSheetView className='h-full flex px-6 py-4 align-center'>
          <SendInvite />
        </BottomSheetView>
      </BottomSheet>
    </View>
  )
}










