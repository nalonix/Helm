import UserCard from "@/components/UserCard";
import { useHostEvent } from "@/providers/HostEventProvider";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { SectionList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RSVP() {
  const { id } = useLocalSearchParams();
  const { hostEventData } = useHostEvent();
  

  // Ensure rsvps is an array, even if hostEventData or rsvps is null/undefined
  const rsvps = hostEventData?.rsvps || [];

  // Prepare data for SectionList based on actual RSVPs
  const goingUsers: { name: string; avatarUrl: string | null }[] = [];
  const notGoingUsers: { name: string; avatarUrl: string | null }[] = [];
  const maybeUsers: { name: string; avatarUrl: string | null }[] = [];

  rsvps.forEach((rsvp) => {
    // Fallback for user name in case full_name or username is missing
    const userName =
      rsvp.profiles?.full_name || rsvp.profiles?.username || "Unknown User";
    const avatarUrl = rsvp.profiles?.avatar_url || null; // Get avatar URL if available

    const user = { name: userName, avatarUrl };

    if (rsvp.response === "Going") {
      goingUsers.push(user);
    } else if (rsvp.response === "Not Going") {
      notGoingUsers.push(user);
    } else if (rsvp.response === "May Be") {
      maybeUsers.push(user);
    }
  });

  // Define the sections for the SectionList
  const sections = [
    {
      title: `Going`,
      data: goingUsers,
      color: "text-blue-600", // NativeWind color class for header
      emptyMessage: "No one has responded 'Going' yet.",
    },
    {
      title: `Not Going`,
      data: notGoingUsers,
      color: "text-red-600", // NativeWind color class for header
      emptyMessage: "No one has responded 'Not Going' yet.",
    },
    {
      title: `Maybe`,
      data: maybeUsers,
      color: "text-yellow-600", // NativeWind color class for header
      emptyMessage: "No one has responded 'Maybe' yet.",
    },
  ];

  // Filter sections to only show those with data OR a specific empty message.
  // This ensures we don't show completely irrelevant sections if no one has responded at all.
  const filteredSections = sections.filter(
    (section) =>
      section.data.length > 0 ||
      (section.data.length === 0 && section.emptyMessage)
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100 px-5">
      <SectionList
        sections={filteredSections}
        keyExtractor={(item, index) => item.name + index} // Unique key for each item
        renderSectionHeader={({ section: { title, data, color } }) => (
          // Render header with count
          <View className="bg-white rounded-t-lg px-4 pt-4 pb-2 mb-1 border-b border-gray-200">
            <Text className={`text-xl font-bold ${color}`}>
              {title} ({data.length})
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          // Render individual user card

          <UserCard name={item.name} avatarUrl={item.avatarUrl} />
        )}
        ListEmptyComponent={() => (
          // Component to show if the entire SectionList has no sections after filtering
          <View className="flex-1 items-center justify-center mt-10">
            <Text className="text-lg italic text-gray-500">
              No RSVPs recorded for this event yet.
            </Text>
          </View>
        )}
        renderSectionFooter={({ section: { data, emptyMessage } }) => {
          // Render the empty message for a section if it has no data
          if (data.length === 0 && emptyMessage) {
            return (
              <View className="bg-white rounded-b-lg px-4 pb-4 pt-2 shadow-sm mb-4">
                <Text className="text-base italic text-gray-500">
                  {emptyMessage}
                </Text>
              </View>
            );
          }
          return null; // Don't render anything if neither condition met
        }}
        contentContainerStyle={{ paddingBottom: 20 }} // Ensure last content isn't cut off
      />
    </SafeAreaView>
  );
}
