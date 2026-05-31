import { DownloadCandidate } from '../types';

type SearchProvider = {
  name: string;
  search(query: string): Promise<DownloadCandidate[]>;
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

const providers: SearchProvider[] = [
  { name: 'Audius', search: searchAudius },
];

export async function searchMusic(query: string): Promise<DownloadCandidate[]> {
  const term = query.trim();
  if (!term) return [];

  const settled = await Promise.allSettled(
    providers.map(async (provider) => provider.search(term)),
  );

  const candidates = settled.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : [],
  );

  return dedupeCandidates(candidates).slice(0, 36);
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
