import Heading from '@/components/Heading';
import { useAuth } from '@/providers/AuthProvider';
import { Redirect, Stack } from 'expo-router';
import React from 'react';


export default function AppLayout() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Redirect href="/(auth)" />;
    }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='create' />
      <Stack.Screen 
        name='notifications' 
        options={{
                headerShown: true,
                headerTitle: () => <Heading  header='Notifications' />,
                headerShadowVisible: false,
              }}  />
    </Stack>
  )
}