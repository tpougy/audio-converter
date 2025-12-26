/**
 * Audio converter module using FFmpeg.wasm
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { ConversionResult, ProgressState, OUTPUT_BITRATE } from './types';
import { getOutputFileName } from './utils';

type ProgressCallback = (progress: ProgressState) => void;

class AudioConverter {
  private ffmpeg: FFmpeg | null = null;
  private loaded = false;
  private loading = false;
  private abortController: AbortController | null = null;

  async load(onProgress?: ProgressCallback): Promise<void> {
    if (this.loaded) return;
    if (this.loading) {
      while (this.loading) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    this.loading = true;

    try {
      this.ffmpeg = new FFmpeg();

      this.ffmpeg.on('log', ({ message }) => {
        if (import.meta.env.DEV) {
          console.log('[FFmpeg]', message);
        }
      });

      this.ffmpeg.on('progress', ({ progress }) => {
        if (onProgress) {
          onProgress({
            stage: 'converting',
            percentage: Math.round(progress * 100),
            message: 'Convertendo áudio...',
          });
        }
      });

      onProgress?.({
        stage: 'loading',
        percentage: 0,
        message: 'Carregando conversor...',
      });

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      this.loaded = true;

      onProgress?.({
        stage: 'loading',
        percentage: 100,
        message: 'Conversor pronto!',
      });
    } catch (error) {
      this.ffmpeg = null;
      throw new Error(
        'Erro ao carregar o conversor. Verifique sua conexão com a internet e tente novamente.'
      );
    } finally {
      this.loading = false;
    }
  }

  async convert(
    inputFile: File,
    onProgress?: ProgressCallback
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    const outputFileName = getOutputFileName(inputFile.name);

    try {
      if (!this.ffmpeg || !this.loaded) {
        await this.load(onProgress);
      }

      if (!this.ffmpeg) {
        throw new Error('FFmpeg não está carregado');
      }

      this.abortController = new AbortController();

      onProgress?.({
        stage: 'converting',
        percentage: 0,
        message: 'Preparando arquivo...',
      });

      const inputData = await fetchFile(inputFile);
      const inputName = 'input' + this.getInputExtension(inputFile.name);
      const outputName = 'output.mp3';

      await this.ffmpeg.writeFile(inputName, inputData);

      onProgress?.({
        stage: 'converting',
        percentage: 5,
        message: 'Iniciando conversão...',
      });

      await this.ffmpeg.exec([
        '-i',
        inputName,
        '-c:a',
        'libmp3lame',
        '-b:a',
        OUTPUT_BITRATE,
        '-y',
        outputName,
      ]);

      onProgress?.({
        stage: 'finalizing',
        percentage: 95,
        message: 'Finalizando...',
      });

      const data = await this.ffmpeg.readFile(outputName);

      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);

      // Create a copy in a standard ArrayBuffer to ensure compatibility with Blob
      const uint8Data = data as Uint8Array;
      const buffer = new ArrayBuffer(uint8Data.byteLength);
      new Uint8Array(buffer).set(uint8Data);
      const outputBlob = new Blob([buffer], { type: 'audio/mpeg' });

      onProgress?.({
        stage: 'finalizing',
        percentage: 100,
        message: 'Conversão concluída!',
      });

      return {
        success: true,
        outputFile: outputBlob,
        outputFileName,
        error: null,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro durante a conversão. Por favor, tente novamente.';

      return {
        success: false,
        outputFile: null,
        outputFileName,
        error: errorMessage,
        duration: Date.now() - startTime,
      };
    } finally {
      this.abortController = null;
    }
  }

  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    if (this.ffmpeg) {
      this.ffmpeg.terminate();
      this.ffmpeg = null;
      this.loaded = false;
    }
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  private getInputExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '.opus';
    return filename.substring(lastDot).toLowerCase();
  }
}

export const audioConverter = new AudioConverter();
