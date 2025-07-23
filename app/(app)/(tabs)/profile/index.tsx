import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function index() {
    const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/(auth)");
  }, [router]);
  
  return (
    <SafeAreaView>
      <Text>index</Text>
                    <Pressable
                onPress={handleSignOut}
                style={{
                  backgroundColor: '#18181b',
                  borderRadius: 8,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: '#27272a',
                }}
              >
                <Text className='text-white font-semibold'>Sign Out</Text>
              </Pressable>
    </SafeAreaView>
  )
}