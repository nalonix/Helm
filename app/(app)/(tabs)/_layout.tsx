import Heading from '@/components/Heading';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
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
    >
      <Tabs.Screen name="events" options={{
        headerShown: false
      }} />
      <Tabs.Screen name="profile" options={{
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
      }} />
    </Tabs>
  );
}