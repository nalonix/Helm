import React from "react";
import { Image, Text, View } from "react-native";

interface UserCardProps {
  name: string;
  avatarUrl: string | null;
}

const UserCard: React.FC<UserCardProps> = ({ name, avatarUrl }) => {
  return (
    <View className="flex flex-row bg-white px-4 py-2 border border-zinc-300 items-center rounded-lg shadow-sm mb-2">
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          className="w-10 h-10 rounded-full border border-gray-300"
          resizeMode="cover"
        />
      ) : (
        <View className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
          <Text className="text-gray-600 font-bold">{name[0]}</Text>
        </View>
      )}
      <Text className="text-lg ml-3 text-gray-700 font-medium">{name}</Text>
    </View>
  );
};

export default UserCard;
