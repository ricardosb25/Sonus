import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { State, useActiveTrack, usePlaybackState } from 'react-native-track-player';
import { trackPlaybackService } from '../../application/services/TrackPlaybackService';
import { useThemedStyles } from '../styles/styles';

export function MiniPlayer({ onOpen }: { onOpen: () => void }) {
  const styles = useThemedStyles();
  const activeTrack = useActiveTrack();
  const playback = usePlaybackState();
  const playing = playback.state === State.Playing;

  if (!activeTrack) return null;

  return (
    <TouchableOpacity style={styles.miniPlayer} onPress={onOpen}>
      <Text style={styles.miniTitle} numberOfLines={1}>{activeTrack.title}</Text>
      <TouchableOpacity
        onPress={() => (playing ? trackPlaybackService.pause() : trackPlaybackService.play())}
        style={styles.miniControl}
      >
        <Text style={styles.miniControlText}>{playing ? 'Pausar' : 'Tocar'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
