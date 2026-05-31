import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Playlist, Track } from '../../domain/models';
import { EmptyState } from '../components/EmptyState';
import { useThemedStyles } from '../styles/styles';

type Props = {
  track: Track | null;
  playlists: Playlist[];
  onClose: () => void;
  onToggle: (playlist: Playlist, track: Track) => void;
};

export function PlaylistPicker({ track, playlists, onClose, onToggle }: Props) {
  const styles = useThemedStyles();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={!!track} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose}>
        <View style={[styles.sheet, { paddingBottom: Math.max(18, insets.bottom + 18) }]}>
          <Text style={styles.sectionTitle}>Adicionar a playlist</Text>
          {playlists.map((playlist) => {
            const selected = !!track && playlist.trackIds.includes(track.id);
            return (
              <TouchableOpacity
                key={playlist.id}
                style={styles.playlistRow}
                onPress={() => track && onToggle(playlist, track)}
              >
                <Text style={styles.playlistName}>{playlist.name}</Text>
                <Text style={styles.muted}>{selected ? 'Remover' : 'Adicionar'}</Text>
              </TouchableOpacity>
            );
          })}
          {!playlists.length && <EmptyState text="Crie uma playlist primeiro." />}
        </View>
      </Pressable>
    </Modal>
  );
}
