import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { AppLanguage } from '../domain/language';

type TranslationKey =
  | 'tabs.search'
  | 'tabs.downloads'
  | 'tabs.library'
  | 'tabs.playlists'
  | 'common.close'
  | 'common.create'
  | 'common.save'
  | 'common.play'
  | 'common.pause'
  | 'common.delete'
  | 'common.clear'
  | 'header.offlineSongs'
  | 'header.settings'
  | 'header.player'
  | 'download.title'
  | 'download.searchPlaceholder'
  | 'download.searchButton'
  | 'download.showMore'
  | 'download.directUrl'
  | 'download.titlePlaceholder'
  | 'download.artistPlaceholder'
  | 'download.albumPlaceholder'
  | 'download.addToLibrary'
  | 'download.deviceFiles'
  | 'download.pickAudio'
  | 'download.importTitle'
  | 'download.importing'
  | 'download.importFile'
  | 'downloads.active'
  | 'downloads.completed'
  | 'downloads.emptyActive'
  | 'downloads.emptyCompleted'
  | 'downloads.statusQueued'
  | 'downloads.statusDownloading'
  | 'downloads.statusPaused'
  | 'downloads.statusCompleted'
  | 'downloads.statusError'
  | 'downloads.resume'
  | 'library.all'
  | 'library.favorites'
  | 'library.artists'
  | 'library.albums'
  | 'library.empty'
  | 'batch.selected'
  | 'batch.all'
  | 'batch.favorite'
  | 'batch.playlist'
  | 'track.lyrics'
  | 'track.list'
  | 'track.deleteShort'
  | 'player.nowPlaying'
  | 'player.nothingPlaying'
  | 'player.chooseSong'
  | 'player.shuffle'
  | 'player.repeatOne'
  | 'player.noRepeat'
  | 'player.previous'
  | 'player.next'
  | 'playlists.namePlaceholder'
  | 'playlists.empty'
  | 'playlists.songCount'
  | 'settings.title'
  | 'settings.theme'
  | 'settings.dark'
  | 'settings.light'
  | 'settings.darkHint'
  | 'settings.lightHint'
  | 'settings.language'
  | 'settings.searchEngines'
  | 'settings.active'
  | 'settings.inactive'
  | 'settings.unavailable'
  | 'equalizer.title'
  | 'equalizer.hint'
  | 'equalizer.on'
  | 'equalizer.off'
  | 'candidate.download'
  | 'candidate.url';

type Vars = Record<string, string | number>;

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  'pt-BR': {
    'tabs.search': 'Buscar',
    'tabs.downloads': 'Downloads',
    'tabs.library': 'Biblioteca',
    'tabs.playlists': 'Playlists',
    'common.close': 'Fechar',
    'common.create': 'Criar',
    'common.save': 'Salvar',
    'common.play': 'Tocar',
    'common.pause': 'Pausar',
    'common.delete': 'Excluir',
    'common.clear': 'Limpar',
    'header.offlineSongs': '{count} musicas offline',
    'header.settings': 'Config',
    'header.player': 'Player',
    'download.title': 'Baixar musicas',
    'download.searchPlaceholder': 'Buscar artista, album ou musica',
    'download.searchButton': 'Buscar',
    'download.showMore': 'Mostrar mais ({visible}/{total})',
    'download.directUrl': 'URL direta',
    'download.titlePlaceholder': 'Titulo',
    'download.artistPlaceholder': 'Artista',
    'download.albumPlaceholder': 'Album',
    'download.addToLibrary': 'Adicionar a biblioteca',
    'download.deviceFiles': 'Arquivos do dispositivo',
    'download.pickAudio': 'Escolher arquivo de audio',
    'download.importTitle': 'Titulo da musica',
    'download.importing': 'Importando...',
    'download.importFile': 'Importar arquivo',
    'downloads.active': 'Em progresso',
    'downloads.completed': 'Concluidos',
    'downloads.emptyActive': 'Nenhum download em progresso. Busque uma musica e toque em Baixar para acompanhar por aqui.',
    'downloads.emptyCompleted': 'Nenhum download concluido ainda.',
    'downloads.statusQueued': 'Na fila',
    'downloads.statusDownloading': 'Baixando',
    'downloads.statusPaused': 'Pausado',
    'downloads.statusCompleted': 'Concluido',
    'downloads.statusError': 'Erro',
    'downloads.resume': 'Retomar',
    'library.all': 'Todas',
    'library.favorites': 'Favoritas',
    'library.artists': 'Artistas',
    'library.albums': 'Albuns',
    'library.empty': 'Sua biblioteca offline ainda esta vazia.',
    'batch.selected': '{count} selecionada(s)',
    'batch.all': 'Todas',
    'batch.favorite': 'Favoritar',
    'batch.playlist': 'Playlist',
    'track.lyrics': 'Letra',
    'track.list': 'Lista',
    'track.deleteShort': 'Del',
    'player.nowPlaying': 'Tocando agora',
    'player.nothingPlaying': 'Nada tocando',
    'player.chooseSong': 'Escolha uma musica na biblioteca',
    'player.shuffle': 'Aleatorio',
    'player.repeatOne': 'Repetir 1',
    'player.noRepeat': 'Nao repetir',
    'player.previous': 'Anterior',
    'player.next': 'Proxima',
    'playlists.namePlaceholder': 'Nome da playlist',
    'playlists.empty': 'Crie playlists para organizar seu som.',
    'playlists.songCount': '{count} musicas',
    'settings.title': 'Configuracoes',
    'settings.theme': 'Tema',
    'settings.dark': 'Escuro',
    'settings.light': 'Claro',
    'settings.darkHint': 'Interface com fundo escuro para ouvir a noite.',
    'settings.lightHint': 'Interface clara para ambientes iluminados.',
    'settings.language': 'Idioma',
    'settings.searchEngines': 'Motores de busca',
    'settings.active': 'Ativo',
    'settings.inactive': 'Inativo',
    'settings.unavailable': 'Indisponivel',
    'equalizer.title': 'Equalizador',
    'equalizer.hint': 'Ajuste as frequencias da reproducao conforme seu fone ou caixa.',
    'equalizer.on': 'Ligado',
    'equalizer.off': 'Desligado',
    'candidate.download': 'Baixar',
    'candidate.url': 'URL',
  },
  en: {
    'tabs.search': 'Search',
    'tabs.downloads': 'Downloads',
    'tabs.library': 'Library',
    'tabs.playlists': 'Playlists',
    'common.close': 'Close',
    'common.create': 'Create',
    'common.save': 'Save',
    'common.play': 'Play',
    'common.pause': 'Pause',
    'common.delete': 'Delete',
    'common.clear': 'Clear',
    'header.offlineSongs': '{count} offline songs',
    'header.settings': 'Settings',
    'header.player': 'Player',
    'download.title': 'Download songs',
    'download.searchPlaceholder': 'Search artist, album, or song',
    'download.searchButton': 'Search',
    'download.showMore': 'Show more ({visible}/{total})',
    'download.directUrl': 'Direct URL',
    'download.titlePlaceholder': 'Title',
    'download.artistPlaceholder': 'Artist',
    'download.albumPlaceholder': 'Album',
    'download.addToLibrary': 'Add to library',
    'download.deviceFiles': 'Device files',
    'download.pickAudio': 'Choose audio file',
    'download.importTitle': 'Song title',
    'download.importing': 'Importing...',
    'download.importFile': 'Import file',
    'downloads.active': 'In progress',
    'downloads.completed': 'Completed',
    'downloads.emptyActive': 'No downloads in progress. Search for a song and tap Download to track it here.',
    'downloads.emptyCompleted': 'No completed downloads yet.',
    'downloads.statusQueued': 'Queued',
    'downloads.statusDownloading': 'Downloading',
    'downloads.statusPaused': 'Paused',
    'downloads.statusCompleted': 'Completed',
    'downloads.statusError': 'Error',
    'downloads.resume': 'Resume',
    'library.all': 'All',
    'library.favorites': 'Favorites',
    'library.artists': 'Artists',
    'library.albums': 'Albums',
    'library.empty': 'Your offline library is still empty.',
    'batch.selected': '{count} selected',
    'batch.all': 'All',
    'batch.favorite': 'Favorite',
    'batch.playlist': 'Playlist',
    'track.lyrics': 'Lyrics',
    'track.list': 'List',
    'track.deleteShort': 'Del',
    'player.nowPlaying': 'Now playing',
    'player.nothingPlaying': 'Nothing playing',
    'player.chooseSong': 'Choose a song from your library',
    'player.shuffle': 'Shuffle',
    'player.repeatOne': 'Repeat 1',
    'player.noRepeat': 'No repeat',
    'player.previous': 'Previous',
    'player.next': 'Next',
    'playlists.namePlaceholder': 'Playlist name',
    'playlists.empty': 'Create playlists to organize your sound.',
    'playlists.songCount': '{count} songs',
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.dark': 'Dark',
    'settings.light': 'Light',
    'settings.darkHint': 'Dark interface for listening at night.',
    'settings.lightHint': 'Light interface for bright places.',
    'settings.language': 'Language',
    'settings.searchEngines': 'Search engines',
    'settings.active': 'Active',
    'settings.inactive': 'Inactive',
    'settings.unavailable': 'Unavailable',
    'equalizer.title': 'Equalizer',
    'equalizer.hint': 'Tune playback frequencies for your headphones or speaker.',
    'equalizer.on': 'On',
    'equalizer.off': 'Off',
    'candidate.download': 'Download',
    'candidate.url': 'URL',
  },
  ja: {
    'tabs.search': '検索',
    'tabs.downloads': 'ダウンロード',
    'tabs.library': 'ライブラリ',
    'tabs.playlists': 'プレイリスト',
    'common.close': '閉じる',
    'common.create': '作成',
    'common.save': '保存',
    'common.play': '再生',
    'common.pause': '一時停止',
    'common.delete': '削除',
    'common.clear': 'クリア',
    'header.offlineSongs': 'オフライン曲 {count}',
    'header.settings': '設定',
    'header.player': 'プレイヤー',
    'download.title': '音楽をダウンロード',
    'download.searchPlaceholder': 'アーティスト、アルバム、曲を検索',
    'download.searchButton': '検索',
    'download.showMore': 'もっと表示 ({visible}/{total})',
    'download.directUrl': '直接URL',
    'download.titlePlaceholder': 'タイトル',
    'download.artistPlaceholder': 'アーティスト',
    'download.albumPlaceholder': 'アルバム',
    'download.addToLibrary': 'ライブラリに追加',
    'download.deviceFiles': '端末のファイル',
    'download.pickAudio': '音声ファイルを選択',
    'download.importTitle': '曲名',
    'download.importing': 'インポート中...',
    'download.importFile': 'ファイルをインポート',
    'downloads.active': '進行中',
    'downloads.completed': '完了',
    'downloads.emptyActive': '進行中のダウンロードはありません。曲を検索してダウンロードを押してください。',
    'downloads.emptyCompleted': '完了したダウンロードはまだありません。',
    'downloads.statusQueued': '待機中',
    'downloads.statusDownloading': 'ダウンロード中',
    'downloads.statusPaused': '一時停止',
    'downloads.statusCompleted': '完了',
    'downloads.statusError': 'エラー',
    'downloads.resume': '再開',
    'library.all': 'すべて',
    'library.favorites': 'お気に入り',
    'library.artists': 'アーティスト',
    'library.albums': 'アルバム',
    'library.empty': 'オフラインライブラリはまだ空です。',
    'batch.selected': '{count} 件選択中',
    'batch.all': 'すべて',
    'batch.favorite': 'お気に入り',
    'batch.playlist': 'プレイリスト',
    'track.lyrics': '歌詞',
    'track.list': 'リスト',
    'track.deleteShort': '削除',
    'player.nowPlaying': '再生中',
    'player.nothingPlaying': '再生中の曲なし',
    'player.chooseSong': 'ライブラリから曲を選択',
    'player.shuffle': 'シャッフル',
    'player.repeatOne': '1曲リピート',
    'player.noRepeat': 'リピートなし',
    'player.previous': '前へ',
    'player.next': '次へ',
    'playlists.namePlaceholder': 'プレイリスト名',
    'playlists.empty': 'プレイリストを作成して整理しましょう。',
    'playlists.songCount': '{count} 曲',
    'settings.title': '設定',
    'settings.theme': 'テーマ',
    'settings.dark': 'ダーク',
    'settings.light': 'ライト',
    'settings.darkHint': '夜に聴きやすいダーク表示。',
    'settings.lightHint': '明るい場所向けのライト表示。',
    'settings.language': '言語',
    'settings.searchEngines': '検索エンジン',
    'settings.active': '有効',
    'settings.inactive': '無効',
    'settings.unavailable': '利用不可',
    'equalizer.title': 'イコライザー',
    'equalizer.hint': 'イヤホンやスピーカーに合わせて周波数を調整します。',
    'equalizer.on': 'オン',
    'equalizer.off': 'オフ',
    'candidate.download': '保存',
    'candidate.url': 'URL',
  },
};

const I18nContext = createContext<(key: TranslationKey, vars?: Vars) => string>(() => '');

export function I18nProvider({ language, children }: { language: AppLanguage; children: ReactNode }) {
  const translate = useMemo(
    () => (key: TranslationKey, vars: Vars = {}) => {
      const template = translations[language][key] ?? translations['pt-BR'][key] ?? key;
      return Object.entries(vars).reduce(
        (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
        template,
      );
    },
    [language],
  );

  return <I18nContext.Provider value={translate}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
