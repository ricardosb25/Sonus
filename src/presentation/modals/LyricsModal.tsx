import React from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Track } from '../../domain/models';
import { useThemedStyles } from '../styles/styles';

type Props = {
  track: Track | null;
  loading: boolean;
  onClose: () => void;
};

export function LyricsModal({ track, loading, onClose }: Props) {
  const styles = useThemedStyles();

  return (
    <Modal visible={!!track} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.modalHeader}>
          <Text style={styles.sectionTitle} numberOfLines={1}>{track?.title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Fechar</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator color="#5eead4" />
        ) : (
          <ScrollView>
            <Text style={styles.lyrics}>{track?.lyrics}</Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}
