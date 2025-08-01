import UserCard from "@/components/UserCard";
import { useHostEvent } from "@/providers/HostEventProvider";
import React, { useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Invitations() {
  const { hostEventData } = useHostEvent();

  // Ensure invitations is an array, even if hostEventData or invitations is null/undefined
  const invitations = hostEventData?.invitations || [];

  // State for search input
  const [searchQuery, setSearchQuery] = useState("");

  // Filter invitations based on search query
  const filteredInvitations = invitations.filter((invitation) => {
    const userName =
      invitation.profiles?.full_name ||
      invitation.profiles?.username ||
      "Unknown User";
    return userName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-100 px-5">
      <TextInput
        className="bg-white px-4 py-2 rounded-lg text-lg shadow-sm mb-4 border border-gray-300"
        placeholder="Search invited users..."
        placeholderTextColor={"#9a9c9a"}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredInvitations}
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
              No invitations found.
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }} // Ensure last content isn't cut off
      />
    </SafeAreaView>
  );
}