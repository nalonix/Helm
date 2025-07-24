import { Stack } from 'expo-router'
import React from 'react'

export default function EventHostLayout() {
  return (
    <Stack>
      <Stack.Screen name='[id]/manage' options={{ headerShown: false }} />
      <Stack.Screen name='[id]' options={{ headerShown: false}} />
    </Stack>
  )
}