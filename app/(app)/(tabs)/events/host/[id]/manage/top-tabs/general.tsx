import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function General() {
  const {id} = useLocalSearchParams();
  return (
    <SafeAreaView>
      <Text>general {id}</Text>
    </SafeAreaView>
  )
}