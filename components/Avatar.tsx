import { supabase } from '@/lib/supabase';
import { Image, View } from 'react-native';


export default function Avatar({ url, placeHolder }: { url?: string, placeHolder?: boolean }) {

   if (placeHolder || !url) {
        return (
            <View className='bg-zinc-400 h-12 w-12 m-2 rounded-full'></View>
        )
   }


  return (
    <Image
      source={{
        uri: supabase.storage.from("avatars").getPublicUrl(url).data.publicUrl,
      }}
      style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
    />
  );
}