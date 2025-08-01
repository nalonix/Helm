import posterPreview from "@/lib/previewPoster";
import { Image, ImageSourcePropType, View } from "react-native";

export default function Poster({ url }: { url: string | null | undefined}) {

  if (!url) {
    return (<View className="w-full rounded-lg mb-4 aspect-square">
      <Image
        source={posterPreview(url) as ImageSourcePropType}
        className="w-full h-full rounded-2xl border-2 border-zinc-100"
        resizeMode="cover"
      />
    </View>)
  }
  
  return (
    <View className="w-full rounded-lg mb-4 aspect-square">
      <Image
        source={{ uri: url }}
        className="w-full h-full rounded-2xl border-2 border-zinc-100"
        resizeMode="cover"
      />
    </View>
  );
}