import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function EventDetail() {
    // This component will display the details of a specific event
      const { id } = useLocalSearchParams();

    
  return (
    <View>
      <Text>EventDetail with {id}</Text>
    </View>
  )
}