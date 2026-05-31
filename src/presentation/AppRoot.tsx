import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useAppSettings } from '../application/hooks/useAppSettings';
import { useSonusLibrary } from '../application/hooks/useSonusLibrary';
import { AppHeader } from './components/AppHeader';
import { BottomTabs } from './components/BottomTabs';
import { MiniPlayer } from './components/MiniPlayer';
import { LyricsModal } from './modals/LyricsModal';
import { BatchPlaylistModal } from './modals/BatchPlaylistModal';
import { PlayerModal } from './modals/PlayerModal';
import { PlaylistModal } from './modals/PlaylistModal';
import { PlaylistPicker } from './modals/PlaylistPicker';
import { SettingsModal } from './modals/SettingsModal';
import { DownloadScreen } from './screens/DownloadScreen';
import { DownloadsQueueScreen } from './screens/DownloadsQueueScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { PlaylistsScreen } from './screens/PlaylistsScreen';
import { I18nProvider } from './i18n';
import { ThemeProvider, useThemedStyles } from './styles/styles';

export function AppRoot() {
  const settings = useAppSettings();

  return (
    <SafeAreaProvider>
      <ThemeProvider themeMode={settings.state.settings.themeMode}>
        <I18nProvider language={settings.state.settings.language}>
          <AppRootContent settings={settings} />
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppRootContent({ settings }: { settings: ReturnType<typeof useAppSettings> }) {
  const { state, actions } = useSonusLibrary({
    enabledSearchEngines: settings.state.settings.searchEngines,
  });
  const styles = useThemedStyles();

  if (!state.ready || !settings.state.ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#5eead4" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <StatusBar style={settings.state.settings.themeMode === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.root}
      >
        <AppHeader
          themeMode={settings.state.settings.themeMode}
          offlineCount={state.library.tracks.length}
          onOpenPlayer={() => actions.setPlayerOpen(true)}
          onOpenSettings={() => settings.actions.setSettingsOpen(true)}
        />

        {state.tab === 'download' && (
          <DownloadScreen
            query={state.query}
            results={state.visibleSearchResults}
            totalResults={state.results.length}
            canShowMore={state.canShowMoreSearchResults}
            busy={state.busy}
            directUrl={state.directUrl}
            directTitle={state.directTitle}
            directArtist={state.directArtist}
            directAlbum={state.directAlbum}
            selectedAudioFile={state.selectedAudioFile}
            importTitle={state.importTitle}
            importArtist={state.importArtist}
            importAlbum={state.importAlbum}
            onQueryChange={actions.setQuery}
            onSearch={actions.runSearch}
            onShowMore={actions.showMoreSearchResults}
            onDownload={actions.addDownloadedTrack}
            onDirectUrlChange={actions.setDirectUrl}
            onDirectTitleChange={actions.setDirectTitle}
            onDirectArtistChange={actions.setDirectArtist}
            onDirectAlbumChange={actions.setDirectAlbum}
            onDirectDownload={actions.addDirectDownload}
            onPickAudioFile={actions.pickAudioFile}
            onImportTitleChange={actions.setImportTitle}
            onImportArtistChange={actions.setImportArtist}
            onImportAlbumChange={actions.setImportAlbum}
            onImportAudioFile={actions.importSelectedAudioFile}
          />
        )}

        {state.tab === 'downloads' && (
          <DownloadsQueueScreen
            downloads={state.downloadQueue}
            onPause={actions.pauseDownload}
            onResume={actions.resumeDownload}
            onRemove={actions.removeDownload}
          />
        )}

        {state.tab === 'library' && (
          <LibraryScreen
            filter={state.filter}
            visibleTracks={state.visibleTracks}
            groupedTracks={state.groupedTracks}
            onFilterChange={actions.setFilter}
            onPlay={actions.playTracks}
            onFavorite={actions.toggleFavorite}
            onLyrics={actions.openLyrics}
            onPlaylist={actions.setPlaylistPickerTrack}
            onDelete={actions.confirmDeleteTrack}
            selectedTrackIds={state.selectedTrackIds}
            onToggleSelection={actions.toggleTrackSelection}
            onSelectAll={actions.selectVisibleTracks}
            onClearSelection={actions.clearTrackSelection}
            onFavoriteSelected={actions.favoriteSelectedTracks}
            onPlaylistSelected={() => actions.setBatchPlaylistOpen(true)}
            onDeleteSelected={actions.confirmDeleteSelectedTracks}
          />
        )}

        {state.tab === 'playlists' && (
          <PlaylistsScreen
            playlistName={state.playlistName}
            playlists={state.library.playlists}
            onNameChange={actions.setPlaylistName}
            onCreate={actions.addPlaylist}
            onSelect={actions.setSelectedPlaylist}
          />
        )}

        <MiniPlayer
          track={state.playback.track}
          playing={state.playback.playing}
          onOpen={() => actions.setPlayerOpen(true)}
          onTogglePlayback={actions.togglePlayback}
        />
        <BottomTabs activeTab={state.tab} onChange={actions.setTab} />

        <LyricsModal
          track={state.lyricsTrack}
          loading={state.lyricsLoading}
          onClose={() => actions.setLyricsTrack(null)}
        />
        <PlaylistPicker
          track={state.playlistPickerTrack}
          playlists={state.library.playlists}
          onClose={() => actions.setPlaylistPickerTrack(null)}
          onToggle={actions.toggleTrackInPlaylist}
        />
        <PlaylistModal
          playlist={state.selectedPlaylist}
          tracksById={state.tracksById}
          onClose={() => actions.setSelectedPlaylist(null)}
          onPlay={actions.playTracks}
          onRename={actions.renamePlaylist}
          onDelete={actions.deletePlaylist}
          onRemoveTrack={actions.toggleTrackInPlaylist}
          onRemoveTracks={actions.removeTracksFromPlaylist}
        />
        <BatchPlaylistModal
          visible={state.batchPlaylistOpen}
          selectedCount={state.selectedTracks.length}
          playlists={state.library.playlists}
          onClose={() => actions.setBatchPlaylistOpen(false)}
          onAddToPlaylist={actions.addSelectedTracksToPlaylist}
          onCreatePlaylist={actions.createPlaylistWithSelectedTracks}
        />
        <PlayerModal
          visible={state.playerOpen}
          playback={state.playback}
          equalizer={settings.state.settings.equalizer}
          onTogglePlayback={actions.togglePlayback}
          onClose={() => actions.setPlayerOpen(false)}
          onEqualizerEnabledChange={settings.actions.updateEqualizerEnabled}
          onEqualizerPresetChange={settings.actions.updateEqualizerPreset}
          onEqualizerBandGainChange={settings.actions.updateEqualizerBandGain}
        />
        <SettingsModal
          visible={settings.state.settingsOpen}
          themeMode={settings.state.settings.themeMode}
          language={settings.state.settings.language}
          searchEngines={settings.state.settings.searchEngines}
          equalizer={settings.state.settings.equalizer}
          onThemeChange={settings.actions.updateTheme}
          onLanguageChange={settings.actions.updateLanguage}
          onToggleSearchEngine={settings.actions.toggleSearchEngine}
          onEqualizerEnabledChange={settings.actions.updateEqualizerEnabled}
          onEqualizerPresetChange={settings.actions.updateEqualizerPreset}
          onEqualizerBandGainChange={settings.actions.updateEqualizerBandGain}
          onClose={() => settings.actions.setSettingsOpen(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
