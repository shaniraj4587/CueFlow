import { NativeModules } from 'react-native';

const { FileAccessModule } = NativeModules;

export interface ImportedDocument {
  fileName: string;
  content: string;
}

export class FileImportService {
  /**
   * Open Android system document picker to import a text/markdown file
   */
  static async importTextDocument(): Promise<ImportedDocument | null> {
    if (!FileAccessModule || !FileAccessModule.pickTextFile) {
      console.warn('[FileImportService] FileAccessModule not available');
      return null;
    }

    try {
      const result = await FileAccessModule.pickTextFile();
      return {
        fileName: result.fileName || 'Imported Script',
        content: result.content || '',
      };
    } catch (err: any) {
      if (err?.code === 'CANCELLED') {
        return null;
      }
      console.error('[FileImportService] pickTextFile error:', err);
      throw err;
    }
  }

  /**
   * Save/export script to device as a plain-text file
   */
  static async exportTextDocument(title: string, content: string): Promise<boolean> {
    if (!FileAccessModule || !FileAccessModule.exportTextFile) {
      console.warn('[FileImportService] FileAccessModule not available');
      return false;
    }

    try {
      const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'script';
      return await FileAccessModule.exportTextFile(safeTitle, content);
    } catch (err: any) {
      if (err?.code === 'CANCELLED') {
        return false;
      }
      console.error('[FileImportService] exportTextFile error:', err);
      throw err;
    }
  }
}
