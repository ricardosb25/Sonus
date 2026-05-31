import React from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Playlist } from '../../domain/models';
import { EmptyState } from '../components/EmptyState';
import { useI18n } from '../i18n';
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
  const t = useI18n();

  return (
    <View style={styles.content}>
      <View style={styles.searchBar}>
        <TextInput
          value={playlistName}
          onChangeText={onNameChange}
          placeholder={t('playlists.namePlaceholder')}
          placeholderTextColor="#7f8c8d"
          style={styles.input}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={onCreate}>
          <Text style={styles.primaryButtonText}>{t('common.create')}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.playlistRow} onPress={() => onSelect(item)}>
            <Text style={styles.playlistName}>{item.name}</Text>
            <Text style={styles.muted}>{t('playlists.songCount', { count: item.trackIds.length })}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState text={t('playlists.empty')} />}
      />
    </View>
  );
}
