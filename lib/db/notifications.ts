import { supabase } from '@/lib/supabase';

// Define the structure for a new notification record
interface NewNotification {
  user_id: string;
  message: string; 
  type: string;    // The type of notification (e.g., 'invite', 'message', 'alert', 'event_update')
  event_id?: string;
}

/**
 * Inserts a new notification record into the 'notifications' table.
 * This function runs independently and does not manage React state or TanStack Query cache.
 * It's suitable for background operations where you don't need immediate UI feedback
 * tied to its loading/error states, or when called outside of React components.
 *
 * @param {NewNotification} notification - The notification object to insert.
 * @returns {Promise<any>} A Promise that resolves with the inserted data or rejects with an error.
 */
export const addNotification = async (notification: NewNotification) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notification])
    .select() 
    .single(); 

  if (error) {
    console.error('Supabase notification insertion error:', error);
    throw new Error(error.message || 'Failed to add notification');
  }
  console.log('Notification added successfully:', data);
  return data;
};
