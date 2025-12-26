/**
 * Share Handler - Web Share Target and Web Share API handling
 */

import { isWebShareSupported, createDownloadLink } from './utils';

const SHARED_FILE_KEY = 'shared-audio-file';

class ShareHandler {
  async getSharedFile(): Promise<File | null> {
    try {
      const cache = await caches.open('shared-files');
      const response = await cache.match(SHARED_FILE_KEY);

      if (response) {
        const blob = await response.blob();
        const fileName =
          response.headers.get('X-File-Name') || 'audio.opus';
        const file = new File([blob], fileName, { type: blob.type });

        await cache.delete(SHARED_FILE_KEY);

        return file;
      }
    } catch (error) {
      console.error('Error retrieving shared file:', error);
    }

    return null;
  }

  async shareFile(blob: Blob, fileName: string): Promise<boolean> {
    if (!isWebShareSupported()) {
      return false;
    }

    try {
      const file = new File([blob], fileName, { type: 'audio/mpeg' });

      const shareData = {
        files: [file],
        title: fileName,
        text: 'Áudio convertido para MP3',
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return true;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return false;
      }
      console.error('Error sharing file:', error);
    }

    return false;
  }

  downloadFile(blob: Blob, fileName: string): void {
    createDownloadLink(blob, fileName);
  }

  isShareTargetAvailable(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('share-target') || urlParams.has('receiving-file-share');
  }

  clearShareParams(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('share-target');
    url.searchParams.delete('receiving-file-share');
    window.history.replaceState({}, '', url.toString());
  }
}

export const shareHandler = new ShareHandler();
