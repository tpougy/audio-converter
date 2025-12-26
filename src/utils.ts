/**
 * Utility functions for file validation and formatting
 */

import {
  ValidationResult,
  FileInfo,
  MAX_FILE_SIZE,
  SUPPORTED_MIME_TYPES,
  SUPPORTED_EXTENSIONS,
  OUTPUT_EXTENSION,
} from './types';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot).toLowerCase();
}

export function replaceExtension(filename: string, newExtension: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return filename + newExtension;
  return filename.substring(0, lastDot) + newExtension;
}

export function validateFile(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. O tamanho máximo é ${formatFileSize(MAX_FILE_SIZE)}.`,
    };
  }

  const extension = getFileExtension(file.name);
  const mimeType = file.type.toLowerCase();

  const hasValidExtension = SUPPORTED_EXTENSIONS.includes(extension);
  const hasValidMimeType =
    SUPPORTED_MIME_TYPES.includes(mimeType) ||
    mimeType.startsWith('audio/');

  if (!hasValidExtension && !hasValidMimeType) {
    return {
      valid: false,
      error: 'Este formato não é suportado. Por favor, selecione um arquivo .opus ou .ogg',
    };
  }

  return { valid: true, error: null };
}

export function getFileInfo(file: File): FileInfo {
  return {
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type || 'audio/opus',
  };
}

export function getOutputFileName(inputFileName: string): string {
  return replaceExtension(inputFileName, OUTPUT_EXTENSION);
}

export function createDownloadLink(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function isWebShareSupported(): boolean {
  return 'share' in navigator && 'canShare' in navigator;
}

export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
