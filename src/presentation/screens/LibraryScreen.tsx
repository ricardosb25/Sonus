import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { LibraryFilter, Track } from '../../domain/models';
import { BatchActionsBar } from '../components/BatchActionsBar';
import { EmptyState } from '../components/EmptyState';
import { TrackRow } from '../components/TrackRow';
import { useThemedStyles } from '../styles/styles';

const filters: Array<{ id: LibraryFilter; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'favorites', label: 'Favoritas' },
  { id: 'artists', label: 'Artistas' },
  { id: 'albums', label: 'Albuns' },
];

type Props = {
  filter: LibraryFilter;
  visibleTracks: Track[];
  groupedTracks: Array<[string, Track[]]>;
  onFilterChange: (filter: LibraryFilter) => void;
  onPlay: (tracks: Track[], startId?: string) => void;
  onFavorite: (track: Track) => void;
  onLyrics: (track: Track) => void;
  onPlaylist: (track: Track) => void;
  onDelete: (track: Track) => void;
  selectedTrackIds: string[];
  onToggleSelection: (track: Track) => void;
  onSelectAll: (tracks: Track[]) => void;
  onClearSelection: () => void;
  onFavoriteSelected: () => void;
  onPlaylistSelected: () => void;
  onDeleteSelected: () => void;
};

export function LibraryScreen(props: Props) {
  const styles = useThemedStyles();
  const grouped = props.filter === 'artists' || props.filter === 'albums';

  return (
    <View style={styles.content}>
      <View style={styles.segmented}>
        {filters.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.segment, props.filter === item.id && styles.segmentActive]}
            onPress={() => props.onFilterChange(item.id)}
          >
            <Text style={[styles.segmentText, props.filter === item.id && styles.segmentTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <BatchActionsBar
        count={props.selectedTrackIds.length}
        onSelectAll={() => props.onSelectAll(props.visibleTracks)}
        onFavorite={props.onFavoriteSelected}
        onPlaylist={props.onPlaylistSelected}
        onDelete={props.onDeleteSelected}
        onClear={props.onClearSelection}
      />

      {grouped ? (
        <FlatList
          data={props.groupedTracks}
          keyExtractor={([name]) => name}
          renderItem={({ item: [name, tracks] }) => (
            <View style={styles.group}>
              <Text style={styles.groupTitle}>{name}</Text>
              {tracks.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  onPlay={() => props.onPlay(tracks, track.id)}
                  onFavorite={() => props.onFavorite(track)}
                  onLyrics={() => props.onLyrics(track)}
                  onPlaylist={() => props.onPlaylist(track)}
                  onDelete={() => props.onDelete(track)}
                  selectionMode={props.selectedTrackIds.length > 0}
                  selected={props.selectedTrackIds.includes(track.id)}
                  onToggleSelection={() => props.onToggleSelection(track)}
                />
              ))}
            </View>
          )}
          ListEmptyComponent={<EmptyState text="Sua biblioteca offline ainda esta vazia." />}
        />
      ) : (
        <FlatList
          data={props.visibleTracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TrackRow
              track={item}
              onPlay={() => props.onPlay(props.visibleTracks, item.id)}
              onFavorite={() => props.onFavorite(item)}
              onLyrics={() => props.onLyrics(item)}
              onPlaylist={() => props.onPlaylist(item)}
              onDelete={() => props.onDelete(item)}
              selectionMode={props.selectedTrackIds.length > 0}
              selected={props.selectedTrackIds.includes(item.id)}
              onToggleSelection={() => props.onToggleSelection(item)}
            />
          )}
          ListEmptyComponent={<EmptyState text="Sua biblioteca offline ainda esta vazia." />}
        />
      )}
    </View>
  );
}
