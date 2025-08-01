import { supabase } from '@/lib/supabase'; // Adjust import path
import { useAuth } from '@/providers/AuthProvider'; // Assuming you have an AuthProvider
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';

// Define the structure of a notification record
interface Notification {
  id: string; // UUID from the database
  user_id: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  event_id: number;
  // Add any other fields from your notifications table
}

// --- Data Fetching Function ---
const fetchUserNotifications = async (userId: string): Promise<Notification[]> => {
  if (!userId) {
    return [];
  }
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId) // Fetch only notifications for the current user
    .order('created_at', { ascending: false }); // Show newest first

  if (error) {
    console.error('Error fetching notifications:', error);
    throw new Error(error.message || 'Failed to load notifications.');
  }
  return data as Notification[];
};

// --- Mutation to Mark Notification as Read ---
const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) {
    console.error('Error marking notification as read:', error);
    throw new Error(error.message || 'Failed to mark notification as read.');
  }
  return data;
};

// --- Main Notifications Component ---
export default function NotificationsScreen() {
  const { user } = useAuth(); // Get the current user from your AuthContext
  const userId = user?.id;
  const queryClient = useQueryClient(); // Get the query client for cache manipulation
  const router = useRouter();
  
  // Query to fetch user's notifications
  const {
    data: notifications,
    isLoading,
    isError,
    error,
  } = useQuery<Notification[], Error>({
    queryKey: ['userNotifications', userId], // Query key includes userId
    queryFn: () => fetchUserNotifications(userId!),
    enabled: !!userId, // Only run query if userId is available
    staleTime: 1000 * 60, // Consider data stale after 1 minute
  });

  // Mutation to mark a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (updatedNotification) => {
      // Optimistically update the cache or invalidate to refetch
      queryClient.setQueryData<Notification[]>(
        ['userNotifications', userId],
        (oldData) => {
          return (oldData || []).map((notif) =>
            notif.id === updatedNotification.id ? { ...notif, read: true } : notif
          );
        }
      );
      // Also invalidate the unread count query to update the indicator
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount', userId] });
    },
    onError: (err) => {
      Alert.alert('Error', `Could not mark notification as read: ${err.message}`);
    },
  });

  // --- Realtime Subscription Effect ---
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications_for_user_${userId}`) // Unique channel for this user
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`, // Only listen for changes relevant to this user
        },
        (payload) => {
          console.log('Realtime notification change:', payload);
          queryClient.setQueryData<Notification[]>(
            ['userNotifications', userId],
            (oldData) => {
              const currentNotifications = oldData || [];
              switch (payload.eventType) {
                case 'INSERT':
                  // Add new notification to the top of the list
                  return [payload.new as Notification, ...currentNotifications];
                case 'UPDATE':
                  // Update an existing notification
                  return currentNotifications.map((notif) =>
                    notif.id === payload.new.id ? (payload.new as Notification) : notif
                  );
                case 'DELETE':
                  // Remove a deleted notification
                  return currentNotifications.filter(
                    (notif) => notif.id !== payload.old?.id
                  );
                default:
                  return currentNotifications;
              }
            }
          );
          // Invalidate the unread count query on any change to ensure indicator updates
          queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount', userId] });
        }
      )
      .subscribe();

    // Cleanup function for the subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]); // Re-subscribe if userId changes

  // --- Render Logic ---
  return (
    <View className="flex-1 p-4 bg-gray-50">
      {isLoading ? (
        <ActivityIndicator size="large" color="#FF4D00" className="mt-10" />
      ) : isError ? (
        <Text className="text-red-600 text-center mt-5 text-base">
          Error: {error?.message || 'Failed to load notifications.'}
        </Text>
      ) : notifications?.length === 0 ? (
        <Text className="text-gray-500 text-center mt-10 text-base">
          You have no notifications yet.
        </Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item.id}
              className={`p-4 rounded-lg mb-3 shadow-sm ${
                item.read ? 'bg-gray-200' : 'bg-white border-l-4 border-blue-500'
              }`}
              onPress={() => {
                // Mark as read if not already read
                if (!item.read) {
                  markAsReadMutation.mutate(item.id);
                }



                if(item.type == 'invitation'){
                  router.push(`/(app)/view/${item.event_id}`)
                }else if(item.type == 'rsvpupdate'){
                  router.push(`/(app)/(tabs)/events/host/${item.event_id}/manage`)
                }
              }}
            >
              <Text className={`text-base ${item.read ? 'text-gray-600' : 'font-semibold text-gray-800'}`}>
                {item.message}
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
