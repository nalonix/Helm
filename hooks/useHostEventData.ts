// src/hooks/useHostEventData.ts
import { supabase } from '@/lib/supabase'; // Adjust this import path as needed
import { useQuery } from '@tanstack/react-query';

// Re-import the base Event interface from useEventDetails if it's there,
// or define it here if useEventDetails is being phased out for host context.
// Assuming it's still in useEventDetails.ts
import { Event } from './useEventDetails';


export type HostEvent  = Event;

// Define the structure for an individual RSVP record from the host's perspective
// This includes all columns from the rsvp table, plus joined user profile data.
export type HostRsvp = {
  id: string; // Assuming rsvp table has its own primary key 'id'
  user_id: string;
  event_id: string;
  response: 'Going' | 'May Be' | 'Not Going';
  message?: string | null;
  ticket_id: string;
  checked_in: boolean;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  created_at: string;
  updated_at?: string | null;
  profiles?: { // Assuming a foreign key relationship to public.profiles
    username: string;
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

// Define the structure for an individual invitation record
export type HostInvitation = {
  id: string; // Assuming invitation table has its own primary key 'id'
  user_id: string;
  event_id: string;
  profiles?: {
    username: string;
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
};

// Define the comprehensive data structure for the host's event view
export type HostEventData = {
  event: HostEvent;
  rsvps: HostRsvp[]; // An array of all RSVPs for this event
  invitations: HostInvitation[]; // An array of all invitations for this event
  hostDetails: {
    full_name: string | null;
    username: string | null;
  } | null; // Host details, can be null if not found
};

// Async function to fetch event details and all associated RSVPs  
 
// TODO: Fix type pls
const fetchHostEventAndRsvps = async (eventId: string): Promise<HostEventData & { hostDetails: { full_name: string | null; username: string | null } | null } | null> => {
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

  // 2. Fetch host details
  const { data: hostData, error: hostError } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', eventData.host)
    .single();

  if (hostError) {
    console.error('Error fetching host details:', hostError);
  }

  // 3. Fetch all RSVPs for this event, including profile data for the user who RSVP'd
  const { data: rsvpsData, error: rsvpsError } = await supabase
    .from('rsvp')
    .select(`
      *,
      profiles!rsvp_user_id_fkey (
        username,
        full_name,
        avatar_url
      ),
      checked_in_by_profile:profiles!rsvp_checked_in_by_fkey (
        username,
        full_name
      )
    `)
    .eq('event_id', eventId);

  if (rsvpsError) {
    console.error('Error fetching RSVPs for event:', rsvpsError);
    throw new Error(rsvpsError.message || 'Failed to load RSVPs for event.');
  }

  // 4. Fetch all invitations for this event, including profile data for the user who was invited
  const { data: invitationsData, error: invitationsError } = await supabase
    .from('invitations')
    .select(`
      *,
      profiles!invitations_user_id_fkey (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('event_id', eventId);

  if (invitationsError) {
    console.error('Error fetching invitations for event:', invitationsError);
    throw new Error(invitationsError.message || 'Failed to load invitations for event.');
  }

  // Combine the fetched data
    // TODO: Fix type pls

  const combinedData: HostEventData & { hostDetails: { full_name: string | null; username: string | null } | null } = {
    event: eventData as HostEvent, // Cast to Event type with additional fields
    rsvps: rsvpsData as HostRsvp[], // Cast to HostRsvp[]
    hostDetails: hostData || null, // Add host details
    invitations: invitationsData as HostInvitation[], // Add invitations data
  };

  return combinedData;
};

/**
 * Custom hook to fetch comprehensive data for an event from the host's perspective,
 * including event details, all associated RSVPs, and host details.
 *
 * @param eventId The ID of the event to fetch.
 * @returns An object containing `data` (HostEventData with hostDetails or null), `isLoading`, `isError`, and `error`.
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