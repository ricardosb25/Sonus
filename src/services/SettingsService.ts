import * as FileSystem from 'expo-file-system/legacy';
import { AppSettings, defaultSettings } from '../domain/settings';

const DOCUMENT_DIR = ((FileSystem as any).documentDirectory ?? '') as string;
const ROOT_DIR = `${DOCUMENT_DIR}sonus/`;
const SETTINGS_PATH = `${ROOT_DIR}settings.json`;

async function ensureSettingsStorage() {
  await FileSystem.makeDirectoryAsync(ROOT_DIR, { intermediates: true });
}

export async function loadSettings(): Promise<AppSettings> {
  await ensureSettingsStorage();

  try {
    const info = await FileSystem.getInfoAsync(SETTINGS_PATH);
    if (!info.exists) return defaultSettings;

    const raw = await FileSystem.readAsStringAsync(SETTINGS_PATH);
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...defaultSettings,
      ...parsed,
      language: parsed.language ?? defaultSettings.language,
      searchEngines: parsed.searchEngines ?? defaultSettings.searchEngines,
      equalizer: {
        ...defaultSettings.equalizer,
        ...parsed.equalizer,
        bands: parsed.equalizer?.bands ?? defaultSettings.equalizer.bands,
      },
    };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings) {
  await ensureSettingsStorage();
  await FileSystem.writeAsStringAsync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}
