import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventDetail() {
    // This component will display the details of a specific event
      const { id } = useLocalSearchParams();
      const router  = useRouter() 

  return (
    <SafeAreaView className='flex-1 border border-purple-500'>
      <Text>EventDetail with {id}</Text>
      <TouchableOpacity
        onPress={()=> router.push('/(app)/(tabs)/events')}
      >
        <Text>Close</Text>
      </TouchableOpacity>
      <View className='border py-3 px-3'>
        <View className='border rounded-xl flex flex-row overflow-hidden'>
          <TouchableOpacity className='flex-1 items-center justify-center p-3 bg-green-50' onPress={() => console.log("Going")}>
            <Text className='text-lg font-semibold'>Going</Text>
          </TouchableOpacity>
          <TouchableOpacity className='flex-1 items-center justify-center p-3 border-x' onPress={() => console.log("May Be")}>
            <Text className='text-lg font-semibold'>May Be</Text>
          </TouchableOpacity>
          <TouchableOpacity className='flex-1 items-center justify-center p-3 bg-red-50' onPress={() => console.log("Not Going")}>
            <Text className='text-lg font-semibold'>Not Going</Text>
          </TouchableOpacity>

          <RSVPSheet />
        </View>
      </View>
    </SafeAreaView>
  )
}



function RSVPSheet({  }){
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
          <Text>I am RSVP Sheet</Text>
        </BottomSheetView>
      </BottomSheet>
    </View>
  )
}