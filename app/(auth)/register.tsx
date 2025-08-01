import { Link } from 'expo-router';
import React from 'react';
import { ImageBackground, Keyboard, Platform, Text, TouchableWithoutFeedback, View } from 'react-native'; // Removed KeyboardAvoidingView from RN import

import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { signUpUserWithEmail } from '@/lib/auth';
import { SignUpFormData, signUpSchema } from '@/schemas/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'; // Import the KeyboardAwareScrollView

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
      username: '', // Added username to defaultValues
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    const success = await signUpUserWithEmail(data);
    if (success) {
      reset();
    }
    setLoading(false);
  };

  return (
    <ImageBackground
      source={backgroundImage}
      className="flex-1 w-full h-full justify-end items-center"
      resizeMode="cover"
      blurRadius={30}
    >
      <View
        className='rounded-t-3xl overflow-hidden w-full h-[90%]' // Main container for the form, with fixed height
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {/* Replaced KeyboardAvoidingView with KeyboardAwareScrollView */}
          <KeyboardAwareScrollView
            className="flex-1 pt-24 px-6 bg-helm-dark-background/85" // Styling for the scrollable content area
            contentContainerStyle={{ flexGrow: 1 }} // Crucial: allows content to grow and fill space
            enableOnAndroid={true} // Enable for Android
            // Adjust extraScrollHeight to ensure the last input and button are visible
            // This value might need fine-tuning based on device and content.
            extraScrollHeight={Platform.OS === 'ios' ? 120 : 120} // Increased slightly for more inputs
          >
            <Text className="text-3xl font-bold text-center text-helm-beige mb-8">Create an account</Text>

            <FormInput
              control={control}
              name="fullName"
              label="Full Name"
              placeholder="John Doe"
              autoCapitalize="words"
              errors={errors}
              className="mb-4" // Added mb-4 for spacing between inputs
            />

            <FormInput
              control={control}
              name="username"
              label="Username"
              placeholder="johndoe"
              autoCapitalize='none'
              errors={errors}
              className="mb-4" // Added mb-4 for spacing between inputs
            />

            <FormInput
              control={control}
              name="email"
              label="Email"
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              errors={errors}
              className="mb-4" // Added mb-4 for spacing between inputs
            />

            <FormInput
              control={control}
              name="password"
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              errors={errors}
              className="mb-4" // Added mb-4 for spacing between inputs
            />

            <Button
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
              variant={"primary"}
              className="my-4"
            >
              Sign Up
            </Button>

            <View className="flex-row justify-center mt-2 pb-6"> {/* pb-6 to ensure space below text */}
              <Text className="text-gray-400">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Text className="text-helm-dark-red font-semibold">Login</Text>
              </Link>
            </View>
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
      </View>
    </ImageBackground>
  );
}