// app/(app)/(tabs)/events/host/[id]/_layout.tsx
import { useAuth } from '@/providers/AuthProvider'; // To get the current user's ID
import { HostEventProvider, useHostEvent } from '@/providers/HostEventProvider'; // Import both provider and hook
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

// This component acts as the immediate parent for the Stack.Screen below.
// It uses the HostEventProvider internally to fetch data and then performs authorization.
export default function HostEventIdLayout() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth(); // Get the current authenticated user

  // Check for valid ID early
  if (!id || typeof id !== 'string') {
    return (
      <View className="flex-1 items-center justify-center bg-red-800 p-4">
        <Text className="text-white text-center text-lg">Invalid Event ID.</Text>
      </View>
    );
  }

  // Render the HostEventProvider. Its internal loading/error states will be shown first.
  // We then use the useHostEvent hook within this same component to access the data
  // provided by the HostEventProvider.
  return (
    <HostEventProvider eventId={id}>
      <HostEventAuthorizationGate />
    </HostEventProvider>
  );
}

// A separate component to handle the authorization gate,
// ensuring it consumes the context correctly.
function HostEventAuthorizationGate() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  // Consume the data provided by HostEventProvider
  const { hostEventData, isLoading, isError, error } = useHostEvent();
  const event = hostEventData?.event; // Extract the event details

  // Ownership check: Redirect if the current user is not the host of this event
  useEffect(() => {
    // Only perform this check once loading is complete and we have both event and user data
    // If isError is true, the provider already showed an error, so no need to redirect here.
    if (!isLoading && !isError && event && user) {
      if (event.host !== user.id) {
        Alert.alert('Unauthorized Access', 'You are not authorized to manage this event.');
        router.replace(`/(app)/(tabs)/events/${id}`); // Redirect to public event detail page
      }
    }
  }, [isLoading, isError, event, user, id, router]);

  // If the provider is still loading or has an error, its own UI will be shown.
  // If event or user is not yet available *after* provider has loaded (e.g., user not logged in),
  // show a brief local loading state.
  if (isLoading || !event || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-600">Verifying event access...</Text>
      </View>
    );
  }

  // If we've passed all checks (loaded, no error, user is host), render the nested stack
  return (
    <Stack>
      {/* The 'index' screen is the default screen for the /host/[id] route. */}
      {/* This is where your Tab.Navigator (ManageEventScreen) will be rendered. */}
      {/* Since it's a child of HostEventProvider, useHostEvent will now work. */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="manage" options={{ headerShown: false }} />
      <Stack.Screen name="edit/index" options={{ headerShown: false }} />

      {/* Define any other direct children screens of /host/[id] here if they are
          not part of the MaterialTopTabNavigator. For example, a full-screen modal. */}
      {/* <Stack.Screen name="some-modal" options={{ presentation: 'modal' }} /> */}
    </Stack>
  );
}