import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function Guest() {
  const {id} = useLocalSearchParams();
  return (
    <View>
      <Text>guest {id}</Text>
    </View>
  )
}