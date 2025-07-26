// src/hooks/useHostEventData.ts
import { supabase } from '@/lib/supabase'; // Adjust this import path as needed
import { useQuery } from '@tanstack/react-query';
import { Event } from './useEventDetails'; // Import the base Event interface (it remains pure)

// Define the structure for an individual RSVP record from the host's perspective
// This includes all columns from the rsvp table, plus potentially joined user data
export type HostRsvp = {
  id: string; // Assuming rsvp table has its own primary key 'id'
  user_id: string;
  event_id: string;
  response: 'Going' | 'May Be' | 'Not Going';
  message?: string | null;
  ticket_id: string;
  checked_in: boolean;
  checked_in_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  profiles?: { // Assuming a foreign key relationship to public.profiles
    username: string;
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

// Define the comprehensive data structure for the host's event view
export type HostEventData = {
  event: Event;
  rsvps: HostRsvp[]; // An array of all RSVPs for this event
};

// Async function to fetch event details and all associated RSVPs
const fetchHostEventAndRsvps = async (eventId: string): Promise<HostEventData | null> => {
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
    if (eventError.code === 'PGRST116') { // "No rows found"
      return null;
    }
    console.error('Error fetching event details for host:', eventError);
    throw new Error(eventError.message || 'Failed to load event details for host.');
  }

  if (!eventData) {
    return null; // Event not found
  }

  // 2. Fetch all RSVPs for this event, including profile data for the user who RSVP'd
  const { data: rsvpsData, error: rsvpsError } = await supabase
    .from('rsvp')
    .select(`
      *,
      profiles (
        username,
        full_name,
        avatar_url
      )
    `) // Select all rsvp columns and specific profile columns
    .eq('event_id', eventId); // Filter by the current event ID

  if (rsvpsError) {
    console.error('Error fetching RSVPs for event:', rsvpsError);
    throw new Error(rsvpsError.message || 'Failed to load RSVPs for event.');
  }

  // Combine the fetched data
  const combinedData: HostEventData = {
    event: eventData as Event,
    rsvps: rsvpsData as HostRsvp[], // Cast to HostRsvp[]
  };

  return combinedData;
};

/**
 * Custom hook to fetch comprehensive data for an event from the host's perspective,
 * including event details and all associated RSVPs.
 *
 * @param eventId The ID of the event to fetch.
 * @returns An object containing `data` (HostEventData or null), `isLoading`, `isError`, and `error`.
 */
export const useHostEventData = (eventId: string | undefined) => {
  return useQuery<HostEventData | null, Error>({
    queryKey: ['hostEventData', eventId], // Unique key for this host-specific query
    queryFn: () => fetchHostEventAndRsvps(eventId as string),
    enabled: !!eventId, // Only enable the query if eventId is provided
    staleTime: 1000 * 60 * 2, // Data considered fresh for 2 minutes (can be adjusted)
    placeholderData: (previousData) => previousData, // Keep previous data during refetch
  });
};