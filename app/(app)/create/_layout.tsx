import { Stack } from 'expo-router'
import React from 'react'

export default function CreateEventLayout() {
  // TODO: make sure to update the navigation animation for preview screen
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Create Event" }}  />
      <Stack.Screen name="preview" options={{ title: "Preview Event", animation: "slide_from_bottom" }} />
    </Stack>  
  )
}