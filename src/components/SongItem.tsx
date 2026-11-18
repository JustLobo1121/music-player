import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Song } from '../service/api/innertube';

interface Props {
  song: Song;
  onPress: (song: Song) => void;
  isActive?: boolean;
}

export function SongItem({ song, onPress, isActive }: Props) {
  return (
    <TouchableOpacity
      onPress={() => onPress(song)}
      className={`flex-row items-center px-4 py-3 active:bg-neutral-800 ${
        isActive ? 'bg-neutral-900' : 'bg-transparent'
      }`}
    >
      <Image
        source={{ uri: song.thumbnail }}
        className="w-12 h-12 rounded-md bg-neutral-800"
      />
      <View className="ml-3 flex-1">
        <Text
          numberOfLines={1}
          className={`text-base font-medium ${
            isActive ? 'text-emerald-400' : 'text-white'
          }`}
        >
          {song.title}
        </Text>
        <Text numberOfLines={1} className="text-sm text-neutral-400 mt-0.5">
          {song.artist}
        </Text>
      </View>
    </TouchableOpacity>
  );
}