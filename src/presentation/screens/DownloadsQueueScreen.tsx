import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { DownloadQueueItem } from '../../domain/models';
import { formatDuration } from '../../shared/formatDuration';
import { Cover } from '../components/Cover';
import { EmptyState } from '../components/EmptyState';
import { useThemedStyles } from '../styles/styles';

type Props = {
  downloads: DownloadQueueItem[];
  onPause: (item: DownloadQueueItem) => void;
  onResume: (item: DownloadQueueItem) => void;
  onRemove: (item: DownloadQueueItem) => void;
};

type DownloadTab = 'active' | 'completed';

const statusLabel: Record<DownloadQueueItem['status'], string> = {
  queued: 'Na fila',
  downloading: 'Baixando',
  paused: 'Pausado',
  completed: 'Concluido',
  error: 'Erro',
};

export function DownloadsQueueScreen({ downloads, onPause, onResume, onRemove }: Props) {
  const styles = useThemedStyles();
  const [activeTab, setActiveTab] = useState<DownloadTab>('active');
  const activeDownloads = useMemo(
    () => downloads.filter((item) => item.status !== 'completed'),
    [downloads],
  );
  const completedDownloads = useMemo(
    () => downloads.filter((item) => item.status === 'completed'),
    [downloads],
  );
  const visibleDownloads = activeTab === 'active' ? activeDownloads : completedDownloads;
  const emptyText =
    activeTab === 'active'
      ? 'Nenhum download em progresso. Busque uma musica e toque em Baixar para acompanhar por aqui.'
      : 'Nenhum download concluido ainda.';

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>Downloads</Text>
      <View style={styles.segmented}>
        <TouchableOpacity
          style={[styles.segment, activeTab === 'active' && styles.segmentActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.segmentText, activeTab === 'active' && styles.segmentTextActive]}>
            Em progresso ({activeDownloads.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, activeTab === 'completed' && styles.segmentActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.segmentText, activeTab === 'completed' && styles.segmentTextActive]}>
            Concluidos ({completedDownloads.length})
          </Text>
        </TouchableOpacity>
      </View>

      {!visibleDownloads.length && <EmptyState text={emptyText} />}

      {visibleDownloads.map((item) => {
        const canPause = item.status === 'queued' || item.status === 'downloading';
        const canResume = item.status === 'paused' || item.status === 'error';
        const progress = Math.round(item.progress * 100);

        return (
          <View key={item.id} style={styles.downloadCard}>
            <View style={styles.rowTap}>
              <Cover uri={item.candidate.artwork} />
              <View style={styles.rowInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>{item.candidate.title}</Text>
                <Text style={styles.trackMeta} numberOfLines={1}>
                  {item.candidate.artist} - {item.candidate.album}
                </Text>
                <Text style={styles.muted}>
                  {statusLabel[item.status]} - {item.candidate.source} - {formatDuration(item.candidate.duration)}
                </Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.downloadFooter}>
              <Text style={styles.muted}>{progress}%</Text>
              <View style={styles.downloadActions}>
                {canPause && (
                  <TouchableOpacity style={styles.batchButton} onPress={() => onPause(item)}>
                    <Text style={styles.batchButtonText}>Pausar</Text>
                  </TouchableOpacity>
                )}
                {canResume && (
                  <TouchableOpacity style={styles.batchButton} onPress={() => onResume(item)}>
                    <Text style={styles.batchButtonText}>Retomar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.batchButton, styles.batchDanger]}
                  onPress={() => onRemove(item)}
                >
                  <Text style={styles.batchDangerText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
            {item.error && <Text style={styles.dangerText}>{item.error}</Text>}
          </View>
        );
      })}
    </ScrollView>
  );
}
