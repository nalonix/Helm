import { Link } from 'expo-router'
import React from 'react'
import { Image, ImageBackground, KeyboardAvoidingView, Platform, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Splash() {
  return (
    <ImageBackground
      source={require('@/assets/images/Helm.jpg')}
      className='flex-1'
      blurRadius={15}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        style={{ flex: 1 }}
      >
        <SafeAreaView
          className='flex-1 items-center justify-end pb-36'
        >
          <View className='flex flex-col items-center mb-6'>
            <Image
              source={require("@/assets/images/icon.png")}
              className='w-28 h-28 mx-auto mb-4 rounded-xl'
            />
            <Text className='text-5xl font-bold mb-2'>Helm</Text>
            <Text className='text-black/90 text-2xl font-semibold text-center px-3'>Create, Invite and Organize your events with ease.</Text>
          </View>
          <Link href={"/(auth)/login"}
            className='bg-black  py-2 px-20 rounded-lg'
          >
            <Text className='text-white text-3xl'>Get Started</Text>
          </Link>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ImageBackground>
  )
}