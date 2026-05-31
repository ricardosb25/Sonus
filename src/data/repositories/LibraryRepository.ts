import {
  deleteTrackFiles,
  downloadTrack,
  DownloadProgressHandler,
  importTrackFromFile,
  loadLibrary,
  RunningDownload,
  saveLibrary,
  startDownloadTrack,
} from '../../services/LibraryService';
import {
  DownloadCandidate,
  ImportedAudioFile,
  ImportedTrackMetadata,
  LibraryData,
  Track,
} from '../../domain/models';

export interface LibraryRepository {
  load(): Promise<LibraryData>;
  save(library: LibraryData): Promise<void>;
  download(candidate: DownloadCandidate): Promise<Track>;
  startDownload(candidate: DownloadCandidate, onProgress: DownloadProgressHandler): RunningDownload;
  importAudio(file: ImportedAudioFile, metadata: ImportedTrackMetadata): Promise<Track>;
  deleteFiles(track: Track): Promise<void>;
}

export const fileSystemLibraryRepository: LibraryRepository = {
  load: loadLibrary,
  save: saveLibrary,
  download: downloadTrack,
  startDownload: startDownloadTrack,
  importAudio: importTrackFromFile,
  deleteFiles: deleteTrackFiles,
};
