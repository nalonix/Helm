// import { Feather } from '@expo/vector-icons';
// import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import React from 'react';
// import { Text, TouchableOpacity, View } from 'react-native';

// import Heading from '@/components/Heading';
// import { useAuth } from '@/providers/AuthProvider';
// import { useHostEvent } from '@/providers/HostEventProvider'; // This hook will now work correctly!

// import General from './top-tabs/general';
// import Guest from './top-tabs/guest';
// import RSVP from './top-tabs/rsvp';

// const Tab = createMaterialTopTabNavigator();

// // PillTabBar component remains unchanged
// function PillTabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
//   return (
//     <View className="flex-row bg-white py-3 pl-5 gap-4">
//       {state.routes.map((route, index) => {
//         const { options } = descriptors[route.key];
//         let label: string =
//           typeof options.tabBarLabel === 'string' ? options.tabBarLabel :
//           typeof options.title === 'string' ? options.title :
//           route.name;
//         const isFocused = state.index === index;
//         return (
//           <TouchableOpacity
//             key={route.key}
//             accessibilityRole="button"
//             accessibilityState={isFocused ? { selected: true } : {}}
//             onPress={() => {
//               if (!isFocused) {
//                 navigation.navigate(route.name);
//               }
//             }}
//             className={`px-5 py-1 rounded-full border mx-0.5 ${isFocused ? 'bg-red-500 border-red-500' : 'bg-white border-red-500'}`}
//           >
//             <Text className={`${isFocused ? 'text-white' : 'text-red-500'} font-bold`}>{label}</Text>
//           </TouchableOpacity>
//         );
//       })}
//     </View>
//   );
// }

// // Renamed from ManageEventLayout to ManageEventScreen for clarity,
// // as it's now a screen and not a layout.
// export default function ManageEventScreen() {
//   const router = useRouter();
//   const { id } = useLocalSearchParams(); // Still get event ID for router navigation
//   const { user } = useAuth(); // Current authenticated user

//   // Consume the host event data from the HostEventProvider context
//   // This hook will now find its provider in the parent _layout.tsx
//   const { hostEventData, isLoading, isError, error } = useHostEvent();
//   const event = hostEventData?.event; // Extract the event details

//   // Only render the tab navigator and header, assuming access control is handled by the parent layout
//   if (!event) {
//     return null;
//   }
//   return (
//     <View className="flex-1">
//       {/* Header */}
//       <View className="flex-row items-center pt-10 pb-4 px-4 bg-white border-b border-b-zinc-200">
//         <TouchableOpacity onPress={() => router.push(`/(app)/(tabs)/events/host/${id}`)} className="mr-4 p-1">
//           <Feather name="x-circle" size={28} color="black" />
//         </TouchableOpacity>
//         <Heading header={`Manage: ${event.title}`} /> {/* Display event title */}
//       </View>

//       {/* Pill Tabs */}
//       <Tab.Navigator tabBar={props => <PillTabBar {...props} />}>
//         {/* Pass eventId as initialParams to tab screens if they need it */}
//         <Tab.Screen name="RSVP" component={RSVP} initialParams={{ eventId: event.id }} />
//         <Tab.Screen name='Guest' component={Guest} initialParams={{ eventId: event.id }} />
//         <Tab.Screen name="Settings" component={General} initialParams={{ eventId: event.id }} />
//       </Tab.Navigator>
//     </View>
//   );
// }


