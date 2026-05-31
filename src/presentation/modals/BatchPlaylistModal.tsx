import React, { useState } from 'react';
import { Modal, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Playlist } from '../../domain/models';
import { EmptyState } from '../components/EmptyState';
import { useThemedStyles } from '../styles/styles';

type Props = {
  visible: boolean;
  selectedCount: number;
  playlists: Playlist[];
  onClose: () => void;
  onAddToPlaylist: (playlist: Playlist) => void;
  onCreatePlaylist: (name: string) => void;
};

export function BatchPlaylistModal({
  visible,
  selectedCount,
  playlists,
  onClose,
  onAddToPlaylist,
  onCreatePlaylist,
}: Props) {
  const styles = useThemedStyles();
  const [name, setName] = useState('');

  const create = () => {
    onCreatePlaylist(name);
    setName('');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.sectionTitle}>{selectedCount} musica(s)</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Fechar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.settingsLabel}>Criar playlist com selecao</Text>
        <View style={styles.searchBar}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nome da playlist"
            placeholderTextColor="#7f8c8d"
            style={styles.input}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={create}>
            <Text style={styles.primaryButtonText}>Criar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.settingsLabel}>Adicionar a playlist existente</Text>
        {playlists.map((playlist) => (
          <TouchableOpacity
            key={playlist.id}
            style={styles.playlistRow}
            onPress={() => onAddToPlaylist(playlist)}
          >
            <Text style={styles.playlistName}>{playlist.name}</Text>
            <Text style={styles.muted}>{playlist.trackIds.length} musica(s)</Text>
          </TouchableOpacity>
        ))}
        {!playlists.length && <EmptyState text="Nenhuma playlist criada ainda." />}
      </SafeAreaView>
    </Modal>
  );
}
