import TrackPlayer, { RepeatMode } from 'react-native-track-player';
import { PlaybackMode, Track } from '../../domain/models';

export interface PlaybackService {
  playQueue(tracks: Track[], startId?: string): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  next(): Promise<void>;
  previous(): Promise<void>;
  seekTo(position: number): Promise<void>;
  setPlaybackMode(mode: PlaybackMode): Promise<void>;
}

export const trackPlaybackService: PlaybackService = {
  async playQueue(tracks, startId) {
    if (!tracks.length) return;

    const startIndex = Math.max(0, tracks.findIndex((track) => track.id === startId));

    await TrackPlayer.reset();
    await TrackPlayer.add(
      tracks.map((track) => ({
        id: track.id,
        url: track.localUri,
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: track.artwork,
      })),
    );
    await TrackPlayer.skip(startIndex);
    await TrackPlayer.play();
  },
  play: () => TrackPlayer.play(),
  pause: () => TrackPlayer.pause(),
  next: safeSkipToNext,
  previous: safeSkipToPrevious,
  seekTo: (position) => TrackPlayer.seekTo(position),
  async setPlaybackMode(mode) {
    if (mode === 'repeat-one') {
      await TrackPlayer.setRepeatMode(RepeatMode.Track);
      return;
    }

    await TrackPlayer.setRepeatMode(RepeatMode.Off);

    if (mode === 'shuffle') {
      await shuffleCurrentQueue();
    }
  },
};

async function safeSkipToNext() {
  try {
    await TrackPlayer.skipToNext();
  } catch {
    await TrackPlayer.seekTo(0);
    await TrackPlayer.pause();
  }
}

async function safeSkipToPrevious() {
  try {
    await TrackPlayer.skipToPrevious();
  } catch {
    await TrackPlayer.seekTo(0);
  }
}

async function shuffleCurrentQueue() {
  const queue = await TrackPlayer.getQueue();
  const activeTrack = await TrackPlayer.getActiveTrack();
  if (!queue.length || !activeTrack) return;

  const remaining = queue.filter((track) => track.id !== activeTrack.id);
  const shuffled = [...remaining].sort(() => Math.random() - 0.5);

  await TrackPlayer.reset();
  await TrackPlayer.add([activeTrack, ...shuffled]);
  await TrackPlayer.play();
}
