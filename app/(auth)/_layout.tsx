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
                headerShown: false,
                animation: 'fade',
                animationDuration: 800,
                contentStyle: { backgroundColor: '#18181b' },
            }}
        >
            <Stack.Screen name="index" options={{ title: "Splash" }} />
            <Stack.Screen name="login" options={{ title: "Login" }} />
            <Stack.Screen name="register" options={{ title: "Register" }} />
        </Stack>
    );
}


