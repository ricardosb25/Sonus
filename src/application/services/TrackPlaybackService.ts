import TrackPlayer, { RepeatMode } from 'react-native-track-player';
import { PlaybackMode, Track } from '../../domain/models';
import { setupPlayer } from '../../services/TrackPlayerService';

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
    await ensurePlayerReady();

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
  async play() {
    await ensurePlayerReady();
    await TrackPlayer.play();
  },
  async pause() {
    await ensurePlayerReady();
    await TrackPlayer.pause();
  },
  next: safeSkipToNext,
  previous: safeSkipToPrevious,
  async seekTo(position) {
    await ensurePlayerReady();
    await TrackPlayer.seekTo(position);
  },
  async setPlaybackMode(mode) {
    await ensurePlayerReady();
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

async function ensurePlayerReady() {
  const ready = await setupPlayer();
  if (!ready) {
    throw new Error('Nao foi possivel iniciar o player.');
  }
}

async function safeSkipToNext() {
  await ensurePlayerReady();
  try {
    await TrackPlayer.skipToNext();
  } catch {
    await TrackPlayer.seekTo(0);
    await TrackPlayer.pause();
  }
}

async function safeSkipToPrevious() {
  await ensurePlayerReady();
  try {
    await TrackPlayer.skipToPrevious();
  } catch {
    await TrackPlayer.seekTo(0);
  }
}

async function shuffleCurrentQueue() {
  await ensurePlayerReady();
  const queue = await TrackPlayer.getQueue();
  const activeTrack = await TrackPlayer.getActiveTrack();
  if (!queue.length || !activeTrack) return;

  const remaining = queue.filter((track) => track.id !== activeTrack.id);
  const shuffled = [...remaining].sort(() => Math.random() - 0.5);

  await TrackPlayer.reset();
  await TrackPlayer.add([activeTrack, ...shuffled]);
  await TrackPlayer.play();
}
