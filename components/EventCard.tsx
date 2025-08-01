import { formatTimeToAmPm } from '@/lib/timeFormat';
import { Feather } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns'; // Import date-fns utilities
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

// Define the Event type, matching what useUpcomingEvents provides
interface Event {
  id: string;
  title: string;
  description?: string;
  date: string; // Assuming YYYY-MM-DD format
  start_time: string;
  end_time?: string;
  poster?: string | null;
  host?: string;
  hosting: boolean;
  address?: {
    name?: string;
    city?: string;
    country?: string;
  };
}

interface EventCardProps {
  item: Event;
  onPress: (id: string, isHosted: boolean) => void; // Callback for navigation
}

const EventCard: React.FC<EventCardProps> = ({ item, onPress }) => {
  const isHosted = item.hosting;
  const eventDate = parseISO(item.date);
  //const isEventPast = isPast(eventDate)

  // Conditional class names based on event status (past/upcoming)
  const cardClassName = "border border-zinc-300/70 bg-white p-3 rounded-lg mb-2 shadow-md";

  const titleClassName = "text-lg font-semibold text-gray-900";
  const detailClassName = "text-sm text-gray-600";
  const descriptionClassName = "text-sm text-gray-700 mt-1";

  return (
    <TouchableOpacity
      onPress={() => onPress(item.id, isHosted)}
      className={cardClassName}
    >
      <View className="flex-row items-center">
        {item.poster ? (
          <Image
            source={{ uri: item.poster  }}
            className="w-28 h-28 rounded-md mr-4"
            resizeMode="cover"
          />
        ) : (
          <View className="w-28 h-28 rounded-md mr-4 bg-gray-200 items-center justify-center">
            <Feather name="image" size={30} color="#a3a3a3" />
          </View>
        )}
        <View className="flex-1">
          {isHosted && <Text className="text-xs text-helm-coral font-bold">Hosting 👑</Text>}
          <Text className={titleClassName}>{item.title}</Text>
          <Text className={detailClassName}>{format(eventDate, 'MMM dd, yyyy')} at {formatTimeToAmPm(item.start_time)}</Text>
          {item.address?.name && <Text className={detailClassName}>{item.address.name.substring(0, 40)}</Text>}
          {(!isHosted && item.description) && <Text className={descriptionClassName}>{item.description.substring(0, 40)}...</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;
