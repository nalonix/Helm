import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function General() {
  const {id} = useLocalSearchParams();
  return (
    <View>
      <Text>general {id}</Text>
    </View>
  )
}