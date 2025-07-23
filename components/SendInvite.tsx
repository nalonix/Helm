import useDebounce from '@/hooks/useDebounce';
import { addNotification } from '@/lib/db/notifications';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; // Import useMutation and useQueryClient
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'; // Import Alert for feedback

// Type for a user profile returned by your search query
interface UserProfile {
  id: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  is_invited: boolean; // Confirmed to be boolean from fetch function
}

// Interface for the payload to send to the invitations table
interface InvitePayload {
  user_id: string;
  event_id: string;
}

// Function to send the invitation
const sendInvitation = async (payload: InvitePayload) => {
  const { data, error } = await supabase
    .from('invitations')
    .insert([payload]) // Insert the new invitation record
    .select(); // Select the inserted data to confirm

  if (error) {
    console.error('Supabase invitation error:', error);
    throw new Error(error.message || 'Failed to send invitation');
  }

  addNotification({
    message: `You have received an invitation.`,
    type: "invitation",
    event_id: payload.event_id,
    user_id: payload.user_id
  })

  return data;
};

// Function to fetch users and invitation status (remains the same)
const fetchUsersAndInvitationStatus = async (
  username: string | null,
  eventId: string
): Promise<UserProfile[]> => {
  if (!username || username.length < 3) {
    return [];
  }
  if (!eventId) {
    console.warn("Event ID is missing. Cannot determine invitation status for users.");
    return [];
  }


  // Logged in host user 
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Authentication error:', authError);
    throw new Error("Not authenticated or current user ID not found.");
  }


  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .ilike('username', `%${username}%`)
    .neq('id', user.id);
    

  if (profilesError) {
    console.error('Supabase profile search error:', profilesError);
    throw new Error(profilesError.message || 'Failed to search users');
  }

  if (!profilesData || profilesData.length === 0) {
    return [];
  }

  const foundProfileIds = profilesData.map(p => p.id);

  const { data: invitationsData, error: invitationsError } = await supabase
    .from('invitations')
    .select('user_id')
    .eq('event_id', eventId)
    .in('user_id', foundProfileIds);

  if (invitationsError) {
    console.error('Supabase invitations fetch error:', invitationsError);
    throw new Error(invitationsError.message || 'Failed to fetch specific invitations');
  }

  const invitedUserIds = new Set(
    (invitationsData || []).map((inv: { user_id: string }) => inv.user_id)
  );

  const usersWithStatus: UserProfile[] = profilesData.map(profile => ({
    ...profile,
    is_invited: invitedUserIds.has(profile.id),
  }));


  return usersWithStatus;
};


export default function UserSearchScreen() {
  const { id: eventId } = useLocalSearchParams(); // eventId will be string | string[] | undefined

  // Ensure eventId is a string for the fetch functions and mutation
  const currentEventId = typeof eventId === 'string' ? eventId : undefined;

  const [usernameSearchTerm, setUsernameSearchTerm] = useState('');
  const debouncedUsername = useDebounce(usernameSearchTerm, 500);

  const queryClient = useQueryClient(); // Initialize TanStack Query client

  // Query for searching users
  const {
    data: searchResults,
    isLoading,
    isError,
    error,
  } = useQuery<UserProfile[], Error>({
    queryKey: ['usersWithInvitationStatus', debouncedUsername, currentEventId],
    queryFn: () => fetchUsersAndInvitationStatus(debouncedUsername, currentEventId as string), // Cast as string here as enabled check handles `undefined`
    enabled: debouncedUsername.length >= 3 && !!currentEventId, // Enable only if search term and eventId are valid
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2,
  });

  // Mutation for sending invitations
  const {
    mutate: inviteUser, // Function to call the mutation
    isPending: isInviting, // Loading state for the mutation
  } = useMutation({
    mutationFn: sendInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['usersWithInvitationStatus', debouncedUsername, currentEventId],
      });
      Alert.alert('Success', 'Invitation sent!');
    },
    onError: (err) => {
      Alert.alert('Error', `Failed to send invitation: ${err.message}`);
    },
  });


  return (
    <View className='flex-1 p-2'>
      <View className='flex flex-row gap-3 items-end mb-4'>
        <Feather name="users" size={32} color="black" />
        <Text className='text-3xl font-semibold'>Invite</Text>
      </View>

      <TextInput
        className='border border-gray-300 rounded-lg p-3 text-base mb-4'
        placeholder="Search username..."
        value={usernameSearchTerm}
        onChangeText={setUsernameSearchTerm}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Loading indicator for the search query */}
      {isLoading && debouncedUsername.length >= 3 && (
        <ActivityIndicator size="small" color="#0000ff" className='mb-2' />
      )}

      {/* Error message for the search query */}
      {isError && (
        <Text className='text-red-500 mb-2'>Error searching users: {error?.message}</Text>
      )}

      {/* Display search results using FlatList */}
      {searchResults && searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className='bg-white rounded-2xl mb-2 shadow-sm border border-zinc-200 flex-row items-center overflow-hidden'>
              <View className='flex flex-row'>
                <View className='p-0.5'>
                  {item.avatar_url ? (
                    <Avatar url={item.avatar_url} />
                  ) : (
                    <AvatarPlaceHolder />
                  )}
                </View>
                <View className='flex-1 justify-center p-2'>
                  {item.full_name && <Text className='text-lg font-semibold'>{item.full_name}</Text>}
                  <Text className='text-gray-600 font-semibold'>@{item.username}</Text>
                </View>
                {/* Conditional rendering for Invited/Invite button */}
                {item.is_invited ? (
                  <View className='flex items-center justify-center aspect-square h-full bg-green-50'>
                    <Feather name="check-circle" size={24} color="green" />
                  </View>
                ) : (
                  <TouchableOpacity
                    className='flex items-center justify-center aspect-square h-full bg-blue-50'
                    onPress={() => {
                      if (currentEventId && item.id && !isInviting) { // Ensure data is ready and not already inviting
                        inviteUser({ user_id: item.id, event_id: currentEventId });
                      } else if (!currentEventId) {
                          Alert.alert("Error", "Event ID not found to send invitation.");
                      }
                    }}
                    disabled={isInviting || !currentEventId} // Disable button if inviting or if eventId is missing
                  >
                    {isInviting ? ( // Show activity indicator if an invitation is being sent
                      <ActivityIndicator size="small" color="blue" />
                    ) : (
                      <Feather name="send" size={24} color="blue" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text className='text-gray-500 text-center mt-4'>
              No users found with that username.
            </Text>
          }
        />
      ) : debouncedUsername.length >= 3 && !isLoading && !isError ? (
        <Text className='text-gray-500 text-center mt-4'>No users found with that username.</Text>
      ) : (
        <Text className='text-gray-500 text-center mt-4'>Start typing to search for users.</Text>
      )}
    </View>
  );
}


function AvatarPlaceHolder(){
  return(
    <View className='bg-zinc-400 h-12 w-12 m-2 rounded-full'>
    </View>
  )
}


function Avatar({ url }: {url : string}){
  return(
    <Image
      source={{ uri: supabase.storage.from('avatars').getPublicUrl(url).data.publicUrl }}
      style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
    />
  )
}