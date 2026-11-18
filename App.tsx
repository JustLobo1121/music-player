import { View, Text, TextInput, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import TrackPlayer, { Capability, State, usePlaybackState } from 'react-native-track-player';
import { searchSongs, getAudioStreamUrl, Song } from './src/service/api/innertube';
import { SongItem } from './src/components/SongItem';
import { MiniPlayer } from './src/components/MiniPlayer';
import './global.css';
import { YouTubeLogin } from '@/components/YoutubeLogin';

export default function App() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  const playbackState = usePlaybackState();
  const isPlaying = playbackState.state === State.Playing;

  useEffect(() => {
    async function initPlayer() {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
        });
      } catch (e) {}
    }
    initPlayer();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const results = await searchSongs(query);
    setSongs(results);
    setLoading(false);
  };

  const handleSelectSong = async (song: Song) => {
    setCurrentSong(song);
    const streamUrl = await getAudioStreamUrl(song.id);

    if (!streamUrl) {
      console.warn('No se pudo obtener el audio para esta canción');
      return;
    }

    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: song.id,
      url: streamUrl,
      title: song.title,
      artist: song.artist,
      artwork: song.thumbnail,
    });
    await TrackPlayer.play();
  };

  const handleTogglePlay = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
        <View className="border-b border-neutral-900 px-4 pb-4 pt-12">
          <Text className="mb-3 text-2xl font-bold text-white">Music Player</Text>
          <View className="flex-row items-center rounded-xl bg-neutral-900 px-3 py-2">
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              placeholder="Buscar canciones o artistas..."
              placeholderTextColor="#737373"
              returnKeyType="search"
              className="flex-1 text-base text-white"
            />
            <TouchableOpacity
              onPress={handleSearch}
              className="ml-2 rounded-lg bg-neutral-800 px-3 py-1.5">
              <Text className="text-xs font-semibold text-white">Buscar</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-1">
          <View className="flex-1">
            {loading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            ) : (
              <FlatList
                data={songs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <SongItem
                    song={item}
                    onPress={handleSelectSong}
                    isActive={currentSong?.id === item.id}
                  />
                )}
                ListEmptyComponent={
                  <View className="mt-20 flex-1 items-center justify-center px-6">
                    <Text className="text-center text-neutral-500">
                      Escribe el nombre de una canción arriba para probar la API de InnerTube.
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
        <MiniPlayer song={currentSong} isPlaying={isPlaying} onTogglePlay={handleTogglePlay} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
