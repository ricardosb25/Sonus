export type EqualizerPresetId = 'flat' | 'bass' | 'vocal' | 'treble' | 'custom';

export interface EqualizerBand {
  id: string;
  label: string;
  frequency: number;
  gain: number;
}

export interface EqualizerSettings {
  enabled: boolean;
  preset: EqualizerPresetId;
  bands: EqualizerBand[];
}

export const defaultEqualizerBands: EqualizerBand[] = [
  { id: '60hz', label: '60 Hz', frequency: 60, gain: 0 },
  { id: '230hz', label: '230 Hz', frequency: 230, gain: 0 },
  { id: '910hz', label: '910 Hz', frequency: 910, gain: 0 },
  { id: '4khz', label: '4 kHz', frequency: 4000, gain: 0 },
  { id: '14khz', label: '14 kHz', frequency: 14000, gain: 0 },
];

export const equalizerPresets: Array<{
  id: EqualizerPresetId;
  label: string;
  gains: number[];
}> = [
  { id: 'flat', label: 'Plano', gains: [0, 0, 0, 0, 0] },
  { id: 'bass', label: 'Graves', gains: [6, 4, 1, -1, -2] },
  { id: 'vocal', label: 'Voz', gains: [-2, 0, 4, 3, 1] },
  { id: 'treble', label: 'Agudos', gains: [-2, -1, 1, 4, 6] },
];

export const defaultEqualizerSettings: EqualizerSettings = {
  enabled: false,
  preset: 'flat',
  bands: defaultEqualizerBands,
};

export function applyEqualizerPreset(preset: EqualizerPresetId): EqualizerSettings {
  const match = equalizerPresets.find((item) => item.id === preset) ?? equalizerPresets[0];

  return {
    enabled: true,
    preset,
    bands: defaultEqualizerBands.map((band, index) => ({
      ...band,
      gain: match.gains[index] ?? 0,
    })),
  };
}

export function updateEqualizerBand(
  equalizer: EqualizerSettings,
  bandId: string,
  gain: number,
): EqualizerSettings {
  return {
    ...equalizer,
    enabled: true,
    preset: 'custom',
    bands: equalizer.bands.map((band) =>
      band.id === bandId ? { ...band, gain: Math.round(gain) } : band,
    ),
  };
}
