import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { DownloadCandidate } from '../../domain/models';
import { formatDuration } from '../../shared/formatDuration';
import { useThemedStyles } from '../styles/styles';
import { Cover } from './Cover';

type Props = {
  item: DownloadCandidate;
  busy: boolean;
  onDownload: () => void;
};

export function CandidateRow({ item, busy, onDownload }: Props) {
  const styles = useThemedStyles();

  return (
    <View style={styles.row}>
      <Cover uri={item.artwork} />
      <View style={styles.rowInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.trackMeta} numberOfLines={1}>{item.artist} - {item.album}</Text>
        <Text style={styles.muted}>{item.source} - {formatDuration(item.duration)}</Text>
      </View>
      <TouchableOpacity style={styles.iconButton} onPress={onDownload} disabled={busy}>
        <Text style={styles.iconButtonText}>{busy ? '...' : 'Baixar'}</Text>
      </TouchableOpacity>
    </View>
  );
}
