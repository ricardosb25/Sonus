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
  const canDownload = item.downloadable !== false && !!item.previewUrl;

  return (
    <View style={styles.row}>
      <Cover uri={item.artwork} />
      <View style={styles.rowInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.trackMeta} numberOfLines={1}>{item.artist} - {item.album}</Text>
        <Text style={styles.muted}>{item.source} - {formatDuration(item.duration)}</Text>
        {item.unavailableReason && (
          <Text style={styles.muted} numberOfLines={1}>{item.unavailableReason}</Text>
        )}
        {!canDownload && item.externalUrl && (
          <Text style={styles.copyableUrl} selectable numberOfLines={2}>
            {item.externalUrl}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[styles.iconButton, !canDownload && styles.iconButtonDisabled]}
        onPress={onDownload}
        disabled={busy || !canDownload}
      >
        <Text style={styles.iconButtonText}>{busy ? '...' : canDownload ? 'Baixar' : 'URL'}</Text>
      </TouchableOpacity>
    </View>
  );
}
