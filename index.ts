import { registerRootComponent } from 'expo';
import App from './App';
import TrackPlayer from 'react-native-track-player';
import { playbackService } from './src/services/TrackPlayerService';

registerRootComponent(App);
TrackPlayer.registerPlaybackService(() => playbackService);