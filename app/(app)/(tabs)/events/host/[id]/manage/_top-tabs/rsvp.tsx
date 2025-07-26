import { useHostEvent } from '@/providers/HostEventProvider';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RSVP() {
  const {id} = useLocalSearchParams();

  const { hostEventData } = useHostEvent()

    
  return (
    <SafeAreaView>
      <Text>rsvp {id}</Text>
      <Text>{hostEventData?.event.description}</Text>
    </SafeAreaView>
  )
}