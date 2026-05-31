import {
  createAudioPlayer,
  requestNotificationPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import type { AudioPlayer, AudioSource, AudioStatus } from 'expo-audio';
import { Platform } from 'react-native';
import { PlaybackMode, Track } from '../../domain/models';

export type PlaybackSnapshot = {
  track: Track | null;
  playing: boolean;
  position: number;
  duration: number;
  mode: PlaybackMode;
};

type PlaybackListener = (snapshot: PlaybackSnapshot) => void;

export interface PlaybackService {
  playQueue(tracks: Track[], startId?: string): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  next(): Promise<void>;
  previous(): Promise<void>;
  seekTo(position: number): Promise<void>;
  setPlaybackMode(mode: PlaybackMode): Promise<void>;
  subscribe(listener: PlaybackListener): () => void;
  getSnapshot(): PlaybackSnapshot;
}

let player: AudioPlayer | null = null;
let configured = false;
let currentQueue: Track[] = [];
let currentIndex = 0;
let playbackMode: PlaybackMode = 'no-repeat';
let removePlayerListener: (() => void) | null = null;
let handlingFinish = false;
let shuffling = false;
const listeners = new Set<PlaybackListener>();
let snapshot: PlaybackSnapshot = {
  track: null,
  playing: false,
  position: 0,
  duration: 0,
  mode: 'no-repeat',
};

export const trackPlaybackService: PlaybackService = {
  async playQueue(tracks, startId) {
    if (!tracks.length) return;
    await ensureAudioMode();

    currentQueue = tracks;
    currentIndex = Math.max(0, tracks.findIndex((track) => track.id === startId));
    await loadCurrentTrack(true);
  },
  async play() {
    await ensureAudioMode();
    if (!player && currentQueue[currentIndex]) {
      await loadCurrentTrack(false);
    }
    player?.play();
    updateSnapshotFromPlayer({ playing: true });
  },
  async pause() {
    player?.pause();
    updateSnapshotFromPlayer({ playing: false });
  },
  next: safeSkipToNext,
  previous: safeSkipToPrevious,
  async seekTo(position) {
    await player?.seekTo(position);
    updateSnapshotFromPlayer();
  },
  async setPlaybackMode(mode) {
    const previousMode = playbackMode;
    playbackMode = mode;

    if (mode === 'shuffle' && previousMode !== 'shuffle') {
      await shuffleCurrentQueue();
    }

    updateSnapshotFromPlayer();
  },
  subscribe(listener) {
    listeners.add(listener);
    listener(snapshot);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot() {
    return snapshot;
  },
};

async function ensureAudioMode() {
  if (configured) return;

  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: 'doNotMix',
  });

  if (Platform.OS === 'android') {
    try {
      await requestNotificationPermissionsAsync();
    } catch {
      // Android versions below 13 do not need runtime notification permission.
    }
  }

  configured = true;
}

async function loadCurrentTrack(shouldPlay: boolean) {
  const track = currentQueue[currentIndex];
  if (!track) {
    destroyPlayer();
    updateSnapshotFromPlayer();
    return;
  }

  destroyPlayer();
  handlingFinish = false;
  player = createAudioPlayer(trackToAudioSource(track), {
    updateInterval: 500,
    keepAudioSessionActive: true,
  });
  bindPlayerEvents();
  activateNotificationPlayer(track);

  if (shouldPlay) {
    player.play();
  }

  updateSnapshotFromPlayer({ playing: shouldPlay });
}

async function safeSkipToNext() {
  if (!currentQueue.length) return;

  const shouldContinue = snapshot.playing || player?.playing;
  if (currentIndex >= currentQueue.length - 1) {
    await player?.seekTo(0);
    player?.pause();
    updateSnapshotFromPlayer({ playing: false, position: 0 });
    return;
  }

  currentIndex += 1;
  await loadCurrentTrack(Boolean(shouldContinue));
}

async function safeSkipToPrevious() {
  if (!currentQueue.length) return;

  const shouldContinue = snapshot.playing || player?.playing;
  if ((player?.currentTime ?? 0) > 3 || currentIndex === 0) {
    await player?.seekTo(0);
    updateSnapshotFromPlayer({ position: 0 });
    return;
  }

  currentIndex -= 1;
  await loadCurrentTrack(Boolean(shouldContinue));
}

async function handleTrackFinished() {
  if (handlingFinish) return;
  handlingFinish = true;

  if (playbackMode === 'repeat-one') {
    await player?.seekTo(0);
    player?.play();
    handlingFinish = false;
    updateSnapshotFromPlayer({ playing: true, position: 0 });
    return;
  }

  if (currentIndex < currentQueue.length - 1) {
    currentIndex += 1;
    await loadCurrentTrack(true);
    return;
  }

  await player?.seekTo(0);
  player?.pause();
  updateSnapshotFromPlayer({ playing: false, position: 0 });
}

async function shuffleCurrentQueue() {
  if (!currentQueue.length || shuffling) return;
  shuffling = true;

  try {
    const activeTrack = currentQueue[currentIndex];
    if (!activeTrack) return;

    const remaining = currentQueue.filter((track) => track.id !== activeTrack.id);
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    currentQueue = [activeTrack, ...shuffled];
    currentIndex = 0;
  } finally {
    shuffling = false;
  }
}

function trackToAudioSource(track: Track): AudioSource {
  return { uri: track.localUri, name: track.title };
}

function bindPlayerEvents() {
  removePlayerListener?.();
  removePlayerListener = null;

  const subscription = player?.addListener('playbackStatusUpdate', updateSnapshotFromStatus);
  removePlayerListener = () => subscription?.remove();
}

function activateNotificationPlayer(track: Track) {
  player?.setActiveForLockScreen(
    true,
    {
      title: track.title,
      artist: track.artist,
      albumTitle: track.album,
      artworkUrl: track.artwork,
    },
    {
      showSeekBackward: false,
      showSeekForward: false,
    },
  );
}

function updateSnapshotFromStatus(status: AudioStatus) {
  snapshot = {
    track: currentQueue[currentIndex] ?? null,
    playing: status.playing,
    position: status.currentTime,
    duration: status.duration,
    mode: playbackMode,
  };
  emitSnapshot();

  if (status.didJustFinish) {
    handleTrackFinished();
  }
}

function updateSnapshotFromPlayer(overrides: Partial<PlaybackSnapshot> = {}) {
  if (!player) {
    snapshot = {
      track: null,
      playing: false,
      position: 0,
      duration: 0,
      mode: playbackMode,
      ...overrides,
    };
    emitSnapshot();
    return;
  }

  snapshot = {
    track: currentQueue[currentIndex] ?? null,
    playing: player.playing,
    position: player.currentTime,
    duration: player.duration,
    mode: playbackMode,
    ...overrides,
  };
  emitSnapshot();
}

function emitSnapshot() {
  listeners.forEach((listener) => listener(snapshot));
}

function destroyPlayer() {
  removePlayerListener?.();
  removePlayerListener = null;
  player?.clearLockScreenControls();
  player?.pause();
  player?.remove();
  player = null;
}
