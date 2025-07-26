import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRScanner from "../_components/QRScanner";

export default function Guest() {
  const {id} = useLocalSearchParams();
  return (
    <SafeAreaView className='flex-1'>
      <Text>Guest</Text>
      <View className='p-2'>
        <QRScanner />
      </View>
    </SafeAreaView>
  )
}