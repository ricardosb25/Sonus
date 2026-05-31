import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
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

  if (!count) return null;

  return (
    <View style={styles.batchBar}>
      <Text style={styles.batchTitle}>{count} selecionada(s)</Text>
      <View style={styles.batchActions}>
        <TouchableOpacity style={styles.batchButton} onPress={onSelectAll}>
          <Text style={styles.batchButtonText}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.batchButton} onPress={onFavorite}>
          <Text style={styles.batchButtonText}>Favoritar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.batchButton} onPress={onPlaylist}>
          <Text style={styles.batchButtonText}>Playlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.batchButton, styles.batchDanger]} onPress={onDelete}>
          <Text style={styles.batchDangerText}>Excluir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.batchButton} onPress={onClear}>
          <Text style={styles.batchButtonText}>Limpar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
