import { Link } from 'expo-router'
import React from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Splash() {
  return (
    <SafeAreaView>
      <Text>Auth Splash</Text>
      <Link href={"/(auth)/login"}>
        <Text className='text-blue-500'>Get Started</Text>
      </Link>
    </SafeAreaView>
  )
}