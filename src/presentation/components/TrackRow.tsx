import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Track } from '../../domain/models';
import { useI18n } from '../i18n';
import { useThemedStyles } from '../styles/styles';
import { ActionButton } from './ActionButton';
import { Cover } from './Cover';

type Props = {
  track: Track;
  onPlay: () => void;
  onFavorite: () => void;
  onLyrics: () => void;
  onPlaylist: () => void;
  onDelete: () => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelection?: () => void;
};

export function TrackRow({
  track,
  onPlay,
  onFavorite,
  onLyrics,
  onPlaylist,
  onDelete,
  selectionMode,
  selected,
  onToggleSelection,
}: Props) {
  const styles = useThemedStyles();
  const t = useI18n();

  return (
    <View style={[styles.row, selected && styles.rowSelected]}>
      {selectionMode && (
        <TouchableOpacity style={[styles.checkBox, selected && styles.checkBoxActive]} onPress={onToggleSelection}>
          <Text style={[styles.checkBoxText, selected && styles.checkBoxTextActive]}>
            {selected ? 'OK' : ''}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.rowTap}
        onPress={selectionMode ? onToggleSelection : onPlay}
        onLongPress={onToggleSelection}
      >
        <Cover uri={track.artwork} />
        <View style={styles.rowInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
          <Text style={styles.trackMeta} numberOfLines={1}>{track.artist} - {track.album}</Text>
        </View>
      </TouchableOpacity>
      {!selectionMode && (
        <View style={styles.actions}>
          <ActionButton label={track.isFavorite ? 'Fav' : 'Like'} onPress={onFavorite} active={track.isFavorite} />
          <ActionButton label={t('track.lyrics')} onPress={onLyrics} />
          <ActionButton label={t('track.list')} onPress={onPlaylist} />
          <ActionButton label={t('track.deleteShort')} onPress={onDelete} danger />
        </View>
      )}
    </View>
  );
}
