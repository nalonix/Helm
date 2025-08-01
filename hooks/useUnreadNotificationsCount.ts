import { supabase } from '@/lib/supabase'; // Adjust this path as necessary
import { useAuth } from '@/providers/AuthProvider'; // Assuming you have an AuthProvider
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * Hook to fetch and subscribe to the count of unread notifications for the current user.
 * It uses TanStack Query for caching and Supabase Realtime for live updates.
 */
export const useUnreadNotificationsCount = () => {
  const { user } = useAuth(); // Get the current user from your AuthContext
  const userId = user?.id;
  const queryClient = useQueryClient(); // Get the query client for cache manipulation

  // --- Query to fetch the initial unread count ---
  const { data: unreadCount, isLoading, isError, error } = useQuery<number, Error>({
    queryKey: ['unreadNotificationsCount', userId], // Unique query key including userId
    queryFn: async () => {
      if (!userId) {
        return 0; // Return 0 if no user is logged in
      }
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true }) // Efficiently get only the count
        .eq('user_id', userId)
        .eq('read', false); // Count only unread notifications

      if (error) {
        console.error('Error fetching unread notifications count:', error);
        throw new Error(error.message || 'Failed to load unread count.');
      }
      return count || 0;
    },
    enabled: !!userId, // Only run this query if userId is available
    staleTime: 1000 * 10, // Consider count stale after 10 seconds
    // cacheTime: 1000 * 60 * 5, // Keep cached data for 5 minutes
  });

  // --- Realtime Subscription for live updates ---
  useEffect(() => {
    if (!userId) return;

    // Subscribe to changes in the 'notifications' table for this user
    const channel = supabase
      .channel(`unread_notifications_count_${userId}`) // Unique channel name per user
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`, // Only listen for changes relevant to this user
        },
        (payload) => {
          // console.log('Realtime unread count change detected:', payload);
          // Invalidate the query to trigger a refetch of the unread count
          // This will ensure the indicator updates correctly for new, updated (read status), or deleted notifications.
          queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount', userId] });
          queryClient.invalidateQueries({ queryKey: ['userNotifications', userId] }); // Also invalidate the full list
        }
      )
      .subscribe();

    // Cleanup function: Unsubscribe from the channel when the component unmounts or userId changes
    return () => {
      supabase.removeChannel(channel);
      // console.log(`Unsubscribed from unread_notifications_count_${userId}`);
    };
  }, [userId, queryClient]); // Re-run effect if userId or queryClient instance changes

  return {
    unreadCount,
    isLoading,
    isError,
    error,
  };
};
