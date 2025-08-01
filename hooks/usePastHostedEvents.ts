import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export const usePastHostedEvents = (userId: string) => {
  const fetchPastEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('host_id', userId)
      .lt('event_date', new Date().toISOString());

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  return useQuery({
    queryKey: ['pastHostedEvents', userId],
    queryFn: fetchPastEvents,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });
};
