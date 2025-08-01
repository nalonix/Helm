// src/hooks/useEventDetails.ts
import { supabase } from '@/lib/supabase'; // Adjust this import path as needed
import { Event as BaseEvent } from "@/types/eventTypes";
import { useQuery } from '@tanstack/react-query';

// Define the Event interface (UNCHANGED - NO 'rsvp' PROPERTY HERE)
export interface Event extends BaseEvent {
  // Additional properties specific to useEventDetails can be added here
  id: string; // Assuming UUID or string ID
  title: string;
  description?: string | null;
  date: string; // e.g., 'YYYY-MM-DD'
  start_time: string; // e.g., 'HH:MM:SS'
  end_time?: string | null; // e.g., 'HH:MM:SS'
  poster?: string | null; // URL or path to storage
  host: string; // User ID of the host
  is_closed: boolean;
   guest_list_preference: string; 
  created_at: string;
  updated_at?: string | null;
  address?: {
    name?: string | null;
    city?: string | null;
    country?: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
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
): Promise<(Event & { rsvp: UserRsvp | null; hostDetails: { full_name: string | null; username: string | null } | null }) | null> => {
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

  // 2. Fetch host details
  const { data: hostData, error: hostError } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', eventData.host)
    .single();

  if (hostError) {
    console.error('Error fetching host details:', hostError);
  }

  // 3. Get the current authenticated user's ID
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  let currentUserRsvp: UserRsvp | null = null;

  // 4. If a user is logged in, fetch their RSVP for this event
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

  // 5. Return the combined data as the desired inline intersection type
  return {
    ...(eventData as Event), // Spread the event data (cast to Event)
    rsvp: currentUserRsvp,    // Add the rsvp property
    hostDetails: hostData || null, // Add the host details
  };
};


/**
 * Custom hook to fetch details for a specific event, including the current user's RSVP status and host details.
 * The returned data will be an Event object with additional 'rsvp' and 'hostDetails' properties.
 *
 * @param eventId The ID of the event to fetch.
 * @returns An object containing `data` (Event with rsvp and hostDetails, or null), `isLoading`, `isError`, and `error`.
 */
  // TODO: Fix type pls

export const useEventDetails = (eventId: string | undefined) => {
  return useQuery<(EventDetails & { hostDetails: { full_name: string | null; username: string | null } | null }) | null, Error>({
    queryKey: ['eventDetails', eventId],
    queryFn: () => fetchEventAndUserRsvp(eventId as string),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });
};
