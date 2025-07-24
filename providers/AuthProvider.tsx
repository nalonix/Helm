// import 'react-native-url-polyfill/auto';

// import { User } from '@supabase/supabase-js';
// import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
// import { ActivityIndicator } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { supabase } from '../lib/supabase'; // Adjust the import path as needed

// // 1. AuthContextType and AuthContext
// export type AuthContextType = {
//     user: User | null;
//     isAuthenticated: boolean;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // 2. AuthProvider component
// type AuthProviderProps = {
//     children: ReactNode;
// };

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//     const [user, setUser] = useState<User | null>(null);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         // Get initial session
//         const session = supabase.auth.getSession().then(({ data }) => {
//             setUser(data.session?.user ?? null);
//             setIsLoading(false);
//         });

//         // Listen for auth state changes
//         const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//             setUser(session?.user ?? null);
//         });

//         return () => {
//             listener.subscription.unsubscribe();
//         };
//     }, []);

//     const value: AuthContextType = {
//         user,
//         isAuthenticated: !!user,
//     };

//     // Set loading to false after initial session is fetched
//     if(isLoading) {
//         return (
//             <SafeAreaView className='w-full h-full flex items-center justify-center bg-black'>
//                 <ActivityIndicator size="large" color="white" />
//             </SafeAreaView>
//         )
//     }

//     return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// // 3. useAuth hook
// export const useAuth = (): AuthContextType => {
//     const context = useContext(AuthContext);
//     if (context === undefined) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// };


import 'react-native-url-polyfill/auto';

import { User } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

interface AppUser extends User {
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

export type AuthContextType = {
  user: AppUser | null;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      setIsLoading(true);
      setIsProfileLoading(true);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error fetching session:", sessionError.message);
        setUser(null);
        setIsLoading(false);
        setIsProfileLoading(false);
        return;
      }

      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching user profile:", profileError.message);
          setUser(session.user as AppUser);
        } else if (profile) {
          const combinedUser: AppUser = {
            ...session.user,
            username: profile.username,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
          };
          setUser(combinedUser);
        } else {
          setUser(session.user as AppUser);
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
      setIsProfileLoading(false);
    };

    fetchSessionAndProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsProfileLoading(true);
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching user profile on auth change:", profileError.message);
          setUser(session.user as AppUser);
        } else if (profile) {
          const combinedUser: AppUser = {
            ...session.user,
            username: profile.username,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
          };
          setUser(combinedUser);
        } else {
            setUser(session.user as AppUser);
        }
      } else {
        setUser(null);
      }
      setIsProfileLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
  };

  if (isLoading || isProfileLoading) {
    return (
      <SafeAreaView className='w-full h-full flex items-center justify-center bg-black'>
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
