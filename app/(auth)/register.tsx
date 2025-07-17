// app/(auth)/register.tsx

import { Link } from 'expo-router';
import React from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

// Import modularized components and functions
import { FormInput } from '@/components/FormInput'; // Assuming this path is correct
import { supabase } from '@/lib/supabase';
import { SignUpFormData, signUpSchema } from '@/schemas/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';



export default function SignUpScreen() {
  const [loading, setLoading] = React.useState(false);


 async function signUpUserWithEmail(data: SignUpFormData): Promise<boolean> {
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

    // This case might be hit if auto-login is enabled and successful,
    // but typically for email/password, it requires verification.
    console.log('Sign-up successful and session established (unlikely without verification).');
    return true;
  } catch (err: any) { // Catch any unexpected errors during the await call
    Alert.alert('Network Error', 'Could not connect to the server. Please try again.');
    console.error('Unexpected sign-up error:', err);
    return false;
  }
}

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  // The onSubmit handler for the form
  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    const success = await signUpUserWithEmail(data);
    console.log('Sign-up success:', success);
    if (success) {
      reset(); // Clear form fields on successful sign-up (email sent)
    }
    setLoading(false);
  };

  return (
    // The outer View ensures KeyboardAvoidingView has a flex parent to work correctly
    <View style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          // Using Tailwind classes for styling (as in your original code)
          className="flex-1 justify-center px-6 bg-black"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          // contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} // Optional: for ScrollView inside KAV
        >
          <Text className="text-3xl font-bold text-center text-white mb-8">Create an account</Text>

          {/* Full Name Input using modularized FormInput */}
          <FormInput
            control={control}
            name="fullName"
            placeholder="Full Name"
            autoCapitalize="words"
            errors={errors}
          />

          {/* Email Input using modularized FormInput */}
          <FormInput
            control={control}
            name="email"
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            errors={errors}
          />

          {/* Password Input using modularized FormInput */}
          <FormInput
            control={control}
            name="password"
            placeholder="Password"
            secureTextEntry
            errors={errors}
          />

          <TouchableOpacity
            className="bg-white rounded-lg py-3 mb-4"
            onPress={handleSubmit(onSubmit)} // Use handleSubmit to trigger validation and onSubmit
            disabled={loading}
          >
            <Text className="text-black text-center font-semibold text-lg">
              {loading ? 'Loading...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-2">
            <Text className="text-gray-400">Already have an account? </Text>
            <Link href="/(auth)" asChild>
              <Text className="text-blue-400 font-semibold">Login</Text>
            </Link>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}

// No specific styles needed here anymore, as they are in FormInput.tsx
const styles = StyleSheet.create({});