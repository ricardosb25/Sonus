import * as DocumentPicker from 'expo-document-picker';
import { ImportedAudioFile } from '../../domain/models';

export interface AudioFilePickerService {
  pickAudio(): Promise<ImportedAudioFile | null>;
}

export const expoAudioFilePickerService: AudioFilePickerService = {
  async pickAudio() {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets.length) return null;

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
      size: asset.size,
    };
  },
};
