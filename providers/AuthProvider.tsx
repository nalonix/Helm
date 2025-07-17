import { User } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase'; // Adjust the import path as needed

// 1. AuthContextType and AuthContext
export type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. AuthProvider component
type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        const session = supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null);
            setIsLoading(false);
            
            
        });

        // Listen for auth state changes
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Auth state changed:', session);
            setUser(session?.user ?? null);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
    };

    // Set loading to false after initial session is fetched
    if(isLoading) {
        return (
            <SafeAreaView className='w-full h-full flex items-center justify-center bg-black'>
                <ActivityIndicator size="large" color="white" />
            </SafeAreaView>
        )
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. useAuth hook
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};