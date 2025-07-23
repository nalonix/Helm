import '../global.css';


import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/providers/AuthProvider';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';



if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}



export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/Poppins-Regular.ttf'),
  });

  const queryClient = new QueryClient();


  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }


  // TODO: Check with gpt if wraping with safe area view is good
  return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <GestureHandlerRootView style={styles.container}>
              <Slot />
              <StatusBar style="auto" />
            </GestureHandlerRootView>
          </AuthProvider>
        </QueryClientProvider>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
  }
});