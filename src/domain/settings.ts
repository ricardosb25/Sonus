import { defaultEqualizerSettings, EqualizerSettings } from './equalizer';
import { AppLanguage } from './language';

export type AppThemeMode = 'dark' | 'light';
export type SearchEngineId = 'audius' | 'internetArchive' | 'itunes' | 'deezer' | 'youtube';

export interface AppSettings {
  themeMode: AppThemeMode;
  language: AppLanguage;
  equalizer: EqualizerSettings;
  searchEngines: SearchEngineId[];
}

export const defaultSettings: AppSettings = {
  themeMode: 'dark',
  language: 'pt-BR',
  equalizer: defaultEqualizerSettings,
  searchEngines: ['audius', 'internetArchive', 'itunes', 'deezer'],
};

export const searchEngineOptions: Array<{
  id: SearchEngineId;
  label: string;
  description: string;
  disabled?: boolean;
}> = [
  {
    id: 'audius',
    label: 'Audius',
    description: 'Musicas completas por streaming/download permitido pela rede Audius.',
  },
  {
    id: 'internetArchive',
    label: 'Internet Archive',
    description: 'Arquivos de audio completos disponiveis publicamente no Internet Archive.',
  },
  {
    id: 'itunes',
    label: 'iTunes',
    description: 'Resultados do catalogo iTunes com audio de preview.',
  },
  {
    id: 'deezer',
    label: 'Deezer',
    description: 'Resultados do catalogo Deezer com audio de preview.',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    description: 'Busca oficial via YouTube Data API. Mostra resultados e links, sem download direto.',
  },
];
