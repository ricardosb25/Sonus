import * as FileSystem from 'expo-file-system/legacy';
import {
  DownloadCandidate,
  ImportedAudioFile,
  ImportedTrackMetadata,
  LibraryData,
  Track,
} from '../domain/models';
import { slugify } from '../domain/playlistFactory';

const DOCUMENT_DIR = ((FileSystem as any).documentDirectory ?? '') as string;
const ROOT_DIR = `${DOCUMENT_DIR}sonus/`;
const AUDIO_DIR = `${ROOT_DIR}audio/`;
const ARTWORK_DIR = `${ROOT_DIR}artwork/`;
const DB_PATH = `${ROOT_DIR}library.json`;

const emptyLibrary = (): LibraryData => ({
  tracks: [],
  playlists: [],
  lastUpdated: new Date().toISOString(),
});

const fileExtension = (url: string, fallback = 'm4a') => {
  const clean = url.split('?')[0];
  const match = clean.match(/\.([a-zA-Z0-9]{2,5})$/);
  return match ? match[1].toLowerCase() : fallback;
};

const titleFromFileName = (name: string) =>
  name.replace(/\.[a-zA-Z0-9]{2,5}$/, '').replace(/[_-]+/g, ' ').trim();

export type DownloadProgressHandler = (progress: number) => void;

export interface RunningDownload {
  promise: Promise<Track>;
  pause: () => Promise<void>;
}

export async function ensureLibraryStorage() {
  await FileSystem.makeDirectoryAsync(ROOT_DIR, { intermediates: true });
  await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
  await FileSystem.makeDirectoryAsync(ARTWORK_DIR, { intermediates: true });

  const db = await FileSystem.getInfoAsync(DB_PATH);
  if (!db.exists) {
    await writeLibraryFile(emptyLibrary());
  }
}

export async function loadLibrary(): Promise<LibraryData> {
  await ensureLibraryStorage();
  try {
    const raw = await FileSystem.readAsStringAsync(DB_PATH);
    const parsed = JSON.parse(raw) as LibraryData;
    return {
      tracks: parsed.tracks ?? [],
      playlists: parsed.playlists ?? [],
      lastUpdated: parsed.lastUpdated ?? new Date().toISOString(),
    };
  } catch {
    const fresh = emptyLibrary();
    await saveLibrary(fresh);
    return fresh;
  }
}

export async function saveLibrary(data: LibraryData) {
  await ensureLibraryStorage();
  await writeLibraryFile(data);
}

async function writeLibraryFile(data: LibraryData) {
  const payload: LibraryData = {
    ...data,
    tracks: data.tracks ?? [],
    playlists: data.playlists ?? [],
    lastUpdated: new Date().toISOString(),
  };
  await FileSystem.writeAsStringAsync(DB_PATH, JSON.stringify(payload, null, 2));
}

export async function downloadTrack(candidate: DownloadCandidate): Promise<Track> {
  const running = startDownloadTrack(candidate);
  return running.promise;
}

export function startDownloadTrack(
  candidate: DownloadCandidate,
  onProgress: DownloadProgressHandler = () => undefined,
): RunningDownload {
  let audioDownload: ReturnType<typeof FileSystem.createDownloadResumable> | null = null;

  const promise = (async () => {
    await ensureLibraryStorage();
    const stamp = Date.now();
    const baseName = `${slugify(candidate.artist)}-${slugify(candidate.title)}-${stamp}`;
    const audioUri = `${AUDIO_DIR}${baseName}.${fileExtension(candidate.previewUrl, candidate.source === 'Audius' ? 'mp3' : 'm4a')}`;

    audioDownload = FileSystem.createDownloadResumable(
      candidate.previewUrl,
      audioUri,
      {},
      (progress) => {
        const total = progress.totalBytesExpectedToWrite;
        onProgress(total > 0 ? progress.totalBytesWritten / total : 0);
      },
    );

    const audio = await audioDownload.downloadAsync();
    if (!audio || audio.status < 200 || audio.status >= 300) {
      throw new Error('Nao foi possivel baixar o audio.');
    }

    let artwork: string | undefined;
    if (candidate.artwork) {
      try {
        const coverUri = `${ARTWORK_DIR}${baseName}.${fileExtension(candidate.artwork, 'jpg')}`;
        const cover = await FileSystem.downloadAsync(candidate.artwork, coverUri);
        artwork = cover.status >= 200 && cover.status < 300 ? cover.uri : candidate.artwork;
      } catch {
        artwork = candidate.artwork;
      }
    }

    onProgress(1);

    return {
      id: `${baseName}`,
      title: candidate.title.trim() || 'Musica sem titulo',
      artist: candidate.artist.trim() || 'Artista desconhecido',
      album: candidate.album.trim() || 'Album desconhecido',
      artwork,
      localUri: audio.uri,
      sourceUrl: candidate.previewUrl,
      duration: candidate.duration,
      lyrics: '',
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };
  })();

  return {
    promise,
    pause: async () => {
      await audioDownload?.pauseAsync();
    },
  };
}

export async function importTrackFromFile(
  file: ImportedAudioFile,
  metadata: ImportedTrackMetadata,
): Promise<Track> {
  await ensureLibraryStorage();

  const stamp = Date.now();
  const title = metadata.title.trim() || titleFromFileName(file.name) || 'Musica importada';
  const artist = metadata.artist.trim() || 'Artista desconhecido';
  const album = metadata.album.trim() || 'Arquivos locais';
  const baseName = `${slugify(artist)}-${slugify(title)}-${stamp}`;
  const audioUri = `${AUDIO_DIR}${baseName}.${fileExtension(file.name, 'mp3')}`;

  await FileSystem.copyAsync({ from: file.uri, to: audioUri });

  return {
    id: baseName,
    title,
    artist,
    album,
    localUri: audioUri,
    sourceUrl: file.uri,
    lyrics: '',
    isFavorite: false,
    createdAt: new Date().toISOString(),
  };
}

export async function deleteTrackFiles(track: Track) {
  await FileSystem.deleteAsync(track.localUri, { idempotent: true });
  if (track.artwork?.startsWith(DOCUMENT_DIR)) {
    await FileSystem.deleteAsync(track.artwork, { idempotent: true });
  }
}
