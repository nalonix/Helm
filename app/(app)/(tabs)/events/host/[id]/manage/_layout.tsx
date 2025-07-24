import { Feather } from '@expo/vector-icons';
import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import Heading from '@/components/Heading';
import General from './general';
import Guest from './guest';
import RSVP from './rsvp';

const Tab = createMaterialTopTabNavigator();

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

export default function ManageEventLayout() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  return (
    <View className="flex-1 pt-3">
      {/* Header */}
      <View className="flex-row items-center pt-10 pb-4 px-4 bg-white border-b border-b-zinc-200">
        <TouchableOpacity onPress={() => router.push(`/(app)/(tabs)/events/host/${id}`)} className="mr-4 p-1">
          <Feather name="x-circle" size={28} color="black" />
        </TouchableOpacity>
        <Heading header='Manage' />
      </View>
      {/* Pill Tabs */}
      <Tab.Navigator tabBar={props => <PillTabBar {...props} />}>
        <Tab.Screen name="RSVP" component={RSVP} />
        <Tab.Screen name='Guest' component={Guest} />
        <Tab.Screen name="Settings" component={General} />
      </Tab.Navigator>
    </View>
  )
}
