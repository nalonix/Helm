import Heading from '@/components/Heading';
import { Colors } from "@/constants/Colors";
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // Import BlurView
import { router, Tabs } from 'expo-router';
import React, { useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';

function SignOutButton() {
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)");
  }, [router]);

  return (
    <TouchableOpacity onPress={handleSignOut} className='mt-5 mr-5 p-1.5 rounded-lg'>
      <Ionicons name="log-out-outline" size={32} color="black" />
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          position: 'absolute', // Important for blur effect
          backgroundColor: 'transparent',
          borderTopWidth: 0, // Remove the default border
          elevation: 0, // Remove shadow on Android
        },
        tabBarActiveTintColor: Colors.light.tint, // Set active tab icon color
        // Render BlurView as the background of the tab bar
        tabBarBackground: () => (
          <BlurView
            intensity={100} // Adjust intensity for desired blur effect
            tint="light" // 'light', 'dark', or 'default'
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.7)', // Fallback color for platforms without blur
            }}
          />
        ),
      }}
    >
      <Tabs.Screen name="events" options={{
        headerShown: false,
        tabBarIcon: ({ color }) => (
          <Ionicons name="home" size={24} color={color} />
        ),
      }} />
      <Tabs.Screen name="profile" options={{
        tabBarIcon: ({ color }) => (
          <Ionicons name="person-outline" size={24} color={color} />
        ),
        headerShown: true,
        headerTitle: () => (
          <View style={{ paddingTop: 20 }}>
            <Heading header='Profile' />
          </View>
        ),
        headerRight: () => <SignOutButton />,
        headerStyle: {
          backgroundColor: '#f8f8f8'
        },
        headerShadowVisible: false,
      }}
       />
    </Tabs>
  );
}
