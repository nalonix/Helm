
import { Text } from 'react-native';

export default function Heading({ header }: { header: string }) {
  return (
    <Text className='font-bold text-4xl'>{header}</Text>
  );
}