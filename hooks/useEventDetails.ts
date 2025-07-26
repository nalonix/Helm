// src/hooks/useEventDetails.ts
import { supabase } from '@/lib/supabase'; // Adjust this import path as needed
import { useQuery } from '@tanstack/react-query';

// Define the Event interface (UNCHANGED - NO 'rsvp' PROPERTY HERE)
export interface Event {
  id: string; // Assuming UUID or string ID
  title: string;
  description?: string | null;
  date: string; // e.g., 'YYYY-MM-DD'
  start_time: string; // e.g., 'HH:MM:SS'
  end_time?: string | null; // e.g., 'HH:MM:SS'
  poster?: string | null; // URL or path to storage
  host: string; // User ID of the host
  created_at: string;
  updated_at?: string | null;
  // Add any other columns from your 'events' table
}

// Define the UserRsvp type (remains the same)
export type UserRsvp = {
  response: 'Going' | 'May Be' | 'Not Going';
  message?: string | null;
  ticket_id?: string | null;
  checked_in?: boolean | null;
  // Add other RSVP fields if you fetch them (e.g., created_at, updated_at)
};

export type EventDetails = Event & { rsvp: UserRsvp | null };

// Async function to fetch a single event by its ID and the current user's RSVP
// The return type is an inline intersection type: Event & { rsvp: UserRsvp | null }
const fetchEventAndUserRsvp = async (
  eventId: string
): Promise<(Event & { rsvp: UserRsvp | null }) | null> => {
  if (!eventId) {
    return null;
  }

  // 1. Fetch event details
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (eventError) {
    if (eventError.code === 'PGRST116') { // "No rows found" error code
      return null;
    }
    console.error('Error fetching event details:', eventError);
    throw new Error(eventError.message || 'Failed to load event details.');
  }

  // If event not found, return early
  if (!eventData) {
    return null;
  }

  // 2. Get the current authenticated user's ID
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  let currentUserRsvp: UserRsvp | null = null;

  // 3. If a user is logged in, fetch their RSVP for this event
  if (currentUserId) {
    const { data: rsvpData, error: rsvpError } = await supabase
      .from('rsvp')
      .select('response, message, ticket_id, checked_in') // Select only the relevant RSVP fields
      .eq('user_id', currentUserId)
      .eq('event_id', eventId)
      .single();

    if (rsvpError && rsvpError.code !== 'PGRST116') {
      console.error('Error fetching user RSVP:', rsvpError);
    } else if (rsvpData) {
      currentUserRsvp = rsvpData as UserRsvp;
    }
  }

  // 4. Return the combined data as the desired inline intersection type
  return {
    ...(eventData as Event), // Spread the event data (cast to Event)
    rsvp: currentUserRsvp,    // Add the rsvp property
  };
};


/**
 * Custom hook to fetch details for a specific event, including the current user's RSVP status.
 * The returned data will be an Event object with an additional 'rsvp' property.
 *
 * @param eventId The ID of the event to fetch.
 * @returns An object containing `data` (Event with rsvp, or null), `isLoading`, `isError`, and `error`.
 */
export const useEventDetails = (eventId: string | undefined) => {
  return useQuery<(EventDetails) | null, Error>({ // Use the inline intersection type here
    queryKey: ['eventDetails', eventId],
    queryFn: () => fetchEventAndUserRsvp(eventId as string),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });
};
