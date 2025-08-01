import Heading from "@/components/Heading";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router"; // Import Stack
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

// NotificationsButton component
function NotificationsButton() {
  const router = useRouter();
  const { unreadCount } = useUnreadNotificationsCount(); // Use the hook to get the count

  const handlePress = () => {
    router.push("/notifications");
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="mr-5 p-1.5 border border-zinc-400 rounded-lg relative"
    >
      {unreadCount && unreadCount > 0 && (
        <View className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-orange-600 z-10 flex items-center justify-center">
          <Text className="text-white text-xs font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Text>
        </View>
      )}
      <Ionicons name="notifications-outline" size={28} color="black" />
    </TouchableOpacity>
  );
}

export default function EventsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: () => <Heading header="Helm" />,
          headerRight: () => <NotificationsButton />,
          headerStyle: {
            backgroundColor: "#f8f8f8",
          },
          headerShadowVisible: false,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{ headerShown: false, animation: "fade_from_bottom" }}
      />
      <Stack.Screen
        name="host/[id]"
        options={{ headerShown: false, animation: "fade_from_bottom" }}
      />
    </Stack>
  );
}
