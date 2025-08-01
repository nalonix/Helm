// src/hooks/useEventDetails.ts
import { supabase } from "@/lib/supabase";
import { Event as BaseEvent } from "@/types/eventTypes";
import { useQuery } from "@tanstack/react-query";

// Define the Event interface (UNCHANGED - NO 'rsvp' PROPERTY HERE)
export interface Event extends BaseEvent {
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
  response: "Going" | "May Be" | "Not Going";
  message?: string | null;
  ticket_id?: string | null;
  checked_in?: boolean | null;
};

// Define the structure of the profile data as returned by Supabase embedding
interface EmbeddedProfile {
  avatar_url: string | null;
  full_name: string | null;
}

// Define the type for an RSVP entry when profiles are embedded.
// CORRECTED: 'profiles' is an ARRAY of EmbeddedProfile objects, as indicated by the TypeScript error.
interface RsvpEntryWithEmbeddedProfile {
  profiles: EmbeddedProfile[]; // This is the key correction: it's an array
  // If you were selecting other columns from the 'rsvp' table, they would go here.
  // For this specific select, only 'profiles' is explicitly chosen.
}


// This type combines the Event with the user-specific RSVP and host/going user details.
export type EventDetails = Event & {
  rsvp: UserRsvp | null;
  hostDetails: { full_name: string | null; username: string | null } | null;
  goingUsers: GoingUser[] | null;
};

// Define a placeholder for the user profile data we'll fetch.
export type GoingUser = {
  avatar: string | null;
  full_name: string | null;
};


const fetchEventAndUserRsvp = async (
  eventId: string
): Promise<EventDetails | null> => {
  if (!eventId) {
    return null;
  }

  // 1. Fetch event details
  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError) {
    if (eventError.code === "PGRST116") { // No rows found
      return null;
    }
    console.error("Error fetching event details:", eventError);
    throw new Error(eventError.message || "Failed to load event details.");
  }

  if (!eventData) {
    return null;
  }

  // 2. Fetch host details
  const { data: hostData, error: hostError } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", eventData.host)
    .single();

  if (hostError) {
    console.error("Error fetching host details:", hostError);
  }

  // 3. Get the current authenticated user's ID
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  let currentUserRsvp: UserRsvp | null = null;

  // 4. If a user is logged in, fetch their RSVP for this event
  if (currentUserId) {
    const { data: rsvpData, error: rsvpError } = await supabase
      .from("rsvp")
      .select("response, message, ticket_id, checked_in")
      .eq("user_id", currentUserId)
      .eq("event_id", eventId)
      .single();

    if (rsvpError && rsvpError.code !== "PGRST116") { // PGRST116 means no rows found, which is fine
      console.error("Error fetching user RSVP:", rsvpError);
    } else if (rsvpData) {
      currentUserRsvp = rsvpData as UserRsvp;
    }
  }

  // 5. Fetch all users who RSVP'd "Going" if the guest list is public
  let goingUsers: GoingUser[] = [];


  // 6. Return the combined data
  return {
    ...(eventData as Event), // Cast eventData to Event to satisfy the return type
    rsvp: currentUserRsvp,
    hostDetails: hostData || null,
    goingUsers: goingUsers,
  };
};

/**
 * Custom hook to fetch details for a specific event, including the current user's RSVP status, host details, and a list of attendees.
 *
 * @param eventId The ID of the event to fetch.
 * @returns An object containing `data` (EventDetails, or null), `isLoading`, `isError`, and `error`.
 */
export const useEventDetails = (eventId: string | undefined) => {
  return useQuery<EventDetails | null, Error>({
    queryKey: ["eventDetails", eventId],
    queryFn: () => fetchEventAndUserRsvp(eventId as string),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // Data considered stale after 5 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while refetching
  });
};
