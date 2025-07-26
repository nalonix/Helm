// src/providers/HostEventProvider.tsx
import React, { createContext, ReactNode, useContext } from 'react';
// REMOVED: ActivityIndicator, Text, View imports
import { HostEventData, useHostEventData } from '@/hooks/useHostEventData';

// Define the shape of the data provided by the context
interface HostEventContextType {
  hostEventData: HostEventData | null | undefined; // The comprehensive host event data
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
  // Use the new useHostEventData hook to fetch the data
  const {
    data: hostEventData,
    isLoading,
    isError,
    error,
  } = useHostEventData(eventId);

  // The provider now *always* renders its children, passing the state via context.
  // Loading/error UI is handled by consuming components (e.g., ManageTabsLayout).
  const contextValue: HostEventContextType = {
    hostEventData,
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