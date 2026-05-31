# Arquitetura

Sonus segue uma organizacao em camadas inspirada em Clean Architecture e SOLID. A regra central e simples: UI nao deve conhecer detalhes de arquivo, rede ou player nativo.

## Camadas

### Domain

Contem modelos, tipos e regras puras.

Exemplos:

- `models.ts`
- `equalizer.ts`
- `language.ts`
- `librarySelectors.ts`
- `playlistFactory.ts`

Essa camada nao depende de React Native, Expo ou rede.

### Data

Define contratos e adaptadores de repositorio.

Exemplos:

- `LibraryRepository`
- `SettingsRepository`

A aplicacao fala com interfaces, nao diretamente com `FileSystem`.

### Application

Orquestra casos de uso.

Exemplos:

- `useSonusLibrary`
- `useAppSettings`
- `TrackPlaybackService`
- `MusicDiscoveryService`
- `AudioFilePickerService`

Aqui ficam fluxos como buscar musicas, gerenciar fila de downloads, importar arquivo, selecionar varias faixas, favoritar em lote e alterar configuracoes.

### Services

Implementacoes concretas de IO.

Exemplos:

- `LibraryService`: grava `library.json`, copia arquivos e baixa audio.
- `SettingsService`: grava `settings.json`.
- `OnlineMusicService`: chama iTunes, Deezer, Audius e Lyrics.ovh.
- `TrackPlaybackService`: controla reproducao nativa via `expo-audio`.

### Presentation

Componentes visuais e telas.

Exemplos:

- `DownloadScreen`
- `DownloadsQueueScreen`
- `LibraryScreen`
- `PlaylistsScreen`
- `PlayerModal`
- `SettingsModal`
- `TrackRow`
- `BatchActionsBar`

Componentes recebem props e chamam actions. Eles nao fazem IO diretamente.

## Principios aplicados

- Responsabilidade unica: cada arquivo tem um motivo claro para mudar.
- Inversao de dependencia: hooks usam repositorios/servicos por contrato.
- Aberto/fechado: novos provedores de busca podem ser adicionados sem mudar telas.
- Separacao de UI e regra: componentes renderizam, hooks orquestram.
- Persistencia isolada: `expo-file-system` fica em services/repositories.

## Como adicionar um novo provedor de busca

1. Abra `src/services/OnlineMusicService.ts`.
2. Crie uma funcao `searchNovoProvedor(query)`.
3. Mapeie o resultado para `DownloadCandidate`.
4. Adicione o provedor no array `providers`.

## Como adicionar uma nova configuracao

1. Adicione o campo em `src/domain/settings.ts`.
2. Ajuste merge/fallback em `src/services/SettingsService.ts`.
3. Exponha action em `useAppSettings`.
4. Renderize no `SettingsModal`.

## Como adicionar nova acao em lote

1. Adicione o caso de uso em `useSonusLibrary`.
2. Exponha a action no retorno do hook.
3. Adicione botao no `BatchActionsBar` ou crie um modal proprio.
4. Mantenha remocoes de arquivo via `LibraryRepository`.
