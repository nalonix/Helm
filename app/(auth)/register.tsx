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

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    const success = await signUpUserWithEmail(data);
    console.log('Sign-up success:', success);
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
        className='rounded-t-3xl overflow-hidden w-full h-[75%]'
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            className="flex-1 pt-24 px-6 bg-helm-dark-background/85"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <Text className="text-3xl font-bold text-center text-helm-beige mb-8">Create an account</Text>

            <FormInput
              control={control}
              name="fullName"
              label="Full Name"
              placeholder="John Doe"
              autoCapitalize="words"
              errors={errors}
              className="bg-white/10 border-white/20 rounded-xl px-6"
            />

            <FormInput
              control={control}
              name="email"
              label="Email"
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              errors={errors}
              className="bg-white/10 border-white/20 rounded-xl px-6"
            />

            <FormInput
              control={control}
              name="password"
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              errors={errors}
              className="bg-white/10 border-white/20 rounded-xl px-6"
            />

            <Button
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
              variant={"primary"} 
              className="my-4" 
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