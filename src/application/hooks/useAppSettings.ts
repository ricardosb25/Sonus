import { useCallback, useEffect, useState } from 'react';
import { fileSystemSettingsRepository, SettingsRepository } from '../../data/repositories/SettingsRepository';
import {
  applyEqualizerPreset,
  EqualizerPresetId,
  EqualizerSettings,
  updateEqualizerBand,
} from '../../domain/equalizer';
import { AppLanguage } from '../../domain/language';
import { AppSettings, AppThemeMode, defaultSettings, SearchEngineId } from '../../domain/settings';

type Dependencies = {
  settingsRepository?: SettingsRepository;
};

export function useAppSettings({
  settingsRepository = fileSystemSettingsRepository,
}: Dependencies = {}) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    async function boot() {
      try {
        setSettings(await settingsRepository.load());
      } catch {
        setSettings(defaultSettings);
      } finally {
        setReady(true);
      }
    }

    boot();
  }, [settingsRepository]);

  const updateTheme = useCallback(
    async (themeMode: AppThemeMode) => {
      const next = { ...settings, themeMode };
      setSettings(next);
      await settingsRepository.save(next);
    },
    [settings, settingsRepository],
  );

  const updateLanguage = useCallback(
    async (language: AppLanguage) => {
      const next = { ...settings, language };
      setSettings(next);
      await settingsRepository.save(next);
    },
    [settings, settingsRepository],
  );

  const toggleSearchEngine = useCallback(
    async (engine: SearchEngineId) => {
      if (engine === 'youtube') return;

      const enabled = settings.searchEngines.includes(engine);
      const nextEngines = enabled
        ? settings.searchEngines.filter((item) => item !== engine)
        : [...settings.searchEngines, engine];
      const next = { ...settings, searchEngines: nextEngines };
      setSettings(next);
      await settingsRepository.save(next);
    },
    [settings, settingsRepository],
  );

  const updateEqualizerEnabled = useCallback(
    async (enabled: boolean) => {
      const next = { ...settings, equalizer: { ...settings.equalizer, enabled } };
      setSettings(next);
      await settingsRepository.save(next);
    },
    [settings, settingsRepository],
  );

  const updateEqualizerPreset = useCallback(
    async (preset: EqualizerPresetId) => {
      const next = { ...settings, equalizer: applyEqualizerPreset(preset) };
      setSettings(next);
      await settingsRepository.save(next);
    },
    [settings, settingsRepository],
  );

  const updateEqualizerBandGain = useCallback(
    async (bandId: string, gain: number) => {
      const next = {
        ...settings,
        equalizer: updateEqualizerBand(settings.equalizer, bandId, gain),
      };
      setSettings(next);
      await settingsRepository.save(next);
    },
    [settings, settingsRepository],
  );

  const replaceEqualizer = useCallback(
    async (equalizer: EqualizerSettings) => {
      const next = { ...settings, equalizer };
      setSettings(next);
      await settingsRepository.save(next);
    },
    [settings, settingsRepository],
  );

  return {
    state: {
      ready,
      settings,
      settingsOpen,
    },
    actions: {
      setSettingsOpen,
      updateTheme,
      updateLanguage,
      toggleSearchEngine,
      updateEqualizerEnabled,
      updateEqualizerPreset,
      updateEqualizerBandGain,
      replaceEqualizer,
    },
  };
}
