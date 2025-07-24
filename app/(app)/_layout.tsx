import Heading from '@/components/Heading';
import { useAuth } from '@/providers/AuthProvider';
import { Feather } from '@expo/vector-icons';
import { Redirect, Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';


export default function AppLayout() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Redirect href="/(auth)" />;
    }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name='create' />
      <Stack.Screen 
        name='notifications' 
        options={{
                headerShown: true,
                headerTitle: () => (
                  <View style={{ paddingTop: 20 }}>
                    <Heading header='Notifications' />
                  </View>
                ),
                headerShadowVisible: false,
                headerLeft: ({ canGoBack, tintColor }) => canGoBack ? (
                  <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, paddingTop: 20 }}>
                    <Feather name="x-circle" size={28} color={tintColor || 'black'} />
                  </TouchableOpacity>
                ) : null,
              }}  />
    </Stack>
  )
}