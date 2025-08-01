import UserCard from "@/components/UserCard";
import { useHostEvent } from "@/providers/HostEventProvider";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRScanner from "../_components/QRScanner";

export default function Guest() {
  const { id } = useLocalSearchParams();
  const { hostEventData } = useHostEvent();

  // Filter checked-in users
  const checkedInUsers = (hostEventData?.rsvps || []).filter(
    (rsvp) => rsvp.checked_in
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100 px-5">
      <View className="p-2">
        <QRScanner />
      </View>
      <View className="flex flex-col mt-4">
        <Text className="text-xl font-bold mb-2">Checked In</Text>
        <FlatList
          data={checkedInUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const userName =
              item.profiles?.full_name ||
              item.profiles?.username ||
              "Unknown User";
            const avatarUrl = item.profiles?.avatar_url || null;

            return <UserCard name={userName} avatarUrl={avatarUrl} />;
          }}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center mt-10">
              <Text className="text-lg italic text-gray-500">
                No users have checked in yet.
              </Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }} // Ensure last content isn't cut off
        />
      </View>
    </SafeAreaView>
  );
}