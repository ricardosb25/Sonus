import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trackPlaybackService } from '../../application/services/TrackPlaybackService';
import type { PlaybackSnapshot } from '../../application/services/TrackPlaybackService';
import { EqualizerPresetId, EqualizerSettings } from '../../domain/equalizer';
import { PlaybackMode } from '../../domain/models';
import { formatDuration } from '../../shared/formatDuration';
import { Cover } from '../components/Cover';
import { EqualizerPanel } from '../components/EqualizerPanel';
import { useI18n } from '../i18n';
import { useThemedStyles } from '../styles/styles';

type Props = {
  visible: boolean;
  playback: PlaybackSnapshot;
  equalizer: EqualizerSettings;
  onTogglePlayback: () => void;
  onClose: () => void;
  onEqualizerEnabledChange: (enabled: boolean) => void;
  onEqualizerPresetChange: (preset: EqualizerPresetId) => void;
  onEqualizerBandGainChange: (bandId: string, gain: number) => void;
};

export function PlayerModal({
  visible,
  playback,
  equalizer,
  onTogglePlayback,
  onClose,
  onEqualizerEnabledChange,
  onEqualizerPresetChange,
  onEqualizerBandGainChange,
}: Props) {
  const styles = useThemedStyles();
  const t = useI18n();
  const [localMode, setLocalMode] = useState<PlaybackMode>('no-repeat');
  const activeMode = playback.mode ?? localMode;

  const changePlaybackMode = async (mode: PlaybackMode) => {
    setLocalMode(mode);
    await trackPlaybackService.setPlaybackMode(mode);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.player} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalHeader}>
          <Text style={styles.sectionTitle}>{t('player.nowPlaying')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.playerBody}>
          <Cover uri={playback.track?.artwork} />
          <Text style={styles.nowTitle} numberOfLines={2}>{playback.track?.title ?? t('player.nothingPlaying')}</Text>
          <Text style={styles.nowArtist}>{playback.track?.artist ?? t('player.chooseSong')}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={playback.duration || 1}
            value={Math.min(playback.position, playback.duration || 1)}
            minimumTrackTintColor="#5eead4"
            maximumTrackTintColor="#344"
            thumbTintColor="#5eead4"
            onSlidingComplete={(value) => trackPlaybackService.seekTo(value)}
          />
          <View style={styles.timeRow}>
            <Text style={styles.muted}>{formatDuration(playback.position)}</Text>
            <Text style={styles.muted}>{formatDuration(playback.duration)}</Text>
          </View>
          <View style={styles.playbackModes}>
            <TouchableOpacity
              style={[styles.modeButton, activeMode === 'shuffle' && styles.modeButtonActive]}
              onPress={() => changePlaybackMode('shuffle')}
            >
              <Text style={[styles.modeText, activeMode === 'shuffle' && styles.modeTextActive]}>
                {t('player.shuffle')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, activeMode === 'repeat-one' && styles.modeButtonActive]}
              onPress={() => changePlaybackMode('repeat-one')}
            >
              <Text style={[styles.modeText, activeMode === 'repeat-one' && styles.modeTextActive]}>
                {t('player.repeatOne')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, activeMode === 'no-repeat' && styles.modeButtonActive]}
              onPress={() => changePlaybackMode('no-repeat')}
            >
              <Text style={[styles.modeText, activeMode === 'no-repeat' && styles.modeTextActive]}>
                {t('player.noRepeat')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.playerControls}>
            <TouchableOpacity style={styles.roundButton} onPress={trackPlaybackService.previous}>
              <Text style={styles.roundText}>{t('player.previous')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.playButton}
              onPress={onTogglePlayback}
            >
              <Text style={styles.playText}>{playback.playing ? t('common.pause') : t('common.play')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.roundButton} onPress={trackPlaybackService.next}>
              <Text style={styles.roundText}>{t('player.next')}</Text>
            </TouchableOpacity>
          </View>
          <EqualizerPanel
            equalizer={equalizer}
            compact
            onEnabledChange={onEqualizerEnabledChange}
            onPresetChange={onEqualizerPresetChange}
            onBandGainChange={onEqualizerBandGainChange}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
