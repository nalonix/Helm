import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, TouchableOpacity } from 'react-native';

interface ProfilePicProps {
  avatarUrl?: string;
  userId: string;
  placeHolder?: boolean;
}

export default function ProfilePic({ avatarUrl, userId, placeHolder }: ProfilePicProps) {    
  const [profilePic, setProfilePic] = useState<string | undefined>(avatarUrl);

  // TODO: invalidate user data
  const handleUpload = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'You need to grant permission to access the media library.');
        return;
      }

      // Open image picker
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

      if (pickerResult.canceled) {
        return;
      }

      // Read the selected image as base64
      const base64 = await FileSystem.readAsStringAsync(pickerResult.assets[0].uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Generate a unique file name
      const fileExt = pickerResult.assets[0].uri.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      // Upload the image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64), {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) {
        Alert.alert('Image Upload Error', uploadError.message);
        console.error('Supabase image upload error:', uploadError);
        return;
      }

      // Get the public URL of the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (publicUrlData) {
        const newAvatarUrl = publicUrlData.publicUrl;
        setProfilePic(newAvatarUrl);

        // Update the avatar_url in the profile table
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: newAvatarUrl })
          .eq('id', userId);

        if (updateError) {
          Alert.alert('Profile Update Error', updateError.message);
          console.error('Supabase profile update error:', updateError);
          return;
        }

        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        Alert.alert('Image URL Error', 'Could not get public URL for uploaded image.');
      }
    } catch (err: any) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Unexpected error:', err);
    }
  };

  if (placeHolder || !profilePic) {
    return (
      <TouchableOpacity onPress={handleUpload} className="h-44 w-44 aspect-square flex items-center justify-center rounded-full bg-zinc-300 border border-zinc-500">
        <Feather name="camera" size={40} color={"black"} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handleUpload}>
      <Image
        source={{ uri: profilePic  }}
        className=' h-44 w-44 rounded-full border-zinc-900'
      />
    </TouchableOpacity>
  );
}
