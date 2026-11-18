import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Song } from '../service/api/innertube';

interface Props {
  song: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export function MiniPlayer({ song, isPlaying, onTogglePlay }: Props) {
  if (!song) return null;

  return (
    <View className="flex-row items-center justify-between bg-neutral-900 border-t border-neutral-800 px-4 py-3">
      <View className="flex-row items-center flex-1 mr-3">
        <Image
          source={{ uri: song.thumbnail }}
          className="w-10 h-10 rounded bg-neutral-800"
        />
        <View className="ml-3 flex-1">
          <Text numberOfLines={1} className="text-white font-semibold text-sm">
            {song.title}
          </Text>
          <Text numberOfLines={1} className="text-neutral-400 text-xs">
            {song.artist}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onTogglePlay}
        className="bg-white px-4 py-2 rounded-full"
      >
        <Text className="text-black font-bold text-xs">
          {isPlaying ? 'PAUSA' : 'PLAY'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}