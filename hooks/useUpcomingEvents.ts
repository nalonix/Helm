// hooks/useUpcomingEvents.ts
import { supabase } from '@/lib/supabase'; // Assuming your Supabase client is here
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';

interface RSVP {
  id: number;
  response: string | null;
  event_id: number;
  user_id: string; 
  comment: string;
}
// Define a type for your event data for better type safety
interface Event {
  id: string; // Assuming your event IDs are strings (e.g., UUIDs from Supabase)
  title: string;
  description?: string; // Optional as per your schema
  date: string; // Assuming 'YYYY-MM-DD' format or similar
  start_time: string; // Assuming 'HH:MM' or 'HH:MM:SS' format
  end_time: string;
  poster?: string;
  creator_id: string;
  hosting: boolean;
  rsvp: RSVP;

  // Add any other fields from your 'events' table as needed
}

type UpComingEvents = Event & {
  rsvp?: RSVP;
  hosting: boolean;
}



// Function to fetch upcoming events
const fetchMyUpcomingEvents = async (userId: string): Promise<UpComingEvents[]> => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const todayDateString = `${year}-${month}-${day}`;

  // Fetch hosted events
  const { data: hostedData, error: hostedError } = await supabase
    .from('events')
    .select('*')
    .eq('host', userId)
    .gte('date', todayDateString)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (hostedError) {
    console.error('Error fetching hosted events:', hostedError);
    throw new Error(hostedError.message);
  }


  // Prepare hostedEvents
  const hostedEvents: UpComingEvents[] = (hostedData ?? []).map((event) => ({
    ...event,
    hosting: true,
  }));

  // Fetch RSVP’d
  const { data: rsvpdData, error: rsvpError } = await supabase
    .from('rsvp')
    .select('event_id, response, events(*)')
    .eq('user_id', userId)
    .gte('events.date', todayDateString);

  
  if (rsvpError) {
    console.error('Error fetching RSVP events:', rsvpError);
    throw new Error(rsvpError.message);
  }

  // Prepare rsvpd events
  const rsvpdEvents: UpComingEvents[] = (rsvpdData ?? []).map((rsvpItem)=>{
    const { events, ...rsvp } = rsvpItem
    const event = Array.isArray(events) ? events[0] : events

    return {
      ...event,
      hosting: false,
      rsvp: rsvp
    }
  })

  // Merge
  const mergedEvents = [
    ...hostedEvents,
    ...rsvpdEvents,
  ];

  return mergedEvents;
};


// Custom hook to use in your components
export const useUpcomingEvents = () => {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery<Event[], Error>({
    queryKey: ['myUpcomingEvents', userId], 
    queryFn: () => fetchMyUpcomingEvents(userId!),
    staleTime: 1000 * 60 * 5, 
  });
};