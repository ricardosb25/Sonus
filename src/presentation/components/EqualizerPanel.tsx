import Slider from '@react-native-community/slider';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { EqualizerPresetId, EqualizerSettings, equalizerPresets } from '../../domain/equalizer';
import { useThemedStyles } from '../styles/styles';

type Props = {
  equalizer: EqualizerSettings;
  compact?: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onPresetChange: (preset: EqualizerPresetId) => void;
  onBandGainChange: (bandId: string, gain: number) => void;
};

export function EqualizerPanel({
  equalizer,
  compact,
  onEnabledChange,
  onPresetChange,
  onBandGainChange,
}: Props) {
  const styles = useThemedStyles();

  return (
    <View style={styles.equalizerBox}>
      <View style={styles.equalizerHeader}>
        <View>
          <Text style={styles.settingsLabel}>Equalizador</Text>
          {!compact && (
            <Text style={styles.settingsHint}>
              Ajuste as frequencias da reproducao conforme seu fone ou caixa.
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.modeButton, equalizer.enabled && styles.modeButtonActive]}
          onPress={() => onEnabledChange(!equalizer.enabled)}
        >
          <Text style={[styles.modeText, equalizer.enabled && styles.modeTextActive]}>
            {equalizer.enabled ? 'Ligado' : 'Desligado'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.equalizerPresets}>
        {equalizerPresets.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={[styles.presetButton, equalizer.preset === preset.id && styles.modeButtonActive]}
            onPress={() => onPresetChange(preset.id)}
          >
            <Text style={[styles.modeText, equalizer.preset === preset.id && styles.modeTextActive]}>
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {equalizer.bands.map((band) => (
        <View key={band.id} style={styles.equalizerBand}>
          <View style={styles.equalizerBandLabelRow}>
            <Text style={styles.trackMeta}>{band.label}</Text>
            <Text style={styles.muted}>{band.gain > 0 ? '+' : ''}{band.gain} dB</Text>
          </View>
          <Slider
            style={styles.equalizerSlider}
            minimumValue={-10}
            maximumValue={10}
            step={1}
            value={band.gain}
            minimumTrackTintColor="#5eead4"
            maximumTrackTintColor="#344"
            thumbTintColor="#5eead4"
            disabled={!equalizer.enabled}
            onSlidingComplete={(value) => onBandGainChange(band.id, value)}
          />
        </View>
      ))}
    </View>
  );
}
