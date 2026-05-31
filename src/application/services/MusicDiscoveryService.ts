import {
  candidateFromDirectUrl,
  fetchLyrics,
  searchMusic,
} from '../../services/OnlineMusicService';
import { DownloadCandidate } from '../../domain/models';
import { SearchEngineId } from '../../domain/settings';

export interface MusicDiscoveryService {
  search(query: string, enabledEngines?: SearchEngineId[]): Promise<DownloadCandidate[]>;
  lyrics(artist: string, title: string): Promise<string>;
  fromDirectUrl(url: string, title: string, artist: string, album: string): DownloadCandidate;
}

export const onlineMusicDiscoveryService: MusicDiscoveryService = {
  search: searchMusic,
  lyrics: fetchLyrics,
  fromDirectUrl: candidateFromDirectUrl,
};
