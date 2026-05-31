import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EqualizerPresetId, EqualizerSettings } from '../../domain/equalizer';
import { AppLanguage, languageOptions } from '../../domain/language';
import { AppThemeMode, SearchEngineId, searchEngineOptions } from '../../domain/settings';
import { EqualizerPanel } from '../components/EqualizerPanel';
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

const themeOptions: Array<{ id: AppThemeMode; label: string; description: string }> = [
  { id: 'dark', label: 'Escuro', description: 'Interface com fundo escuro para ouvir a noite.' },
  { id: 'light', label: 'Claro', description: 'Interface clara para ambientes iluminados.' },
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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalHeader}>
          <Text style={styles.sectionTitle}>Configuracoes</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Fechar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.settingsContent}>
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

          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Motores de busca</Text>
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
                    {option.disabled ? 'Indisponivel' : active ? 'Ativo' : 'Inativo'}
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
