import { Alert, Linking, Platform } from 'react-native';

/**
 * Opens either Apple Maps (iOS) or Google Maps (Android) at a specified location.
 *
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @param {string} [locationName] - Optional. A name for the location to display as a pin title.
 */
export default async function openMapApp(latitude: number, longitude: number, locationName?: string) {
  // Validate coordinates
  if (latitude === 0 && longitude === 0) {
    Alert.alert('Invalid Location', 'No valid location coordinates available.');
    return;
  }

  let url: string;

  if (Platform.OS === 'ios') {
    // Apple Maps URL format
    if (locationName) {
      // Use search query format for better results with location name
      const encodedLocationName = encodeURIComponent(locationName);
      url = `maps://?q=${encodedLocationName}&ll=${latitude},${longitude}`;
    } else {
      // Direct coordinates
      url = `maps://?ll=${latitude},${longitude}`;
    }
  } else {
    // Android - Google Maps URL format
    if (locationName) {
      // Use search query format for better results with location name
      const encodedLocationName = encodeURIComponent(locationName);
      url = `https://maps.google.com/maps?q=${latitude},${longitude}(${encodedLocationName})`;
    } else {
      // Direct coordinates
      url = `https://maps.google.com/maps?q=${latitude},${longitude}`;
    }
  }

  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      // Fallback: Try to open Google Maps app directly on Android
      if (Platform.OS === 'android') {
        const googleMapsUrl = `geo:${latitude},${longitude}`;
        const googleMapsSupported = await Linking.canOpenURL(googleMapsUrl);
        
        if (googleMapsSupported) {
          await Linking.openURL(googleMapsUrl);
        } else {
          // Final fallback: Open in browser
          const browserUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
          await Linking.openURL(browserUrl);
        }
      } else {
        Alert.alert(
          'Cannot Open Map',
          'Could not open map application. Please ensure you have a map app installed.'
        );
        console.warn(`Cannot open URL: ${url}`);
      }
    }
  } catch (error) {
    console.error('An error occurred while trying to open the map app:', error);
    
    // Final fallback: Open in browser
    try {
      const browserUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      await Linking.openURL(browserUrl);
    } catch (browserError) {
      Alert.alert('Error', 'An unexpected error occurred while trying to open the map.');
    }
  }
}