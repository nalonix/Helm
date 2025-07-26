// src/providers/HostEventProvider.tsx
import React, { createContext, ReactNode, useContext } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
// Import the new hook and its types
import { HostEventData, useHostEventData } from '@/hooks/useHostEventData';

// Define the shape of the data provided by the context
interface HostEventContextType {
  hostEventData: HostEventData | null; 
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// Create the context
const HostEventContext = createContext<HostEventContextType | undefined>(undefined);

// Define the props for the provider component
interface HostEventProviderProps {
  children: ReactNode;
  eventId: string; // The event ID to fetch
}

export const HostEventProvider: React.FC<HostEventProviderProps> = ({ children, eventId }) => {
  // Use the new useHostEventData hook
  const {
    data: hostEventData, // Renamed 'data' to 'hostEventData' for clarity
    isLoading,
    isError,
    error,
  } = useHostEventData(eventId);

  // Provide loading/error feedback at the layout level
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading event details for host...</Text>
      </View>
    );
  }

  if (isError || !hostEventData) { // Check if hostEventData is null/undefined
    return (
      <View className="flex-1 items-center justify-center bg-red-800 p-4">
        <Text className="text-white text-center text-lg">
          {isError ? `Error loading event: ${error?.message || 'Unknown error.'}` : 'Event not found or no data.'}
        </Text>
        <Text className="text-white text-center text-sm mt-2">
          Please ensure the event ID is valid and you have access.
        </Text>
      </View>
    );
  }

  // If data is loaded and no error, provide it via context
  const contextValue: HostEventContextType = {
    hostEventData, // Provide the full combined data
    isLoading,
    isError,
    error,
  };

  return (
    <HostEventContext.Provider value={contextValue}>
      {children}
    </HostEventContext.Provider>
  );
};

// Custom hook to consume the context
export const useHostEvent = (): HostEventContextType => {
  const context = useContext(HostEventContext);
  if (context === undefined) {
    throw new Error('useHostEvent must be used within a HostEventProvider');
  }
  return context;
};