import { AppSettings } from '../../domain/settings';
import { loadSettings, saveSettings } from '../../services/SettingsService';

export interface SettingsRepository {
  load(): Promise<AppSettings>;
  save(settings: AppSettings): Promise<void>;
}

export const fileSystemSettingsRepository: SettingsRepository = {
  load: loadSettings,
  save: saveSettings,
};
