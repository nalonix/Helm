import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function RSVP() {
  const {id} = useLocalSearchParams();
    
  return (
    <View>
      <Text>rsvp {id}</Text>
    </View>
  )
}