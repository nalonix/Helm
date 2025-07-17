import { Link } from 'expo-router';
import React from 'react';
import { ImageBackground, Keyboard, KeyboardAvoidingView, Platform, Text, TouchableWithoutFeedback, View } from 'react-native'; // Import ImageBackground

import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { signUpUserWithEmail } from '@/lib/auth';
import { SignUpFormData, signUpSchema } from '@/schemas/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export default function SignUpScreen() {
  const [loading, setLoading] = React.useState(false);
  const backgroundImage = require('@/assets/images/Helm.jpg');

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
    <ImageBackground
      source={backgroundImage}
      className="flex-1 w-full h-full justify-end items-center" // Align content to the bottom
      resizeMode="cover"
      blurRadius={30} // Apply the same blur radius as login
    >
      <View
        className='rounded-t-3xl overflow-hidden w-full h-[75%]'
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            // Updated className to match login form's background and padding
            className="flex-1 pt-24 px-6 bg-helm-dark-background/85"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <Text className="text-3xl font-bold text-center text-helm-beige mb-8">Create an account</Text>

            {/* Full Name Input */}
            <FormInput
              control={control}
              name="fullName"
              label="Full Name" // Added label
              placeholder="John Doe"
              autoCapitalize="words"
              errors={errors}
              // Apply the same input styling as login
              className="bg-white/10 border-white/20 rounded-xl px-6"
            />

            {/* Email Input */}
            <FormInput
              control={control}
              name="email"
              label="Email" // Added label
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              errors={errors}
              // Apply the same input styling as login
              className="bg-white/10 border-white/20 rounded-xl px-6"
            />

            {/* Password Input */}
            <FormInput
              control={control}
              name="password"
              label="Password" // Added label
              placeholder="••••••••"
              secureTextEntry
              errors={errors}
              // Apply the same input styling as login
              className="bg-white/10 border-white/20 rounded-xl px-6"
            />

            {/* Sign Up Button using the modular Button component */}
            <Button
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
              variant={"primary"} 
              className="mb-4" 
            >
              Sign Up
            </Button>

            <View className="flex-row justify-center mt-2">
              <Text className="text-gray-400">Already have an account? </Text>
              <Link href="/(auth)/login" asChild> 
                <Text className="text-helm-dark-red font-semibold">Login</Text>
              </Link>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
    </ImageBackground>
  );
}