import 'react-native-url-polyfill/auto';
import '../global.css';


import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/lib/supabase';
import { AuthProvider } from '@/providers/AuthProvider';



export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/Poppins-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }


  async function fetchEvents(){
    const { data, error: fetchError } = await supabase.from('event').select('title').limit(2);
    if (fetchError) {
      console.error('Error fetching events:', fetchError);
      return;
    }
    console.log('Fetched events:', data);
  }

  // TODO: remove this after testing
  // fetchEvents();

  // TODO: Check with gpt if wraping with safe area view is good
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <Slot />
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}

// TODO: Remove this 
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'transparent', 
//     paddingTop: 0,
//     paddingBottom: 0,
//     paddingLeft: 0,
//     paddingRight: 0,
//   },
// });