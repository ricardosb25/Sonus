import React from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Playlist } from '../../domain/models';
import { EmptyState } from '../components/EmptyState';
import { useThemedStyles } from '../styles/styles';

type Props = {
  playlistName: string;
  playlists: Playlist[];
  onNameChange: (value: string) => void;
  onCreate: () => void;
  onSelect: (playlist: Playlist) => void;
};

export function PlaylistsScreen({ playlistName, playlists, onNameChange, onCreate, onSelect }: Props) {
  const styles = useThemedStyles();

  return (
    <View style={styles.content}>
      <View style={styles.searchBar}>
        <TextInput
          value={playlistName}
          onChangeText={onNameChange}
          placeholder="Nome da playlist"
          placeholderTextColor="#7f8c8d"
          style={styles.input}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={onCreate}>
          <Text style={styles.primaryButtonText}>Criar</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.playlistRow} onPress={() => onSelect(item)}>
            <Text style={styles.playlistName}>{item.name}</Text>
            <Text style={styles.muted}>{item.trackIds.length} musicas</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState text="Crie playlists para organizar seu som." />}
      />
    </View>
  );
}
