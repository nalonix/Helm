import { useEventDetails } from '@/hooks/useEventDetails';
import { useAuth } from '@/providers/AuthProvider';
import { Slot, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function HostEventLayout() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { data: event, isLoading } = useEventDetails(typeof id === 'string' ? id : undefined);

  React.useEffect(() => {
    if (!isLoading && event && user) {
      if (event.host !== user.id) {
        router.replace(`/(app)/(tabs)/events/${id}`);
      }
    }
  }, [isLoading, event, user, id, router]);

  if (isLoading || !event || !user) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return <Slot />;
} 