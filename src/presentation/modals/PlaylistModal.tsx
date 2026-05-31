import React, { useEffect, useState } from 'react';
import { FlatList, Modal, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { resolvePlaylistTracks } from '../../domain/librarySelectors';
import { Playlist, Track } from '../../domain/models';
import { ActionButton } from '../components/ActionButton';
import { Cover } from '../components/Cover';
import { EmptyState } from '../components/EmptyState';
import { useThemedStyles } from '../styles/styles';

type Props = {
  playlist: Playlist | null;
  tracksById: Map<string, Track>;
  onClose: () => void;
  onPlay: (tracks: Track[]) => void;
  onRename: (playlist: Playlist, name: string) => void;
  onDelete: (playlist: Playlist) => void;
  onRemoveTrack: (playlist: Playlist, track: Track) => void;
  onRemoveTracks: (playlist: Playlist, tracks: Track[]) => void;
};

export function PlaylistModal(props: Props) {
  const styles = useThemedStyles();
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setName(props.playlist?.name ?? '');
    setSelectedIds([]);
  }, [props.playlist]);

  const tracks = resolvePlaylistTracks(props.playlist, props.tracksById);
  const selectedTracks = tracks.filter((track) => selectedIds.includes(track.id));
  const selectionMode = selectedIds.length > 0;

  const toggleSelection = (track: Track) => {
    setSelectedIds((current) =>
      current.includes(track.id)
        ? current.filter((id) => id !== track.id)
        : [...current, track.id],
    );
  };

  const removeSelected = () => {
    if (!props.playlist || !selectedTracks.length) return;
    props.onRemoveTracks(props.playlist, selectedTracks);
    setSelectedIds([]);
  };

  return (
    <Modal visible={!!props.playlist} animationType="slide" onRequestClose={props.onClose}>
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <TextInput value={name} onChangeText={setName} style={styles.modalTitleInput} />
          <TouchableOpacity onPress={props.onClose}>
            <Text style={styles.close}>Fechar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.playlistTools}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => props.playlist && props.onRename(props.playlist, name)}
          >
            <Text style={styles.primaryButtonText}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => props.onPlay(tracks)}>
            <Text style={styles.secondaryButtonText}>Tocar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => props.playlist && props.onDelete(props.playlist)}
          >
            <Text style={styles.dangerText}>Excluir</Text>
          </TouchableOpacity>
        </View>
        {selectionMode && (
          <View style={styles.batchBar}>
            <Text style={styles.batchTitle}>{selectedIds.length} selecionada(s)</Text>
            <View style={styles.batchActions}>
              <TouchableOpacity style={[styles.batchButton, styles.batchDanger]} onPress={removeSelected}>
                <Text style={styles.batchDangerText}>Remover da playlist</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.batchButton} onPress={() => setSelectedIds([])}>
                <Text style={styles.batchButtonText}>Limpar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {selectionMode && (
                <TouchableOpacity
                  style={[styles.checkBox, selectedIds.includes(item.id) && styles.checkBoxActive]}
                  onPress={() => toggleSelection(item)}
                >
                  <Text style={[styles.checkBoxText, selectedIds.includes(item.id) && styles.checkBoxTextActive]}>
                    {selectedIds.includes(item.id) ? 'OK' : ''}
                  </Text>
                </TouchableOpacity>
              )}
              <Cover uri={item.artwork} />
              <TouchableOpacity
                style={styles.rowInfo}
                onPress={selectionMode ? () => toggleSelection(item) : undefined}
                onLongPress={() => toggleSelection(item)}
              >
                <Text style={styles.trackTitle}>{item.title}</Text>
                <Text style={styles.trackMeta}>{item.artist}</Text>
              </TouchableOpacity>
              {!selectionMode && (
                <ActionButton
                  label="Remover"
                  onPress={() => props.playlist && props.onRemoveTrack(props.playlist, item)}
                  danger
                />
              )}
            </View>
          )}
          ListEmptyComponent={<EmptyState text="Essa playlist ainda esta vazia." />}
        />
      </SafeAreaView>
    </Modal>
  );
}
