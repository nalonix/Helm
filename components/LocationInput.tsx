import useDebounce from '@/hooks/useDebounce';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface GebetaPlace {
  City: string;
  Country: string;
  latitude: number;
  longitude: number;
  name: string;
}

interface LocationInputProps {
  name: string;
  onClose: () => void;
  onLocationSelect?: (location: GebetaPlace) => void;
}

async function getGeocodedLocation(locationName: string): Promise<{ data: GebetaPlace[]; msg: string } | null> {
  try {
    const { data, error } = await supabase.functions.invoke('GEBETA-PLACES', {
      body: { name: locationName },
    });

    if (error) {
      console.error('Error invoking Supabase Edge Function:', error);
      throw new Error(error.message || 'Failed to geocode location via Edge Function.');
    }


    return data as { data: GebetaPlace[]; msg: string };

  } catch (error: any) {
    console.error('Failed to get geocoded location:', error.message);
    throw error;
  }
}

export default function LocationInput({ name, onClose, onLocationSelect }: LocationInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<GebetaPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debounce the search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Search for places when debounced query changes
  useEffect(() => {
    const searchPlaces = async () => {
      if (!debouncedSearchQuery.trim()) {
        setPlaces([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getGeocodedLocation(debouncedSearchQuery);
        if (result && result.data) {
          setPlaces(result.data);
        } else {
          setPlaces([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to search for places');
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };

    searchPlaces();
  }, [debouncedSearchQuery]);

  const handleLocationSelect = (place: GebetaPlace) => {
    if (onLocationSelect) {
      onLocationSelect(place);
    }
    onClose();
  };

  const renderPlaceItem = (item: GebetaPlace) => (
    <TouchableOpacity
      key={`${item.name}-${item.latitude}-${item.longitude}-${Math.random()*1000000}`}
      onPress={() => handleLocationSelect(item)}
      className="p-4 border-b border-gray-200 bg-white"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
          <Text className="text-sm text-gray-600">
            {(item.City && item.Country) && `${item.City}, ${item.Country}`}
          </Text>
        </View>
        <Feather name="map-pin" size={20} color="#6b7280" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-600 mt-2">Searching for places...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <Feather name="alert-circle" size={48} color="#ef4444" />
          <Text className="text-red-500 mt-2 text-center px-4">{error}</Text>
        </View>
      );
    }

    if (debouncedSearchQuery && !loading && places.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <Feather name="search" size={48} color="#9ca3af" />
          <Text className="text-gray-500 mt-2 text-center px-4">
            No places found for "{debouncedSearchQuery}"
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 justify-center items-center py-8">
        <Feather name="map-pin" size={48} color="#9ca3af" />
        <Text className="text-gray-500 mt-2 text-center px-4">
          Start typing to search for places
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >

      {/* Search Input */}
      <View className="bg-gray-50">
        <View className="flex-row items-center bg-white rounded-lg border border-gray-300 px-3">
          <Feather name="search" size={20} color="#9ca3af" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for a place..."
            placeholderTextColor="#9ca3af"
            className="flex-1 py-3 px-3 text-gray-900"
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Feather name="x" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results List */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View className="flex-1 justify-center items-center py-8">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-600 mt-2">Searching for places...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center py-8">
            <Feather name="alert-circle" size={48} color="#ef4444" />
            <Text className="text-red-500 mt-2 text-center px-4">{error}</Text>
          </View>
        ) : debouncedSearchQuery && !loading && places.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <Feather name="search" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-2 text-center px-4">
              No places found for "{debouncedSearchQuery}"
            </Text>
          </View>
        ) : places.length > 0 ? (
          places.map(renderPlaceItem)
        ) : (
          <View className="flex-1 justify-center items-center py-8">
            <Feather name="map-pin" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-2 text-center px-4">
              Start typing to search for places
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}