import React from 'react';
import { Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { EqualizerPresetId, EqualizerSettings } from '../../domain/equalizer';
import { AppLanguage, languageOptions } from '../../domain/language';
import { AppThemeMode } from '../../domain/settings';
import { EqualizerPanel } from '../components/EqualizerPanel';
import { useThemedStyles } from '../styles/styles';

type Props = {
  visible: boolean;
  themeMode: AppThemeMode;
  language: AppLanguage;
  equalizer: EqualizerSettings;
  onThemeChange: (theme: AppThemeMode) => void;
  onLanguageChange: (language: AppLanguage) => void;
  onEqualizerEnabledChange: (enabled: boolean) => void;
  onEqualizerPresetChange: (preset: EqualizerPresetId) => void;
  onEqualizerBandGainChange: (bandId: string, gain: number) => void;
  onClose: () => void;
};

const themeOptions: Array<{ id: AppThemeMode; label: string; description: string }> = [
  { id: 'dark', label: 'Escuro', description: 'Interface com fundo escuro para ouvir a noite.' },
  { id: 'light', label: 'Claro', description: 'Interface clara para ambientes iluminados.' },
];

export function SettingsModal({
  visible,
  themeMode,
  language,
  equalizer,
  onThemeChange,
  onLanguageChange,
  onEqualizerEnabledChange,
  onEqualizerPresetChange,
  onEqualizerBandGainChange,
  onClose,
}: Props) {
  const styles = useThemedStyles();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.sectionTitle}>Configuracoes</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Fechar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>Tema</Text>
          <View style={styles.segmented}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.segment, themeMode === option.id && styles.segmentActive]}
                onPress={() => onThemeChange(option.id)}
              >
                <Text style={[styles.segmentText, themeMode === option.id && styles.segmentTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.settingsHint}>
            {themeOptions.find((option) => option.id === themeMode)?.description}
          </Text>
        </View>

        <View style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>Idioma</Text>
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

        <EqualizerPanel
          equalizer={equalizer}
          onEnabledChange={onEqualizerEnabledChange}
          onPresetChange={onEqualizerPresetChange}
          onBandGainChange={onEqualizerBandGainChange}
        />
      </SafeAreaView>
    </Modal>
  );
}
