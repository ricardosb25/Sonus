export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork?: string;
  localUri: string;
  sourceUrl?: string;
  duration?: number;
  lyrics?: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LibraryData {
  tracks: Track[];
  playlists: Playlist[];
  lastUpdated: string;
}

export interface DownloadCandidate {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork?: string;
  previewUrl: string;
  duration?: number;
  source: string;
}

export type DownloadQueueStatus = 'queued' | 'downloading' | 'paused' | 'completed' | 'error';

export interface DownloadQueueItem {
  id: string;
  candidate: DownloadCandidate;
  status: DownloadQueueStatus;
  progress: number;
  createdAt: string;
  error?: string;
}

export interface ImportedAudioFile {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

export interface ImportedTrackMetadata {
  title: string;
  artist: string;
  album: string;
}

export type LibraryFilter = 'all' | 'favorites' | 'artists' | 'albums';
export type AppTab = 'download' | 'downloads' | 'library' | 'playlists';
export type PlaybackMode = 'shuffle' | 'repeat-one' | 'no-repeat';
