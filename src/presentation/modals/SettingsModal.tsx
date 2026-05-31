import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EqualizerPresetId, EqualizerSettings } from '../../domain/equalizer';
import { AppLanguage, languageOptions } from '../../domain/language';
import { AppThemeMode, SearchEngineId, searchEngineOptions } from '../../domain/settings';
import { EqualizerPanel } from '../components/EqualizerPanel';
import { useI18n } from '../i18n';
import { useThemedStyles } from '../styles/styles';

type Props = {
  visible: boolean;
  themeMode: AppThemeMode;
  language: AppLanguage;
  searchEngines: SearchEngineId[];
  equalizer: EqualizerSettings;
  onThemeChange: (theme: AppThemeMode) => void;
  onLanguageChange: (language: AppLanguage) => void;
  onToggleSearchEngine: (engine: SearchEngineId) => void;
  onEqualizerEnabledChange: (enabled: boolean) => void;
  onEqualizerPresetChange: (preset: EqualizerPresetId) => void;
  onEqualizerBandGainChange: (bandId: string, gain: number) => void;
  onClose: () => void;
};

const themeOptions: Array<{ id: AppThemeMode; labelKey: 'settings.dark' | 'settings.light'; hintKey: 'settings.darkHint' | 'settings.lightHint' }> = [
  { id: 'dark', labelKey: 'settings.dark', hintKey: 'settings.darkHint' },
  { id: 'light', labelKey: 'settings.light', hintKey: 'settings.lightHint' },
];

export function SettingsModal({
  visible,
  themeMode,
  language,
  searchEngines,
  equalizer,
  onThemeChange,
  onLanguageChange,
  onToggleSearchEngine,
  onEqualizerEnabledChange,
  onEqualizerPresetChange,
  onEqualizerBandGainChange,
  onClose,
}: Props) {
  const styles = useThemedStyles();
  const t = useI18n();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalHeader}>
          <Text style={styles.sectionTitle}>{t('settings.title')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.settingsContent}>
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>{t('settings.theme')}</Text>
            <View style={styles.segmented}>
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.segment, themeMode === option.id && styles.segmentActive]}
                  onPress={() => onThemeChange(option.id)}
                >
                  <Text style={[styles.segmentText, themeMode === option.id && styles.segmentTextActive]}>
                    {t(option.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.settingsHint}>
              {t(themeOptions.find((option) => option.id === themeMode)?.hintKey ?? 'settings.darkHint')}
            </Text>
          </View>

          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>{t('settings.language')}</Text>
            <View style={styles.segmented}>
              {languageOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.segment, language === option.id && styles.segmentActive]}
                  onPress={() => onLanguageChange(option.id)}
                >
                  <Text style={[styles.segmentText, language === option.id && styles.segmentTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.settingsHint}>
              {languageOptions.find((option) => option.id === language)?.description}
            </Text>
          </View>

          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>{t('settings.searchEngines')}</Text>
            {searchEngineOptions.map((option) => {
              const active = searchEngines.includes(option.id);
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.settingsToggleRow,
                    active && styles.settingsToggleActive,
                    option.disabled && styles.settingsToggleDisabled,
                  ]}
                  onPress={() => onToggleSearchEngine(option.id)}
                  disabled={option.disabled}
                >
                  <View style={styles.rowInfo}>
                    <Text style={styles.trackTitle}>{option.label}</Text>
                    <Text style={styles.settingsHint}>{option.description}</Text>
                  </View>
                  <Text style={[styles.batchButtonText, active && styles.actionTextActive]}>
                    {option.disabled ? t('settings.unavailable') : active ? t('settings.active') : t('settings.inactive')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <EqualizerPanel
            equalizer={equalizer}
            onEnabledChange={onEqualizerEnabledChange}
            onPresetChange={onEqualizerPresetChange}
            onBandGainChange={onEqualizerBandGainChange}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
