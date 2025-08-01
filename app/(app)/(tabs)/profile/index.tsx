import ProfilePic from '@/components/ProfilePic';
import { usePastHostedEvents } from '@/hooks/usePastHostedEvents';
import { useUserStats } from '@/hooks/useUserStats';
import { supabase } from "@/lib/supabase";
import { useAuth } from '@/providers/AuthProvider';
import { Feather } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Switch, Text, View } from 'react-native';

// Assuming you have a type for your user profile from Supabase
interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  public: boolean; // Add the 'public' field to your UserProfile type
}

// --- Supabase Database Function (Modularized, outside the component) ---

/**
 * Updates the 'public' column of a user's profile in the 'profiles' table.
 * @param userId The ID of the user whose profile to update.
 * @param isPublic The new public status (boolean).
 * @returns The updated profile data.
 */
async function updateProfileVisibility(userId: string, isPublic: boolean) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ public: isPublic })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile visibility:", error.message);
    throw new Error(`Failed to update profile visibility: ${error.message}`);
  }
  return data;
}

// --- Component ---

export default function index() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Redirect if user is not logged in
  if (!user?.id) {
    router.push("/(auth)");
    return null;
  }

  // Fetch user stats and past events
  const { data: stats, isLoading: statsLoading } = useUserStats(user?.id);
  const { data: pastEvents, isLoading: pastEventsLoading } = usePastHostedEvents(user?.id);

  const [isProfilePublic, setIsProfilePublic] = useState(true);

  // Effect to set the initial state of the toggle based on the user's profile 'public' field
  useEffect(() => {
    // Assuming your `user` object from `useAuth` contains the 'public' field.
    if (user && typeof user.public === 'boolean') {
      setIsProfilePublic(user.public);
    }
  }, [user]);

  // Mutation for updating profile visibility
  const profileVisibilityMutation = useMutation<UserProfile, Error, boolean>({
    mutationFn: async (newIsPublicStatus: boolean) => {
      if (!user?.id) {
        throw new Error("User ID is missing. Cannot update profile.");
      }
      return await updateProfileVisibility(user.id, newIsPublicStatus);
    },
    onMutate: async (newIsPublicStatus) => {
      // Optimistically update the UI
      setIsProfilePublic(newIsPublicStatus);
      // You could also optimistically update the `user` object in your AuthProvider's state
      // if it offers such a method. For example:
      // if (user) {
      //   const updatedUser = { ...user, public: newIsPublicStatus };
      //   // Assuming your AuthProvider has a method like `updateUser`
      //   // authContext.updateUser(updatedUser);
      // }
    },
    onError: (err, newIsPublicStatus) => {
      // Revert the UI state on error
      setIsProfilePublic(!newIsPublicStatus);
      Alert.alert("Error", `Failed to update profile visibility: ${err.message}`);
    },
    onSettled: () => {
      // Invalidate the query that fetches user data or profile data
      // This will refetch the latest 'public' status from the database.
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] }); // If useAuth also refreshes the user object
    },
  });

  // Main loading check for initial data fetches
  if (statsLoading || pastEventsLoading) {
    return (
      <View className='flex-1 items-center justify-center overflow-hidden'>
        <ActivityIndicator size="large" color="#BB4017" />
      </View>
    );
  }

  const renderHeader = () => (
    <View className='flex items-center justify-center gap-4 p-2 pt-10'>
      {/* Profile Pic */}
      {
        user?.avatar_url ? (
          <ProfilePic avatarUrl={user.avatar_url} userId={user.id} />
        ) : (
          <ProfilePic placeHolder userId={user.id} />
        )
      }

      {/* User Info */}
      <View className='flex flex-col items-center gap-1'>
        <Text className='text-4xl font-bold'>{user?.full_name}</Text>
        <Text className='text-lg text-zinc-600'>{user?.username}</Text>
      </View>

      {/* Visibility Switch */}
      <View className='w-full flex flex-col gap-2 mt-4 p-3 shadow-sm bg-white rounded-lg'>
        <View className='w-full flex flex-row justify-between items-center'>
          <Text className='text-xl font-semibold'>Public Profile</Text>
          {/* Conditional rendering for the ActivityIndicator only around the Switch */}
          {profileVisibilityMutation.isPending ? (
            <ActivityIndicator size="small" color="#BB4017" />
          ) : (
            <Switch
              value={isProfilePublic}
              onValueChange={(value) => profileVisibilityMutation.mutate(value)}
              trackColor={{ false: "#767577", true: "#BB4017" }}
              thumbColor={isProfilePublic ? "#f4f3f4" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
            />
          )}
        </View>
        <Text className='font-light text-lg text-black/90'>Turn off to hide your account from invitation searches.</Text>
      </View>

      {/* User Stats */}
      <View className='flex flex-row items-center gap-2 px-2 mt-6'>
        <StatCard label={"Hosted"} value={stats?.hostedEvents} />
        <StatCard label={"Attended"} value={stats?.attendedEvents} />
        <StatCard label={"Invites"} value={stats?.invitations} />
      </View>

      <View className='flex w-full pt-4'>
        <Text className='text-zinc-700 text-xl font-semibold'>Past Events</Text>
      </View>
    </View>
  );

  return (
    <View className='flex-1 px-4'>
      <FlatList
        data={pastEvents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className='mb-4 p-4 h-20 bg-white rounded-lg shadow-sm'>
            <Text className='text-lg'>
              {item.name} - {new Date(item.event_date).toLocaleDateString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className='flex-1 items-center justify-center gap-2 py-12'>
            <Feather name="alert-circle" size={36} color="gray" />
            <Text className='text-gray-500 text-lg'>No past events found.</Text>
            <View className='h-16' />
          </View>
        )}
        ListHeaderComponent={renderHeader}
      />
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <View className='flex-1 flex-col items-center justify-center'>
      <Text className='text-5xl font-semibold'>{value ? value : 0}</Text>
      <Text className='text-xl font-bold'>{label}</Text>
    </View>
  );
}