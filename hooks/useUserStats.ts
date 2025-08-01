import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export const useUserStats = (userId: string) => {
  const fetchStats = async () => {
    const hostedEvents = await supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('host_id', userId);

    const attendedEvents = await supabase
      .from('rsvp')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('check_in', true);

    const invitations = await supabase
      .from('invitations')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    return {
      hostedEvents: hostedEvents.count,
      attendedEvents: attendedEvents.count,
      invitations: invitations.count,
    };
  };

  return useQuery({
    queryKey: ['userStats', userId],
    queryFn: fetchStats,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });
};