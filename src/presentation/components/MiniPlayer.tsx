import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Track } from '../../domain/models';
import { useI18n } from '../i18n';
import { useThemedStyles } from '../styles/styles';

export function MiniPlayer({
  track,
  playing,
  onOpen,
  onTogglePlayback,
}: {
  track: Track | null;
  playing: boolean;
  onOpen: () => void;
  onTogglePlayback: () => void;
}) {
  const styles = useThemedStyles();
  const t = useI18n();

  if (!track) return null;

  return (
    <TouchableOpacity style={styles.miniPlayer} onPress={onOpen}>
      <Text style={styles.miniTitle} numberOfLines={1}>{track.title}</Text>
      <TouchableOpacity
        onPress={onTogglePlayback}
        style={styles.miniControl}
      >
        <Text style={styles.miniControlText}>{playing ? t('common.pause') : t('common.play')}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
