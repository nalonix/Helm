import { router } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export default function create() {
  return (
    <View>
      <Text>Create new event</Text>
      <TouchableOpacity
          onPress={() => router.push('/(app)/create/preview')}
        >
          <Text>Preview</Text>
      </TouchableOpacity>
    </View>
  )
}