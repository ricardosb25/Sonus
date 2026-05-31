import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { fileSystemLibraryRepository, LibraryRepository } from '../../data/repositories/LibraryRepository';
import { onlineMusicDiscoveryService, MusicDiscoveryService } from '../services/MusicDiscoveryService';
import {
  PlaybackService,
  PlaybackSnapshot,
  trackPlaybackService,
} from '../services/TrackPlaybackService';
import { AudioFilePickerService, expoAudioFilePickerService } from '../services/AudioFilePickerService';
import { buildTracksById, getVisibleTracks, groupTracks } from '../../domain/librarySelectors';
import { createPlaylist } from '../../domain/playlistFactory';
import {
  AppTab,
  DownloadCandidate,
  DownloadQueueItem,
  ImportedAudioFile,
  LibraryData,
  LibraryFilter,
  Playlist,
  Track,
} from '../../domain/models';
import { SearchEngineId } from '../../domain/settings';

const initialLibrary: LibraryData = { tracks: [], playlists: [], lastUpdated: '' };
const initialPlayback: PlaybackSnapshot = {
  track: null,
  playing: false,
  position: 0,
  duration: 0,
  mode: 'no-repeat',
};
const initialVisibleSearchResults = 3;
const searchResultsStep = 6;

type Dependencies = {
  libraryRepository?: LibraryRepository;
  musicDiscoveryService?: MusicDiscoveryService;
  playbackService?: PlaybackService;
  audioFilePickerService?: AudioFilePickerService;
  enabledSearchEngines?: SearchEngineId[];
};

export function useSonusLibrary({
  libraryRepository = fileSystemLibraryRepository,
  musicDiscoveryService = onlineMusicDiscoveryService,
  playbackService = trackPlaybackService,
  audioFilePickerService = expoAudioFilePickerService,
  enabledSearchEngines = ['audius', 'internetArchive', 'itunes', 'deezer'],
}: Dependencies = {}) {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<AppTab>('download');
  const [library, setLibrary] = useState<LibraryData>(initialLibrary);
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DownloadCandidate[]>([]);
  const [visibleSearchResultCount, setVisibleSearchResultCount] = useState(initialVisibleSearchResults);
  const [downloadQueue, setDownloadQueue] = useState<DownloadQueueItem[]>([]);
  const [busy, setBusy] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const [directTitle, setDirectTitle] = useState('');
  const [directArtist, setDirectArtist] = useState('');
  const [directAlbum, setDirectAlbum] = useState('');
  const [selectedAudioFile, setSelectedAudioFile] = useState<ImportedAudioFile | null>(null);
  const [importTitle, setImportTitle] = useState('');
  const [importArtist, setImportArtist] = useState('');
  const [importAlbum, setImportAlbum] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistPickerTrack, setPlaylistPickerTrack] = useState<Track | null>(null);
  const [lyricsTrack, setLyricsTrack] = useState<Track | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playback, setPlayback] = useState<PlaybackSnapshot>(initialPlayback);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [batchPlaylistOpen, setBatchPlaylistOpen] = useState(false);
  const activeDownloadRef = useRef<{ id: string; pause: () => Promise<void> } | null>(null);
  const pausedDownloadsRef = useRef(new Set<string>());
  const removedDownloadsRef = useRef(new Set<string>());
  const libraryRef = useRef(library);

  useEffect(() => {
    libraryRef.current = library;
  }, [library]);

  useEffect(() => {
    async function boot() {
      try {
        setLibrary(await libraryRepository.load());
      } catch {
        setLibrary(initialLibrary);
      } finally {
        setReady(true);
      }
    }

    boot();
  }, [libraryRepository]);

  useEffect(() => playbackService.subscribe(setPlayback), [playbackService]);

  const persist = useCallback(
    async (next: LibraryData) => {
      setLibrary(next);
      await libraryRepository.save(next);
    },
    [libraryRepository],
  );

  useEffect(() => {
    if (!ready || activeDownloadRef.current) return;

    const next = downloadQueue.find((item) => item.status === 'queued');
    if (!next) return;

    setDownloadQueue((current) =>
      current.map((item) =>
        item.id === next.id ? { ...item, status: 'downloading', error: undefined } : item,
      ),
    );

    const running = libraryRepository.startDownload(next.candidate, (progress) => {
      setDownloadQueue((current) =>
        current.map((item) =>
          item.id === next.id && item.status === 'downloading'
            ? { ...item, progress: Math.max(0, Math.min(1, progress)) }
            : item,
        ),
      );
    });

    activeDownloadRef.current = { id: next.id, pause: running.pause };

    running.promise
      .then(async (track) => {
        if (removedDownloadsRef.current.has(next.id)) {
          await libraryRepository.deleteFiles(track);
          return;
        }

        await persist({ ...libraryRef.current, tracks: [track, ...libraryRef.current.tracks] });
        setDownloadQueue((current) =>
          current.map((item) =>
            item.id === next.id ? { ...item, status: 'completed', progress: 1 } : item,
          ),
        );
      })
      .catch(() => {
        if (removedDownloadsRef.current.has(next.id)) return;

        setDownloadQueue((current) =>
          current.map((item) =>
            item.id === next.id
              ? {
                  ...item,
                  status: pausedDownloadsRef.current.has(next.id) ? 'paused' : 'error',
                  error: pausedDownloadsRef.current.has(next.id)
                    ? undefined
                    : 'Nao foi possivel baixar essa musica.',
                }
              : item,
          ),
        );
      })
      .finally(() => {
        activeDownloadRef.current = null;
        setDownloadQueue((current) => [...current]);
      });
  }, [downloadQueue, libraryRepository, persist, ready]);

  const tracksById = useMemo(() => buildTracksById(library.tracks), [library.tracks]);
  const visibleTracks = useMemo(
    () => getVisibleTracks(library.tracks, filter),
    [filter, library.tracks],
  );
  const groupedTracks = useMemo(
    () => groupTracks(library.tracks, filter),
    [filter, library.tracks],
  );
  const selectedTracks = useMemo(
    () => selectedTrackIds.map((id) => tracksById.get(id)).filter((track): track is Track => Boolean(track)),
    [selectedTrackIds, tracksById],
  );
  const visibleSearchResults = useMemo(
    () => results.slice(0, visibleSearchResultCount),
    [results, visibleSearchResultCount],
  );

  const runSearch = useCallback(async () => {
    if (!query.trim()) return;

    setBusy('search');
    try {
      setResults(await musicDiscoveryService.search(query, enabledSearchEngines));
      setVisibleSearchResultCount(initialVisibleSearchResults);
    } catch {
      Alert.alert('Sonus', 'Nao foi possivel buscar musicas agora. Verifique sua conexao.');
    } finally {
      setBusy('');
    }
  }, [enabledSearchEngines, musicDiscoveryService, query]);

  const showMoreSearchResults = useCallback(() => {
    setVisibleSearchResultCount((current) => Math.min(current + searchResultsStep, results.length));
  }, [results.length]);

  const addDownloadedTrack = useCallback(
    (candidate: DownloadCandidate) => {
      const queueItem: DownloadQueueItem = {
        id: `${candidate.id}-${Date.now()}`,
        candidate,
        status: 'queued',
        progress: 0,
        createdAt: new Date().toISOString(),
      };

      pausedDownloadsRef.current.delete(queueItem.id);
      removedDownloadsRef.current.delete(queueItem.id);
      setDownloadQueue((current) => [queueItem, ...current]);
      setTab('downloads');
    },
    [],
  );

  const addDirectDownload = useCallback(async () => {
    if (!directUrl.trim()) {
      Alert.alert('Sonus', 'Informe uma URL direta de audio.');
      return;
    }

    addDownloadedTrack(
      musicDiscoveryService.fromDirectUrl(directUrl, directTitle, directArtist, directAlbum),
    );
    setDirectUrl('');
    setDirectTitle('');
    setDirectArtist('');
    setDirectAlbum('');
  }, [
    addDownloadedTrack,
    directAlbum,
    directArtist,
    directTitle,
    directUrl,
    musicDiscoveryService,
  ]);

  const pauseDownload = useCallback(async (item: DownloadQueueItem) => {
    pausedDownloadsRef.current.add(item.id);
    setDownloadQueue((current) =>
      current.map((download) =>
        download.id === item.id ? { ...download, status: 'paused' } : download,
      ),
    );

    if (activeDownloadRef.current?.id === item.id) {
      await activeDownloadRef.current.pause();
    }
  }, []);

  const resumeDownload = useCallback((item: DownloadQueueItem) => {
    pausedDownloadsRef.current.delete(item.id);
    removedDownloadsRef.current.delete(item.id);
    setDownloadQueue((current) =>
      current.map((download) =>
        download.id === item.id
          ? { ...download, status: 'queued', progress: download.progress >= 1 ? 0 : download.progress, error: undefined }
          : download,
      ),
    );
  }, []);

  const removeDownload = useCallback(async (item: DownloadQueueItem) => {
    removedDownloadsRef.current.add(item.id);
    pausedDownloadsRef.current.delete(item.id);
    setDownloadQueue((current) => current.filter((download) => download.id !== item.id));

    if (activeDownloadRef.current?.id === item.id) {
      await activeDownloadRef.current.pause();
    }
  }, []);

  const pickAudioFile = useCallback(async () => {
    try {
      const file = await audioFilePickerService.pickAudio();
      if (!file) return;

      setSelectedAudioFile(file);
      setImportTitle(file.name.replace(/\.[a-zA-Z0-9]{2,5}$/, '').replace(/[_-]+/g, ' '));
      setImportArtist('');
      setImportAlbum('');
    } catch {
      Alert.alert('Sonus', 'Nao foi possivel abrir o seletor de arquivos.');
    }
  }, [audioFilePickerService]);

  const importSelectedAudioFile = useCallback(async () => {
    if (!selectedAudioFile) {
      Alert.alert('Sonus', 'Escolha um arquivo de audio primeiro.');
      return;
    }

    setBusy('import-file');
    try {
      const track = await libraryRepository.importAudio(selectedAudioFile, {
        title: importTitle,
        artist: importArtist,
        album: importAlbum,
      });
      await persist({ ...library, tracks: [track, ...library.tracks] });
      setSelectedAudioFile(null);
      setImportTitle('');
      setImportArtist('');
      setImportAlbum('');
      Alert.alert('Sonus', 'Arquivo adicionado a biblioteca offline.');
    } catch {
      Alert.alert('Sonus', 'Nao foi possivel importar esse arquivo.');
    } finally {
      setBusy('');
    }
  }, [
    importAlbum,
    importArtist,
    importTitle,
    library,
    libraryRepository,
    persist,
    selectedAudioFile,
  ]);

  const playTracks = useCallback(
    async (tracks: Track[], startId?: string) => {
      if (!tracks.length) return;

      try {
        await playbackService.playQueue(tracks, startId);
      } catch {
        Alert.alert('Sonus', 'Nao foi possivel iniciar o player neste dispositivo.');
      }
    },
    [playbackService],
  );

  const togglePlayback = useCallback(async () => {
    try {
      if (playback.playing) {
        await playbackService.pause();
      } else {
        await playbackService.play();
      }
    } catch {
      Alert.alert('Sonus', 'Nao foi possivel controlar a reproducao agora.');
    }
  }, [playback.playing, playbackService]);

  const toggleFavorite = useCallback(
    async (track: Track) => {
      await persist({
        ...library,
        tracks: library.tracks.map((item) =>
          item.id === track.id ? { ...item, isFavorite: !item.isFavorite } : item,
        ),
      });
    },
    [library, persist],
  );

  const deleteTrack = useCallback(
    async (track: Track) => {
      await libraryRepository.deleteFiles(track);
      await persist({
        ...library,
        tracks: library.tracks.filter((item) => item.id !== track.id),
        playlists: library.playlists.map((playlist) => ({
          ...playlist,
          trackIds: playlist.trackIds.filter((id) => id !== track.id),
          updatedAt: new Date().toISOString(),
        })),
      });
    },
    [library, libraryRepository, persist],
  );

  const deleteTracks = useCallback(
    async (tracks: Track[]) => {
      await Promise.all(tracks.map((track) => libraryRepository.deleteFiles(track)));
      const ids = new Set(tracks.map((track) => track.id));

      await persist({
        ...library,
        tracks: library.tracks.filter((item) => !ids.has(item.id)),
        playlists: library.playlists.map((playlist) => ({
          ...playlist,
          trackIds: playlist.trackIds.filter((id) => !ids.has(id)),
          updatedAt: new Date().toISOString(),
        })),
      });
      setSelectedTrackIds([]);
    },
    [library, libraryRepository, persist],
  );

  const confirmDeleteTrack = useCallback(
    (track: Track) => {
      Alert.alert('Remover musica', `Remover "${track.title}" da biblioteca?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => deleteTrack(track),
        },
      ]);
    },
    [deleteTrack],
  );

  const openLyrics = useCallback(
    async (track: Track) => {
      setLyricsTrack(track);
      if (track.lyrics) return;

      setLyricsLoading(true);
      try {
        const lyrics = await musicDiscoveryService.lyrics(track.artist, track.title);
        const updatedTracks = library.tracks.map((item) =>
          item.id === track.id ? { ...item, lyrics } : item,
        );
        await persist({ ...library, tracks: updatedTracks });
        setLyricsTrack({ ...track, lyrics });
      } catch {
        setLyricsTrack({
          ...track,
          lyrics: 'Letra nao encontrada automaticamente. Tente novamente online ou edite os metadados do titulo/artista.',
        });
      } finally {
        setLyricsLoading(false);
      }
    },
    [library, musicDiscoveryService, persist],
  );

  const addPlaylist = useCallback(async () => {
    if (!playlistName.trim()) return;

    await persist({ ...library, playlists: [createPlaylist(playlistName), ...library.playlists] });
    setPlaylistName('');
  }, [library, persist, playlistName]);

  const renamePlaylist = useCallback(
    async (playlist: Playlist, name: string) => {
      const renamed = {
        ...playlist,
        name: name.trim() || playlist.name,
        updatedAt: new Date().toISOString(),
      };

      await persist({
        ...library,
        playlists: library.playlists.map((item) => (item.id === playlist.id ? renamed : item)),
      });
      setSelectedPlaylist((current) => (current?.id === playlist.id ? renamed : current));
    },
    [library, persist],
  );

  const deletePlaylist = useCallback(
    async (playlist: Playlist) => {
      await persist({
        ...library,
        playlists: library.playlists.filter((item) => item.id !== playlist.id),
      });
      setSelectedPlaylist(null);
    },
    [library, persist],
  );

  const toggleTrackInPlaylist = useCallback(
    async (playlist: Playlist, track: Track) => {
      const exists = playlist.trackIds.includes(track.id);
      const updated = {
        ...playlist,
        trackIds: exists
          ? playlist.trackIds.filter((id) => id !== track.id)
          : [...playlist.trackIds, track.id],
        updatedAt: new Date().toISOString(),
      };

      await persist({
        ...library,
        playlists: library.playlists.map((item) => (item.id === playlist.id ? updated : item)),
      });
      setSelectedPlaylist((current) => (current?.id === playlist.id ? updated : current));
    },
    [library, persist],
  );

  const toggleTrackSelection = useCallback((track: Track) => {
    setSelectedTrackIds((current) =>
      current.includes(track.id)
        ? current.filter((id) => id !== track.id)
        : [...current, track.id],
    );
  }, []);

  const clearTrackSelection = useCallback(() => setSelectedTrackIds([]), []);

  const selectVisibleTracks = useCallback(
    (tracks: Track[]) => setSelectedTrackIds(tracks.map((track) => track.id)),
    [],
  );

  const favoriteSelectedTracks = useCallback(async () => {
    const ids = new Set(selectedTrackIds);
    await persist({
      ...library,
      tracks: library.tracks.map((track) =>
        ids.has(track.id) ? { ...track, isFavorite: true } : track,
      ),
    });
    setSelectedTrackIds([]);
  }, [library, persist, selectedTrackIds]);

  const confirmDeleteSelectedTracks = useCallback(() => {
    if (!selectedTracks.length) return;

    Alert.alert(
      'Excluir musicas',
      `Excluir ${selectedTracks.length} musica(s) do dispositivo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteTracks(selectedTracks),
        },
      ],
    );
  }, [deleteTracks, selectedTracks]);

  const addSelectedTracksToPlaylist = useCallback(
    async (playlist: Playlist) => {
      const ids = new Set([...playlist.trackIds, ...selectedTrackIds]);
      const updated = {
        ...playlist,
        trackIds: [...ids],
        updatedAt: new Date().toISOString(),
      };

      await persist({
        ...library,
        playlists: library.playlists.map((item) => (item.id === playlist.id ? updated : item)),
      });
      setBatchPlaylistOpen(false);
      setSelectedTrackIds([]);
    },
    [library, persist, selectedTrackIds],
  );

  const createPlaylistWithSelectedTracks = useCallback(
    async (name: string) => {
      if (!name.trim() || !selectedTrackIds.length) return;

      const playlist = {
        ...createPlaylist(name),
        trackIds: selectedTrackIds,
      };
      await persist({ ...library, playlists: [playlist, ...library.playlists] });
      setBatchPlaylistOpen(false);
      setSelectedTrackIds([]);
    },
    [library, persist, selectedTrackIds],
  );

  const removeTracksFromPlaylist = useCallback(
    async (playlist: Playlist, tracks: Track[]) => {
      const ids = new Set(tracks.map((track) => track.id));
      const updated = {
        ...playlist,
        trackIds: playlist.trackIds.filter((id) => !ids.has(id)),
        updatedAt: new Date().toISOString(),
      };

      await persist({
        ...library,
        playlists: library.playlists.map((item) => (item.id === playlist.id ? updated : item)),
      });
      setSelectedPlaylist((current) => (current?.id === playlist.id ? updated : current));
    },
    [library, persist],
  );

  return {
    state: {
      ready,
      tab,
      library,
      filter,
      query,
      results,
      visibleSearchResults,
      canShowMoreSearchResults: visibleSearchResultCount < results.length,
      downloadQueue,
      busy,
      directUrl,
      directTitle,
      directArtist,
      directAlbum,
      selectedAudioFile,
      importTitle,
      importArtist,
      importAlbum,
      playlistName,
      selectedPlaylist,
      playlistPickerTrack,
      lyricsTrack,
      lyricsLoading,
      playerOpen,
      playback,
      selectedTrackIds,
      selectedTracks,
      batchPlaylistOpen,
      tracksById,
      visibleTracks,
      groupedTracks,
    },
    actions: {
      setTab,
      setFilter,
      setQuery,
      setDirectUrl,
      setDirectTitle,
      setDirectArtist,
      setDirectAlbum,
      setImportTitle,
      setImportArtist,
      setImportAlbum,
      setPlaylistName,
      setSelectedPlaylist,
      setPlaylistPickerTrack,
      setLyricsTrack,
      setPlayerOpen,
      setBatchPlaylistOpen,
      runSearch,
      showMoreSearchResults,
      addDownloadedTrack,
      addDirectDownload,
      pauseDownload,
      resumeDownload,
      removeDownload,
      pickAudioFile,
      importSelectedAudioFile,
      playTracks,
      togglePlayback,
      toggleFavorite,
      confirmDeleteTrack,
      openLyrics,
      addPlaylist,
      renamePlaylist,
      deletePlaylist,
      toggleTrackInPlaylist,
      toggleTrackSelection,
      clearTrackSelection,
      selectVisibleTracks,
      favoriteSelectedTracks,
      confirmDeleteSelectedTracks,
      addSelectedTracksToPlaylist,
      createPlaylistWithSelectedTracks,
      removeTracksFromPlaylist,
    },
  };
}
