import { LibraryFilter, Playlist, Track } from './models';

export function buildTracksById(tracks: Track[]) {
  return new Map(tracks.map((track) => [track.id, track]));
}

export function getVisibleTracks(tracks: Track[], filter: LibraryFilter) {
  if (filter === 'favorites') {
    return tracks.filter((track) => track.isFavorite);
  }

  return [...tracks].sort(byTitle);
}

export function groupTracks(tracks: Track[], filter: LibraryFilter) {
  const key = filter === 'albums' ? 'album' : 'artist';
  const groups = new Map<string, Track[]>();

  tracks.forEach((track) => {
    const groupName = track[key] || 'Desconhecido';
    groups.set(groupName, [...(groups.get(groupName) ?? []), track]);
  });

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function resolvePlaylistTracks(playlist: Playlist | null, tracksById: Map<string, Track>) {
  if (!playlist) return [];

  return playlist.trackIds
    .map((id) => tracksById.get(id))
    .filter((track): track is Track => Boolean(track));
}

export function byTitle(a: Track, b: Track) {
  return a.title.localeCompare(b.title);
}
