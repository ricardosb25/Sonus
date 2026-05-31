import { createAudioPlaylist, setAudioModeAsync } from 'expo-audio';
import type { AudioPlaylist, AudioSource } from 'expo-audio';
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

let playlist: AudioPlaylist | null = null;
let configured = false;
let currentQueue: Track[] = [];

export const trackPlaybackService: PlaybackService = {
  async playQueue(tracks, startId) {
    if (!tracks.length) return;
    await ensureAudioMode();

    const startIndex = Math.max(0, tracks.findIndex((track) => track.id === startId));
    currentQueue = tracks;
    playlist?.destroy();
    playlist = createAudioPlaylist({
      sources: tracks.map(trackToAudioSource),
      loop: 'none',
    });
    playlist.skipTo(startIndex);
    playlist.play();
  },
  async play() {
    await ensureAudioMode();
    playlist?.play();
  },
  async pause() {
    playlist?.pause();
  },
  next: safeSkipToNext,
  previous: safeSkipToPrevious,
  async seekTo(position) {
    await playlist?.seekTo(position);
  },
  async setPlaybackMode(mode) {
    if (mode === 'shuffle') {
      await shuffleCurrentQueue();
      return;
    }

    if (playlist) {
      playlist.loop = mode === 'repeat-one' ? 'single' : 'none';
    }
  },
};

async function ensureAudioMode() {
  if (configured) return;

  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: 'doNotMix',
  });
  configured = true;
}

async function safeSkipToNext() {
  if (!playlist) return;
  const before = playlist.currentIndex;
  playlist.next();
  if (playlist.currentIndex === before && before === playlist.trackCount - 1) {
    playlist.pause();
    await playlist.seekTo(0);
  }
}

async function safeSkipToPrevious() {
  if (!playlist) return;
  playlist.previous();
}

async function shuffleCurrentQueue() {
  if (!playlist || !currentQueue.length) return;

  const activeIndex = playlist.currentIndex;
  const activeTrack = currentQueue[activeIndex];
  if (!activeTrack) return;

  const remaining = currentQueue.filter((track) => track.id !== activeTrack.id);
  const shuffled = [...remaining].sort(() => Math.random() - 0.5);

  currentQueue = [activeTrack, ...shuffled];
  playlist.destroy();
  playlist = createAudioPlaylist({
    sources: currentQueue.map(trackToAudioSource),
    loop: 'none',
  });
  playlist.play();
}

function trackToAudioSource(track: Track): AudioSource {
  return { uri: track.localUri };
}
