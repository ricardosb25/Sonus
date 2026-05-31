# Sonus

Sonus e um app mobile para baixar, importar, organizar e ouvir musicas offline.

Ele foi reconstruido com Expo + React Native, armazenamento local, player nativo, biblioteca offline, playlists, favoritos, letras, temas, idiomas, equalizador visual e widgets Android.

## Destaques

- Busca online configuravel: Audius, Internet Archive, iTunes Preview, Deezer Preview e YouTube como descoberta oficial.
- Download por resultado de busca ou URL direta de audio, com fila para acompanhar, pausar, retomar e excluir downloads.
- Importacao de arquivos de audio do dispositivo.
- Biblioteca offline persistida no armazenamento interno do app.
- Player com fila, progresso, modos aleatorio, repetir uma musica e nao repetir.
- Playlists com criacao, edicao, exclusao e acoes em lote.
- Selecao multipla para favoritar, adicionar a playlist e excluir do dispositivo.
- Letras online via Lyrics.ovh, salvas quando encontradas.
- Filtros por todas, favoritas, artistas e albuns.
- Configuracoes de tema, idioma, equalizador e motores de busca.
- Widgets Android de tela inicial em dois tamanhos.

## Documentacao

- [Documento tecnico](docs/PROJECT_DOCUMENTATION.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Diagramas](docs/DIAGRAMS.md)

## Stack

- Expo SDK 55
- React 19
- React Native 0.83
- TypeScript
- expo-audio
- expo-file-system
- expo-document-picker
- EAS Build

## Estrutura

```text
src/
  domain/          Modelos, regras puras, presets e seletores.
  data/            Interfaces de repositorio e adaptadores.
  application/     Hooks e servicos de aplicacao.
  presentation/    Telas, componentes, modais e estilos.
  services/        Integracoes concretas com Expo, rede e TrackPlayer.
  shared/          Utilitarios reutilizaveis.
plugins/           Plugins Expo de prebuild, incluindo widgets Android.
docs/              Documentacao tecnica e diagramas.
```

## Instalar

```bash
npm install
```

Se o `npm` global do Windows estiver quebrado, use:

```bash
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install
```

## Rodar

```bash
npm start
```

Para Android com dev client:

```bash
npm run android
```

Para testar recursos nativos com o mesmo comportamento da build final, prefira `npm run android` ou uma build EAS instalada no aparelho.

## Gerar APK

```bash
npx eas login
npm run build:apk
```

O perfil `preview` em `eas.json` gera APK (`android.buildType = "apk"`).

## Verificar

```bash
npm run typecheck
npx expo config --type public
node --check plugins/withSonusAndroidWidgets.js
```

## YouTube

O YouTube pode ser ativado em `Configuracoes > Motores de busca`, mas ele funciona como descoberta/link oficial, sem download direto de audio. Os resultados exibem uma URL selecionavel para copiar e colar no navegador.

Para pesquisar no YouTube, crie uma chave da YouTube Data API v3 no Google Cloud e rode o app com:

```bash
EXPO_PUBLIC_YOUTUBE_API_KEY=sua_chave npm start
```

No PowerShell:

```powershell
$env:EXPO_PUBLIC_YOUTUBE_API_KEY="sua_chave"
npm start
```

## Observacoes

- A versao atual evita extracao/download nao oficial do YouTube. Resultados do YouTube mostram a URL oficial para o usuario copiar.
- A interface e persistencia do equalizador estao prontas, mas DSP real exige um modulo nativo de audio effect plugado por plataforma.
- Widgets Android sao gerados no `expo prebuild` pelo plugin `plugins/withSonusAndroidWidgets.js`.
