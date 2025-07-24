import Heading from '@/components/Heading';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router'; // Import Stack
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

// NotificationsButton component
function NotificationsButton() {
  const router = useRouter();

  const handlePress = () => {
    router.push('/notifications');
  };

  return (
    <TouchableOpacity onPress={handlePress} className='mr-5 p-1.5 border border-zinc-400 rounded-lg'>
      <View className='hidden absolute right-2 top-2 h-4 w-4 rounded-full bg-orange-600'></View>
      <Ionicons name="notifications-outline" size={28} color="black" />
    </TouchableOpacity>
  );
}

export default function EventsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{
        headerShown: true,
        headerTitle: () => <Heading header='Helm' />,
        headerRight: () => <NotificationsButton />,
        headerStyle: {
          backgroundColor: '#f8f8f8'
        },
        headerShadowVisible: false,
        headerBackVisible: false,
      }}/>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="host" options={{ headerShown: false }} />
    </Stack>
  );
}


// import Heading from '@/components/Heading';
// import { Ionicons } from '@expo/vector-icons';
// import { Stack, useRouter } from 'expo-router';
// import React from 'react';
// import { TouchableOpacity, View } from 'react-native';

// function NotificationsButton() {
//   const router = useRouter();
  

//   const handlePress = () => {
//     router.push('/notifications');
//   };

//   return (
//     <TouchableOpacity onPress={handlePress} className='mr-5 p-1.5 border border-zinc-400 rounded-lg'>
//       <View className='hidden absolute right-2 top-2 h-4 w-4 rounded-full bg-orange-600'></View>
//       <Ionicons name="notifications-outline" size={28} color="black" />
//     </TouchableOpacity>
//   );
// }

// export default function EventsLayout() {
//   return (
//     <Stack screenOptions={{
//         headerShown: false,
//         headerTitle: () => <Heading header='Helm' />,
//         headerRight: () => <NotificationsButton />,
//         headerStyle: {
//           backgroundColor: '#f8f8f8',
//           shadowOpacity: 0,
//           shadowOffset: { height: 0, width: 0 },
//           shadowRadius: 0,
//           elevation: 0, 
//           borderBottomWidth: 0,
//           height: 100
//         },
//         headerShadowVisible: false,
//         // headerTransparent: true,
//       }} >
//     </Stack>
//   );
// }