// Define types related to events

export interface HostDetails {
  full_name: string | null;
  username: string | null;
}

export interface Event {
  id: string;
  title: string;
  description?: string | null; // Allow null values for description
  date: string;
  start_time: string;
  end_time?: string | null; // Make end_time optional
  poster?: string | null; // Allow null values for poster
  address?: {
    name?: string | null;
    city?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null; // Allow null for address
  hostDetails: HostDetails | null;
}

export type HostEventData = {
  event: Event;
  // Add other properties of HostEventData if needed
};
