import { Playlist } from './models';

export function createPlaylist(name: string): Playlist {
  const now = new Date().toISOString();

  return {
    id: `${slugify(name)}-${Date.now()}`,
    name: name.trim() || 'Nova playlist',
    trackIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function slugify(value: string) {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 80) || 'item'
  );
}
