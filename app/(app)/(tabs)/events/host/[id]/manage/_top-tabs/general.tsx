import { useHostEvent } from '@/providers/HostEventProvider';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function General() {
  const {id} = useLocalSearchParams();
  // Access the host event provider data
  // (Assumes useHostEvent is available via context from parent layout)
  // Example usage:
  //   const { hostEventData, isLoading, isError, error } = useHostEvent();
  //   const event = hostEventData?.event;
  // If you want to use it:
  // import { useHostEvent } from '@/providers/HostEventProvider';
  const { hostEventData, isLoading, isError, error } = useHostEvent();
  return (
    <SafeAreaView>
      <Text>general {id}</Text>
      <Text>{hostEventData?.event.description}</Text>
    </SafeAreaView>

  )
}