import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function HostEventDetail() {
  const { id } = useLocalSearchParams();



  return (
    <View>
      <Text>HostEventDetail {id}</Text>
      <TouchableOpacity
        onPress={() => router.push(`/events/host/${id}/manage/general`)}
        >
        <Text>Manage</Text>
        </TouchableOpacity>
    </View>
  )
}