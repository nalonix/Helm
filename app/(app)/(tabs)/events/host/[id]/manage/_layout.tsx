// app/(app)/(tabs)/events/host/[id]/manage/_layout.tsx
import Heading from '@/components/Heading';
import { useHostEvent } from '@/providers/HostEventProvider'; // Use the hook
import { Feather } from '@expo/vector-icons';
import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import General from './_top-tabs/general';
import Guest from './_top-tabs/guest';
import RSVP from './_top-tabs/rsvp';


const Tab = createMaterialTopTabNavigator();

// PillTabBar component (remains unchanged)
function PillTabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
  return (
    <View className="flex-row bg-white py-3 pl-5 gap-4">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        let label: string =
          typeof options.tabBarLabel === 'string' ? options.tabBarLabel :
          typeof options.title === 'string' ? options.title :
          route.name;
        const isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={() => {
              if (!isFocused) {
                navigation.navigate(route.name);
              }
            }}
            className={`px-5 py-1 rounded-full border mx-0.5 ${isFocused ? 'bg-red-500 border-red-500' : 'bg-white border-red-500'}`}
          >
            <Text className={`${isFocused ? 'text-white' : 'text-red-500'} font-bold`}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function ManageTabsLayout() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  // Consume data from the parent HostEventProvider
  // We still need hostEventData to display the event title in the header
  const { hostEventData } = useHostEvent();
  const event = hostEventData?.event;

  // No loading/error UI for hostEventData here.
  // This layout will always render the tabs.
  // Individual tabs will handle their own loading/error states for the data.

  return (
    <View className="flex-1">
      {/* Header for the management tabs */}
      <View className="flex-row items-center pt-16 pb-3 px-4 bg-white border-b border-b-zinc-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Feather name="x-circle" size={28} color="black" />
        </TouchableOpacity>
        <Heading header={`Manage`} />
      </View>

      {/* Pill Tabs Navigator */}
      <Tab.Navigator tabBar={props => <PillTabBar {...props} />}>
        {/* These screens will now handle their own loading/error states for the data */}
        <Tab.Screen name="RSVP" component={RSVP} />
        <Tab.Screen name='Guest' component={Guest} />
        <Tab.Screen name="Settings" component={General} />
      </Tab.Navigator>
    </View>
  );
}