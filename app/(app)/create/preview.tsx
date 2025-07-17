import { router } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export default function preview() {
  return (
    <View>
        <TouchableOpacity
            onPress={() => router.push('/(app)/(tabs)/events')}
        >
            <Text>Complete</Text>
      </TouchableOpacity>
    </View>
  )
}