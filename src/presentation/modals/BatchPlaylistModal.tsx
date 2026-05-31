import React, { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Playlist } from '../../domain/models';
import { EmptyState } from '../components/EmptyState';
import { useI18n } from '../i18n';
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
  const t = useI18n();
  const [name, setName] = useState('');

  const create = () => {
    onCreatePlaylist(name);
    setName('');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalHeader}>
          <Text style={styles.sectionTitle}>{t('batch.selected', { count: selectedCount })}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.settingsLabel}>Criar playlist com selecao</Text>
        <View style={styles.searchBar}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('playlists.namePlaceholder')}
            placeholderTextColor="#7f8c8d"
            style={styles.input}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={create}>
            <Text style={styles.primaryButtonText}>{t('common.create')}</Text>
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
