import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../i18n';
import { useThemedStyles } from '../styles/styles';

type Props = {
  count: number;
  onSelectAll: () => void;
  onFavorite: () => void;
  onPlaylist: () => void;
  onDelete: () => void;
  onClear: () => void;
};

export function BatchActionsBar({
  count,
  onSelectAll,
  onFavorite,
  onPlaylist,
  onDelete,
  onClear,
}: Props) {
  const styles = useThemedStyles();
  const t = useI18n();

  if (!count) return null;

  return (
    <View style={styles.batchBar}>
      <Text style={styles.batchTitle}>{t('batch.selected', { count })}</Text>
      <View style={styles.batchActions}>
        <TouchableOpacity style={styles.batchButton} onPress={onSelectAll}>
          <Text style={styles.batchButtonText}>{t('batch.all')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.batchButton} onPress={onFavorite}>
          <Text style={styles.batchButtonText}>{t('batch.favorite')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.batchButton} onPress={onPlaylist}>
          <Text style={styles.batchButtonText}>{t('batch.playlist')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.batchButton, styles.batchDanger]} onPress={onDelete}>
          <Text style={styles.batchDangerText}>{t('common.delete')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.batchButton} onPress={onClear}>
          <Text style={styles.batchButtonText}>{t('common.clear')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
