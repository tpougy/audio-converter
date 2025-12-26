/**
 * Application state types and interfaces
 */

export type AppState =
  | 'initial'
  | 'preview'
  | 'loading-ffmpeg'
  | 'converting'
  | 'completed'
  | 'error';

export interface InputFile {
  name: string;
  size: number;
  type: string;
  blob: Blob;
}

export interface ConversionResult {
  success: boolean;
  outputFile: Blob | null;
  outputFileName: string;
  error: string | null;
  duration: number;
}

export interface ProgressState {
  stage: 'loading' | 'converting' | 'finalizing';
  percentage: number;
  message: string;
}

export interface ShareData {
  files: File[];
  title: string;
  text: string;
}

export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

export interface FileInfo {
  name: string;
  size: string;
  type: string;
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export const SUPPORTED_MIME_TYPES = [
  'audio/opus',
  'audio/ogg',
  'audio/ogg; codecs=opus',
  'audio/webm',
  'audio/webm; codecs=opus',
];

export const SUPPORTED_EXTENSIONS = ['.opus', '.ogg'];

export const OUTPUT_BITRATE = '192k';
export const OUTPUT_EXTENSION = '.mp3';
