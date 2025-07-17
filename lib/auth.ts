// lib/auth.ts

import { LoginFormData, SignUpFormData } from '@/schemas/authSchema'; // Import both types
import { Alert } from 'react-native';
import { supabase } from './supabase'; // Assuming '@/lib/supabase' resolves to this path

/**
 * Handles user sign-up with email and password using Supabase.
 * Includes passing full name as user metadata.
 * @param {SignUpFormData} data - The validated form data containing email, password, and fullName.
 * @returns {Promise<boolean>} True if sign-up process initiated successfully (check inbox), false otherwise.
 */
export async function signUpUserWithEmail(data: SignUpFormData): Promise<boolean> {
  console.log('Attempting to sign up with email:', data.email);

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName, // Pass full name as user metadata
        },
      },
    });

    console.log('Supabase sign-up response:', { session, error });

    if (error) {
      Alert.alert('Sign Up Error', error.message);
      console.error('Supabase sign-up error:', error);
      return false;
    }

    if (!session) {
      Alert.alert('Verification', 'Please check your inbox for email verification!');
      console.log('Sign-up successful, awaiting email verification.');
      return true; // Indicates that the sign-up email was sent
    }

    console.log('Sign-up successful and session established (unlikely without verification).');
    return true;
  } catch (err: any) {
    Alert.alert('Network Error', 'Could not connect to the server. Please try again.');
    console.error('Unexpected sign-up error:', err);
    return false;
  }
}

/**
 * Handles user sign-in with email and password using Supabase.
 * @param {LoginFormData} data - The validated form data containing email and password.
 * @returns {Promise<boolean>} True if sign-in was successful, false otherwise.
 */
export async function signInUserWithEmail(data: LoginFormData): Promise<boolean> {
  console.log('Attempting to sign in with email:', data.email);

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    console.log('Supabase sign-in response:', { session, error });

    if (error) {
      Alert.alert('Login Error', error.message);
      console.error('Supabase sign-in error:', error);
      return false;
    }

    if (!session) {
      Alert.alert('Login Failed', 'Could not establish a session. Check your credentials.');
      console.warn('Sign-in failed: No session returned.');
      return false;
    }

    console.log('Sign-in successful!');
    return true;
  } catch (err: any) {
    Alert.alert('Network Error', 'Could not connect to the server. Please try again.');
    console.error('Unexpected sign-in error:', err);
    return false;
  }
}