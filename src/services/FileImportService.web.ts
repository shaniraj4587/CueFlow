export interface ImportedDocument {
  fileName: string;
  content: string;
}

export class FileImportService {
  /**
   * Open document picker to import a text/markdown file on Windows/Web
   */
  static async importTextDocument(): Promise<ImportedDocument | null> {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.importTextDocument) {
      try {
        const result = await (window as any).electronAPI.importTextDocument();
        if (!result) return null;
        return {
          fileName: result.fileName || 'Imported Script',
          content: result.content || '',
        };
      } catch (err: any) {
        if (err?.message === 'CANCELLED') return null;
        console.error('[FileImportService.web] electron import error:', err);
        throw err;
      }
    }

    // Web fallback using file input element
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.md,text/plain,text/markdown';
      input.style.display = 'none';

      input.onchange = (event: any) => {
        const file = event.target?.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const content = (e.target?.result as string) || '';
          resolve({
            fileName: file.name,
            content,
          });
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      };

      input.oncancel = () => resolve(null);
      document.body.appendChild(input);
      input.click();
      setTimeout(() => document.body.removeChild(input), 1000);
    });
  }

  /**
   * Save/export script as a plain-text file on Windows/Web
   */
  static async exportTextDocument(title: string, content: string): Promise<boolean> {
    const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'script';

    if (typeof window !== 'undefined' && (window as any).electronAPI?.exportTextFile) {
      try {
        return await (window as any).electronAPI.exportTextFile(safeTitle, content);
      } catch (err: any) {
        if (err?.message === 'CANCELLED') return false;
        console.error('[FileImportService.web] electron export error:', err);
        return false;
      }
    }

    // Web fallback using blob anchor download
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${safeTitle}.txt`;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      }, 500);
      return true;
    } catch (err) {
      console.error('[FileImportService.web] web export error:', err);
      return false;
    }
  }
}
