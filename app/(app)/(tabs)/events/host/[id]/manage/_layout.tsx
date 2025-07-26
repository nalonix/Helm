// app/(app)/(tabs)/events/host/[id]/_layout.tsx
import { HostEventProvider } from '@/providers/HostEventProvider'; // Import the provider
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native'; // For error handling

export default function HostEventLayout() {
  const { id } = useLocalSearchParams(); 

  if (!id || typeof id !== 'string') {
    return (
      <View className="flex-1 items-center justify-center bg-red-800 p-4">
        <Text className="text-white text-center text-lg">Invalid Event ID.</Text>
      </View>
    );
  }

  return (
    <HostEventProvider eventId={id}>
      <Text>Hi</Text>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: true }} />
      </Stack>
    </HostEventProvider>
  );
}