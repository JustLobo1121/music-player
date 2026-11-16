import { registerRootComponent } from 'expo';
import App from './src/App';
import TrackPlayer from 'react-native-track-player';

TrackPlayer.registerPlaybackService(() => require('./src/services/player/PlaybackService'));

registerRootComponent(App);