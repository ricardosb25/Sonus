import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DownloadCandidate, ImportedAudioFile } from '../../domain/models';
import { CandidateRow } from '../components/CandidateRow';
import { useThemedStyles } from '../styles/styles';

type Props = {
  query: string;
  results: DownloadCandidate[];
  totalResults: number;
  canShowMore: boolean;
  busy: string;
  directUrl: string;
  directTitle: string;
  directArtist: string;
  directAlbum: string;
  selectedAudioFile: ImportedAudioFile | null;
  importTitle: string;
  importArtist: string;
  importAlbum: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onShowMore: () => void;
  onDownload: (candidate: DownloadCandidate) => void;
  onDirectUrlChange: (value: string) => void;
  onDirectTitleChange: (value: string) => void;
  onDirectArtistChange: (value: string) => void;
  onDirectAlbumChange: (value: string) => void;
  onDirectDownload: () => void;
  onPickAudioFile: () => void;
  onImportTitleChange: (value: string) => void;
  onImportArtistChange: (value: string) => void;
  onImportAlbumChange: (value: string) => void;
  onImportAudioFile: () => void;
};

export function DownloadScreen(props: Props) {
  const styles = useThemedStyles();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>Baixar musicas</Text>
      <View style={styles.searchBar}>
        <TextInput
          value={props.query}
          onChangeText={props.onQueryChange}
          onSubmitEditing={props.onSearch}
          placeholder="Buscar artista, album ou musica"
          placeholderTextColor="#7f8c8d"
          style={styles.input}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={props.onSearch}
          disabled={props.busy === 'search'}
        >
          <Text style={styles.primaryButtonText}>{props.busy === 'search' ? '...' : 'Buscar'}</Text>
        </TouchableOpacity>
      </View>

      {props.results.map((item) => (
        <CandidateRow
          key={item.id}
          item={item}
          busy={props.busy === item.id}
          onDownload={() => props.onDownload(item)}
        />
      ))}
      {props.canShowMore && (
        <TouchableOpacity style={styles.showMoreButton} onPress={props.onShowMore}>
          <Text style={styles.showMoreText}>
            Mostrar mais ({props.results.length}/{props.totalResults})
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>URL direta</Text>
      <TextInput
        value={props.directUrl}
        onChangeText={props.onDirectUrlChange}
        placeholder="https://.../musica.mp3"
        placeholderTextColor="#7f8c8d"
        style={styles.inputBlock}
      />
      <View style={styles.twoColumns}>
        <TextInput value={props.directTitle} onChangeText={props.onDirectTitleChange} placeholder="Titulo" placeholderTextColor="#7f8c8d" style={styles.smallInput} />
        <TextInput value={props.directArtist} onChangeText={props.onDirectArtistChange} placeholder="Artista" placeholderTextColor="#7f8c8d" style={styles.smallInput} />
      </View>
      <TextInput value={props.directAlbum} onChangeText={props.onDirectAlbumChange} placeholder="Album" placeholderTextColor="#7f8c8d" style={styles.inputBlock} />
      <TouchableOpacity style={styles.secondaryButton} onPress={props.onDirectDownload}>
        <Text style={styles.secondaryButtonText}>Adicionar a biblioteca</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Arquivos do dispositivo</Text>
      <TouchableOpacity style={styles.secondaryButton} onPress={props.onPickAudioFile}>
        <Text style={styles.secondaryButtonText}>Escolher arquivo de audio</Text>
      </TouchableOpacity>
      {props.selectedAudioFile && (
        <View style={styles.importBox}>
          <Text style={styles.trackTitle} numberOfLines={1}>{props.selectedAudioFile.name}</Text>
          <Text style={styles.muted}>
            {props.selectedAudioFile.mimeType ?? 'audio'} - {props.selectedAudioFile.size ? `${Math.round(props.selectedAudioFile.size / 1024)} KB` : 'tamanho desconhecido'}
          </Text>
        </View>
      )}
      <TextInput
        value={props.importTitle}
        onChangeText={props.onImportTitleChange}
        placeholder="Titulo da musica"
        placeholderTextColor="#7f8c8d"
        style={styles.inputBlock}
      />
      <View style={styles.twoColumns}>
        <TextInput value={props.importArtist} onChangeText={props.onImportArtistChange} placeholder="Artista" placeholderTextColor="#7f8c8d" style={styles.smallInput} />
        <TextInput value={props.importAlbum} onChangeText={props.onImportAlbumChange} placeholder="Album" placeholderTextColor="#7f8c8d" style={styles.smallInput} />
      </View>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={props.onImportAudioFile}
        disabled={props.busy === 'import-file'}
      >
        <Text style={styles.primaryButtonText}>
          {props.busy === 'import-file' ? 'Importando...' : 'Importar arquivo'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
