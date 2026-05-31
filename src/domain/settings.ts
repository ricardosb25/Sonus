import { defaultEqualizerSettings, EqualizerSettings } from './equalizer';
import { AppLanguage } from './language';

export type AppThemeMode = 'dark' | 'light';

export interface AppSettings {
  themeMode: AppThemeMode;
  language: AppLanguage;
  equalizer: EqualizerSettings;
}

export const defaultSettings: AppSettings = {
  themeMode: 'dark',
  language: 'pt-BR',
  equalizer: defaultEqualizerSettings,
};
