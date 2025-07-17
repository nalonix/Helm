import { router } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Index() {
  return (
    <SafeAreaView>
      <Text>Log In</Text>
      <TouchableOpacity
        onPress={() => router.push('/(auth)/register')}
      >
        <Text>Go to Register</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}