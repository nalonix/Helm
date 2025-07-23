import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Share, Text, TouchableOpacity, View } from 'react-native';

export default function HostEventDetail() {
  const { id } = useLocalSearchParams();


  const shareEvent = async (eventId: string) => {
    const url = `https://myevents.app/invite/${eventId}`;
    await Share.share({
      message: `Here's your invitation: ${url}`,
    });
  };

  return (
    <View>
      <Text>HostEventDetail {id}</Text>
      <TouchableOpacity
        onPress={() => router.push(`/events/host/${id}/manage/general`)}
        >
        <Text>Manage</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => shareEvent('hi')}
        >
          <Text>Share</Text>
        </TouchableOpacity>
    </View>
  )
}