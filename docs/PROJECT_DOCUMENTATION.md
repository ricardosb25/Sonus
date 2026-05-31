# Sonus - Documento tecnico

## Objetivo

Sonus e um aplicativo mobile para ouvir musica offline. O usuario pode buscar previews online, baixar resultados, importar arquivos proprios, organizar biblioteca, criar playlists e controlar reproducao pelo app ou por widgets Android.

## Escopo funcional

### Biblioteca

- Armazena musicas baixadas ou importadas.
- Persiste dados em `library.json`.
- Mantem arquivos de audio em uma pasta interna do app.
- Permite filtrar por todas, favoritas, artistas e albuns.
- Permite selecao multipla para operacoes em lote.

### Busca e download

- Usa motores configuraveis:
  - Audius.
  - Internet Archive.
  - iTunes Preview.
  - Deezer Preview.
- YouTube aparece como indisponivel para download, sem extracao de audio.
- Executa buscas em paralelo.
- Remove duplicados por titulo, artista e album.
- Exibe a fonte de cada resultado.
- Mostra inicialmente os tres primeiros resultados e permite expandir com "Mostrar mais".
- Envia downloads para uma fila acompanhavel.
- Permite pausar, retomar e excluir itens da fila.
- Baixa audio e capa quando disponivel.

### Importacao local

- Usa `expo-document-picker`.
- Permite selecionar arquivo `audio/*` do dispositivo.
- Copia o arquivo para a pasta interna do Sonus.
- Permite editar titulo, artista e album antes da importacao.

### Player

- Usa `expo-audio`.
- Suporta fila, play/pause, anterior, proxima e seek.
- Modos:
  - Aleatorio.
  - Repetir uma musica.
  - Nao repetir.
- Equalizador visual com presets e 5 bandas persistidas.

### Playlists

- Criar, renomear e excluir playlists.
- Adicionar/remover musicas individualmente.
- Adicionar varias musicas por selecao multipla.
- Remover varias musicas de uma playlist sem excluir arquivos do dispositivo.

### Configuracoes

- Tema claro/escuro.
- Idiomas disponiveis:
  - Portugues Brasileiro.
  - Ingles.
  - Japones.
- Equalizador.
- Motores de busca.
- Persistencia em `settings.json`.

### Widgets Android

- Plugin Expo gera dois widgets no prebuild:
  - Compacto.
  - Grande.
- Widgets sao redimensionaveis pelo launcher.
- Enviam comandos de midia Android: play/pause, anterior e proxima.

## Dados persistidos

### `library.json`

```ts
interface LibraryData {
  tracks: Track[];
  playlists: Playlist[];
  lastUpdated: string;
}
```

### `settings.json`

```ts
interface AppSettings {
  themeMode: 'dark' | 'light';
  language: 'pt-BR' | 'en' | 'ja';
  equalizer: EqualizerSettings;
}
```

## Principais arquivos

- `src/domain/models.ts`: modelos centrais.
- `src/domain/equalizer.ts`: presets e regras do equalizador.
- `src/domain/language.ts`: idiomas suportados.
- `src/domain/librarySelectors.ts`: filtros e agrupamentos puros.
- `src/data/repositories/LibraryRepository.ts`: contrato/adaptador da biblioteca.
- `src/data/repositories/SettingsRepository.ts`: contrato/adaptador de configuracoes.
- `src/application/hooks/useSonusLibrary.ts`: casos de uso da biblioteca.
- `src/application/hooks/useAppSettings.ts`: casos de uso de configuracoes.
- `src/application/services/TrackPlaybackService.ts`: controle do player com `expo-audio`.
- `src/services/OnlineMusicService.ts`: provedores de busca.
- `src/services/LibraryService.ts`: IO local de biblioteca e audio.
- `src/presentation/AppRoot.tsx`: composicao da UI.
- `src/presentation/screens/DownloadsQueueScreen.tsx`: acompanhamento da fila de downloads.
- `plugins/withSonusAndroidWidgets.js`: widgets Android.

## Limites atuais

- Equalizador ainda nao aplica DSP real ao audio. A UI e a persistencia estao preparadas para receber um modulo nativo.
- YouTube nao faz extracao/download de audio no Sonus. Para catalogo completo, e preciso integrar uma API licenciada ou fonte autorizada.
- Widgets Android dependem de prebuild/build nativo; nao aparecem apenas no Expo Go.

## Proximos passos recomendados

- Adicionar testes unitarios para `domain/` e hooks principais.
- Criar uma camada i18n completa para traduzir todas as strings da interface.
- Integrar modulo nativo Android para equalizador real.
- Melhorar metadados de arquivos importados lendo tags ID3/MP4.
- Adicionar tela de edicao de metadados por musica.
