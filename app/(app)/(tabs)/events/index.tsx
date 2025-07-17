import { router } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export default function index() {
  return (
    <View>
      <Text>Upcoming Events</Text>
      <View>
        <TouchableOpacity
            onPress={() => router.push('/(app)/create')}
        >
            <Text>Create Event</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => router.push('/(app)/(tabs)/events/456')}
        >
            <Text>456 Event</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => router.push('/(app)/(tabs)/events/host/789')}
        >
            <Text>789 Event</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => router.push('/(app)/notifications')}
        >
            <Text>Notifications</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}