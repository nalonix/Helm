import React from 'react';
import { ImageBackground, Keyboard, KeyboardAvoidingView, Platform, Text, TouchableWithoutFeedback, View } from 'react-native';

// Imports
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { signInUserWithEmail } from '@/lib/auth';
import { LoginFormData, loginSchema } from '@/schemas/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';

export default function LoginScreen() {
  const [loading, setLoading] = React.useState(false);
  const backgroundImage = require('@/assets/images/Helm.jpg'); 
  

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // The onSubmit handler for the login form
  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    const success = await signInUserWithEmail(data);
    console.log('Sign-in success:', success);
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
      className='rounded-t-3xl overflow-hidden w-full h-[70%]'
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          className="flex-1 pt-28 px-6 bg-helm-dark-background/85"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} 
        >
          <Text className="text-3xl font-bold text-center text-helm-beige mb-8">Log in to account</Text>

          {/* Email Input */}
          <FormInput
            control={control}
            name="email"
            placeholder="Email"
            label='Email'
            keyboardType="email-address"
            autoCapitalize="none"
            errors={errors}
            className='mb-4'
          />

          {/* Password Input */}
          <FormInput
            control={control}
            name="password"
            placeholder="Password"
            label='Password'
            secureTextEntry
            errors={errors}
          />
          <Button
            onPress={handleSubmit(onSubmit)}
            isLoading={loading}
            variant={"primary"}
            className="my-4" 
          >
            Login
          </Button>

          <View className="flex-row justify-center mt-2">
            <Text className="text-gray-400">Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <Text className="text-helm-dark-red font-semibold">Sign Up</Text>
            </Link>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
    </ImageBackground>
  );
}