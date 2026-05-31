import { createAudioPlaylist, setAudioModeAsync } from 'expo-audio';
import type { AudioPlaylist, AudioPlaylistStatus, AudioSource } from 'expo-audio';
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

let playlist: AudioPlaylist | null = null;
let configured = false;
let currentQueue: Track[] = [];
let playbackMode: PlaybackMode = 'no-repeat';
let removePlaylistListener: (() => void) | null = null;
let lastKnownIndex = 0;
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

    const startIndex = Math.max(0, tracks.findIndex((track) => track.id === startId));
    currentQueue = tracks;
    lastKnownIndex = startIndex;
    destroyPlaylist();
    playlist = createAudioPlaylist({
      sources: tracks.map(trackToAudioSource),
      loop: modeToLoop(playbackMode),
    });
    bindPlaylistEvents();
    playlist.skipTo(startIndex);
    playlist.play();
    updateSnapshotFromPlaylist();
  },
  async play() {
    await ensureAudioMode();
    playlist?.play();
    updateSnapshotFromPlaylist({ playing: true });
  },
  async pause() {
    playlist?.pause();
    updateSnapshotFromPlaylist({ playing: false });
  },
  next: safeSkipToNext,
  previous: safeSkipToPrevious,
  async seekTo(position) {
    await playlist?.seekTo(position);
    updateSnapshotFromPlaylist();
  },
  async setPlaybackMode(mode) {
    const previousMode = playbackMode;
    playbackMode = mode;

    if (mode === 'shuffle') {
      if (previousMode !== 'shuffle') {
        await shuffleCurrentQueue();
      }
      updateSnapshotFromPlaylist();
      return;
    }

    if (playlist) {
      playlist.loop = modeToLoop(mode);
    }
    updateSnapshotFromPlaylist();
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
  configured = true;
}

async function safeSkipToNext() {
  if (!playlist) return;
  const before = playlist.currentIndex;
  playlist.next();
  const after = resolvePlaylistIndex();
  if (after === before && before === playlist.trackCount - 1) {
    playlist.pause();
    await playlist.seekTo(0);
  }
  updateSnapshotFromPlaylist();
}

async function safeSkipToPrevious() {
  if (!playlist) return;
  playlist.previous();
  updateSnapshotFromPlaylist();
}

async function shuffleCurrentQueue() {
  if (!playlist || !currentQueue.length || shuffling) return;
  shuffling = true;

  try {
    const wasPlaying = snapshot.playing || playlist.playing;
    const activeIndex = resolvePlaylistIndex();
    const activeTrack = currentQueue[activeIndex];
    if (!activeTrack) return;

    const remaining = currentQueue.filter((track) => track.id !== activeTrack.id);
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);

    playlist.pause();
    destroyPlaylist();
    currentQueue = [activeTrack, ...shuffled];
    lastKnownIndex = 0;
    playlist = createAudioPlaylist({
      sources: currentQueue.map(trackToAudioSource),
      loop: modeToLoop(playbackMode),
    });
    bindPlaylistEvents();
    if (wasPlaying) {
      playlist.play();
    }
  } finally {
    shuffling = false;
  }
}

function trackToAudioSource(track: Track): AudioSource {
  return { uri: track.localUri };
}

function bindPlaylistEvents() {
  removePlaylistListener?.();
  removePlaylistListener = null;

  const subscription = playlist?.addListener('playlistStatusUpdate', updateSnapshotFromStatus);
  removePlaylistListener = () => subscription?.remove();
}

function updateSnapshotFromStatus(status: AudioPlaylistStatus) {
  lastKnownIndex = status.currentIndex;
  snapshot = {
    track: currentQueue[status.currentIndex] ?? null,
    playing: status.playing,
    position: status.currentTime,
    duration: status.duration,
    mode: playbackMode,
  };
  emitSnapshot();
}

function updateSnapshotFromPlaylist(overrides: Partial<PlaybackSnapshot> = {}) {
  if (!playlist) {
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

  const index = resolvePlaylistIndex();
  snapshot = {
    track: currentQueue[index] ?? null,
    playing: playlist.playing,
    position: playlist.currentTime,
    duration: playlist.duration,
    mode: playbackMode,
    ...overrides,
  };
  emitSnapshot();
}

function emitSnapshot() {
  listeners.forEach((listener) => listener(snapshot));
}

function modeToLoop(mode: PlaybackMode) {
  return mode === 'repeat-one' ? 'single' : 'none';
}

function resolvePlaylistIndex() {
  if (!playlist) return lastKnownIndex;

  const index = playlist.currentIndex;
  if (Number.isFinite(index) && index >= 0) {
    lastKnownIndex = index;
  }
  return lastKnownIndex;
}

function destroyPlaylist() {
  removePlaylistListener?.();
  removePlaylistListener = null;
  playlist?.pause();
  playlist?.destroy();
  playlist = null;
}
