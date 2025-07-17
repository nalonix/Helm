import { useAuth } from '@/providers/AuthProvider';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        // Redirect to the main app if already authenticated
        return <Redirect href="/(app)/(tabs)/events" />;
    }


    return (
        <Stack 
            screenOptions={{
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="splash" options={{ headerShown: false, title: "Splash" }} />
            <Stack.Screen name="index" options={{ title: "Login" }} />
            <Stack.Screen name="register" options={{ title: "Register" }} />
        </Stack>
    );
}


