import { useCallback, useEffect, useState } from 'react';
import { fileSystemSettingsRepository, SettingsRepository } from '../../data/repositories/SettingsRepository';
import {
  applyEqualizerPreset,
  EqualizerPresetId,
  EqualizerSettings,
  updateEqualizerBand,
} from '../../domain/equalizer';
import { AppLanguage } from '../../domain/language';
import { AppSettings, AppThemeMode, defaultSettings } from '../../domain/settings';

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
      setSettings(await settingsRepository.load());
      setReady(true);
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
      updateEqualizerEnabled,
      updateEqualizerPreset,
      updateEqualizerBandGain,
      replaceEqualizer,
    },
  };
}
