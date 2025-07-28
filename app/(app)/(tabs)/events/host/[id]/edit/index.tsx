import Heading from '@/components/Heading'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { TouchableOpacity, View } from 'react-native'


export default function index(){

    const router = useRouter()

    return (
        <View className="flex-1">
      {/* Header for the management tabs */}
      <View className="flex-row items-center pt-16 pb-3 px-4 bg-white border-b border-b-zinc-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
          <Feather name="x-circle" size={28} color="black" />
        </TouchableOpacity>
        <Heading header={`Edit`} />
      </View>
      </View>
    )
}