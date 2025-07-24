import QRScanner from '@/components/QRScanner';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Guest() {
  const {id} = useLocalSearchParams();
  return (
    <SafeAreaView className='flex-1'>
      <View className='p-2'>
        <QRScanner />
      </View>
    </SafeAreaView>
  )
}