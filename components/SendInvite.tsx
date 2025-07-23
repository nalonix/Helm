import useDebounce from '@/hooks/useDebounce';
import { supabase } from '@/lib/supabase'; // Adjust this import path as needed
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Type for a user profile returned by your search query
interface UserProfile {
  id: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  is_invited?: boolean;
}


// Function to fetch users from Supabase by username
const fetchUsersByUsername = async (username: string | null, eventId: string): Promise<UserProfile[]> => {
  
  if (!username || username.length < 3) {
    return [];
  }



  // Query your 'profiles' table for matching usernames
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url') 
    .ilike('username', `%${username}%`); 

  if (error) {
    console.error('Supabase username search error:', error);
    throw new Error(error.message || 'Failed to search users by username');
  }

  return data as UserProfile[];
};


export default function UserSearchScreen() {
  const { id: eventId } = useLocalSearchParams();

  const [usernameSearchTerm, setUsernameSearchTerm] = useState('');
  const debouncedUsername = useDebounce(usernameSearchTerm, 500); 

  const {
    data: searchResults,
    isLoading,
    isError,
    error,
  } = useQuery<UserProfile[], Error>({
    queryKey: ['usersSearchByUsername', debouncedUsername],
    queryFn: () => fetchUsersByUsername(debouncedUsername, eventId as string),
    enabled: debouncedUsername.length >= 3,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2,
  });

  return (
    <View className='flex-1 p-2'>
      <View className='flex flex-row gap-2 items-end mb-4'>
        <Ionicons name="people-outline" size={32} color="black" />
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

      {/* Loading */}
      {isLoading && debouncedUsername.length >= 3 && (
        <ActivityIndicator size="small" color="#0000ff" className='mb-2' />
      )}

      {/* Error */}
      {isError && (
        <Text className='text-red-500 mb-2'>Error searching users: {error?.message}</Text>
      )}

      {/* Display search results using FlatList */}
      {searchResults && searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className='bg-white p-3 rounded-lg mb-2 shadow-sm border border-zinc-200 flex-row items-center'
              onPress={() => {
                // TODO: Implement what happens when a user is selected.
                // E.g., navigate to their profile, show an invite modal, etc.
                console.log('Selected user:', item.username);
                alert(`You selected: ${item.username}`);

              }}
            >
              {/* Optional: Display user avatar */}
              {item.avatar_url && (
                <Image
                  source={{ uri: supabase.storage.from('avatars').getPublicUrl(item.avatar_url).data.publicUrl }}
                  style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                />
              )}
              <View className='flex-1'>
                <Text className='text-lg font-semibold'>{item.username}</Text>
                {item.full_name && <Text className='text-sm text-gray-600'>{item.full_name}</Text>}
              </View>
              {/* Optional: Add an action button like "Add" or "Invite" */}
              <Ionicons name="person-add-outline" size={24} color="blue" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text className='text-gray-500 text-center mt-4'>
              No users found with that username.
            </Text>
          }
        />
      ) : debouncedUsername.length >= 3 && !isLoading && !isError ? (
        // Message when search is active but no results found
        <Text className='text-gray-500 text-center mt-4'>No users found with that username.</Text>
      ) : (
        // Initial state or when search term is too short
        <Text className='text-gray-500 text-center mt-4'>Start typing to search for users.</Text>
      )}
    </View>
  );
}
