import { DownloadCandidate } from '../types';
import { SearchEngineId } from '../domain/settings';

type SearchProvider = {
  id: ActiveSearchEngineId;
  name: string;
  search(query: string): Promise<DownloadCandidate[]>;
};
type ActiveSearchEngineId = Exclude<SearchEngineId, 'youtube'>;

type ITunesResult = {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
};

type DeezerResult = {
  id?: number;
  title?: string;
  duration?: number;
  preview?: string;
  artist?: { name?: string };
  album?: { title?: string; cover_xl?: string; cover_big?: string };
};

type AudiusTrack = {
  id?: string;
  title?: string;
  duration?: number;
  user?: { name?: string };
  artwork?: {
    '150x150'?: string;
    '480x480'?: string;
    '1000x1000'?: string;
  };
};

type InternetArchiveSearchDoc = {
  identifier?: string;
  title?: string;
  creator?: string | string[];
  collection?: string | string[];
  downloads?: number;
};

type InternetArchiveSearchResponse = {
  response?: {
    docs?: InternetArchiveSearchDoc[];
  };
};

type InternetArchiveMetadata = {
  metadata?: {
    title?: string;
    creator?: string | string[];
    collection?: string | string[];
  };
  files?: Array<{
    name?: string;
    format?: string;
    length?: string;
    size?: string;
  }>;
};

const providers: SearchProvider[] = [
  { id: 'audius', name: 'Audius', search: searchAudius },
  { id: 'internetArchive', name: 'Internet Archive', search: searchInternetArchive },
  { id: 'itunes', name: 'iTunes Preview', search: searchITunes },
  { id: 'deezer', name: 'Deezer Preview', search: searchDeezer },
];

export async function searchMusic(
  query: string,
  enabledEngines: SearchEngineId[] = ['audius', 'internetArchive', 'itunes', 'deezer'],
): Promise<DownloadCandidate[]> {
  const term = query.trim();
  if (!term) return [];
  const enabled = new Set(
    enabledEngines.filter((engine): engine is ActiveSearchEngineId => engine !== 'youtube'),
  );
  const activeProviders = providers.filter((provider) => enabled.has(provider.id));
  if (!activeProviders.length) return [];

  const settled = await Promise.allSettled(
    activeProviders.map(async (provider) => provider.search(term)),
  );

  const candidates = settled.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : [],
  );

  return dedupeCandidates(candidates).slice(0, 36);
}

async function searchITunes(query: string): Promise<DownloadCandidate[]> {
  const response = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=24`,
  );
  const data = await response.json();
  const results = Array.isArray(data.results) ? (data.results as ITunesResult[]) : [];

  return results
    .filter((item) => item.previewUrl && item.trackName)
    .map((item) => ({
      id: `itunes-${item.trackId ?? item.previewUrl}`,
      title: item.trackName ?? 'Musica sem titulo',
      artist: item.artistName ?? 'Artista desconhecido',
      album: item.collectionName ?? 'Album desconhecido',
      artwork: item.artworkUrl100?.replace('100x100bb', '600x600bb'),
      previewUrl: item.previewUrl ?? '',
      duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : undefined,
      source: 'iTunes Preview',
    }));
}

async function searchDeezer(query: string): Promise<DownloadCandidate[]> {
  const response = await fetch(
    `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=24`,
  );
  const data = await response.json();
  const results = Array.isArray(data.data) ? (data.data as DeezerResult[]) : [];

  return results
    .filter((item) => item.preview && item.title)
    .map((item) => ({
      id: `deezer-${item.id ?? item.preview}`,
      title: item.title ?? 'Musica sem titulo',
      artist: item.artist?.name ?? 'Artista desconhecido',
      album: item.album?.title ?? 'Album desconhecido',
      artwork: item.album?.cover_xl ?? item.album?.cover_big,
      previewUrl: item.preview ?? '',
      duration: item.duration,
      source: 'Deezer Preview',
    }));
}

async function searchAudius(query: string): Promise<DownloadCandidate[]> {
  const host = await getAudiusHost();
  const response = await fetch(
    `${host}/v1/tracks/search?query=${encodeURIComponent(query)}&limit=24&app_name=Sonus`,
  );
  const data = await response.json();
  const results = Array.isArray(data.data) ? (data.data as AudiusTrack[]) : [];

  return results
    .filter((item) => item.id && item.title)
    .map((item) => ({
      id: `audius-${item.id}`,
      title: item.title ?? 'Musica sem titulo',
      artist: item.user?.name ?? 'Artista desconhecido',
      album: 'Audius',
      artwork: item.artwork?.['1000x1000'] ?? item.artwork?.['480x480'] ?? item.artwork?.['150x150'],
      previewUrl: `${host}/v1/tracks/${item.id}/stream?app_name=Sonus`,
      duration: item.duration,
      source: 'Audius',
    }));
}

async function getAudiusHost() {
  try {
    const response = await fetch('https://api.audius.co');
    const data = await response.json();
    if (Array.isArray(data.data) && data.data[0]) {
      return data.data[0] as string;
    }
  } catch {
    // Fallback discovery provider.
  }

  return 'https://discoveryprovider.audius.co';
}

async function searchInternetArchive(query: string): Promise<DownloadCandidate[]> {
  const search = await fetch(
    'https://archive.org/advancedsearch.php?' +
      [
        `q=${encodeURIComponent(`(${query}) AND mediatype:audio`)}`,
        'fl[]=identifier',
        'fl[]=title',
        'fl[]=creator',
        'fl[]=collection',
        'fl[]=downloads',
        'rows=12',
        'page=1',
        'sort[]=downloads desc',
        'output=json',
      ].join('&'),
  );
  const data = (await search.json()) as InternetArchiveSearchResponse;
  const docs = data.response?.docs ?? [];

  const candidates = await Promise.all(
    docs
      .filter((doc) => doc.identifier)
      .slice(0, 8)
      .map((doc) => internetArchiveDocToCandidate(doc)),
  );

  return candidates.filter((candidate): candidate is DownloadCandidate => Boolean(candidate));
}

async function internetArchiveDocToCandidate(
  doc: InternetArchiveSearchDoc,
): Promise<DownloadCandidate | null> {
  const identifier = doc.identifier;
  if (!identifier) return null;

  try {
    const response = await fetch(`https://archive.org/metadata/${encodeURIComponent(identifier)}`);
    const metadata = (await response.json()) as InternetArchiveMetadata;
    const audioFile = metadata.files?.find(isPlayableArchiveAudio);
    if (!audioFile?.name) return null;

    const title = firstString(metadata.metadata?.title ?? doc.title) || audioFile.name;
    const artist = firstString(metadata.metadata?.creator ?? doc.creator) || 'Internet Archive';
    const album = firstString(metadata.metadata?.collection ?? doc.collection) || 'Internet Archive';
    const duration = Number(audioFile.length);

    return {
      id: `archive-${identifier}-${audioFile.name}`,
      title,
      artist,
      album,
      artwork: `https://archive.org/services/img/${encodeURIComponent(identifier)}`,
      previewUrl: `https://archive.org/download/${encodeURIComponent(identifier)}/${encodeArchivePath(audioFile.name)}`,
      duration: Number.isFinite(duration) ? Math.round(duration) : undefined,
      source: 'Internet Archive',
    };
  } catch {
    return null;
  }
}

function isPlayableArchiveAudio(file: { name?: string; format?: string }) {
  const name = file.name?.toLowerCase() ?? '';
  const format = file.format?.toLowerCase() ?? '';

  return (
    name.endsWith('.mp3') ||
    name.endsWith('.m4a') ||
    name.endsWith('.ogg') ||
    name.endsWith('.flac') ||
    format.includes('mp3') ||
    format.includes('ogg') ||
    format.includes('flac')
  );
}

function firstString(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function encodeArchivePath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function dedupeCandidates(candidates: DownloadCandidate[]) {
  const seen = new Set<string>();
  const unique: DownloadCandidate[] = [];

  candidates.forEach((candidate) => {
    const key = normalizeKey(candidate);
    if (seen.has(key)) return;

    seen.add(key);
    unique.push(candidate);
  });

  return unique;
}

function normalizeKey(candidate: DownloadCandidate) {
  return [candidate.title, candidate.artist, candidate.album]
    .map((value) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '')
        .toLowerCase(),
    )
    .join('|');
}

export async function fetchLyrics(artist: string, title: string): Promise<string> {
  const response = await fetch(
    `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
  );

  if (!response.ok) {
    throw new Error('Letra nao encontrada.');
  }

  const data = await response.json();
  if (!data.lyrics) {
    throw new Error('Letra nao encontrada.');
  }

  return String(data.lyrics).trim();
}

export function candidateFromDirectUrl(url: string, title: string, artist: string, album: string): DownloadCandidate {
  return {
    id: `${url}-${Date.now()}`,
    title: title.trim() || 'Musica importada',
    artist: artist.trim() || 'Artista desconhecido',
    album: album.trim() || 'Downloads',
    previewUrl: url.trim(),
    source: 'URL direta',
  };
}
