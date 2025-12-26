/**
 * UI Controller - Manages interface states and user interactions
 */

import { AppState, ProgressState, FileInfo } from './types';
import { isWebShareSupported } from './utils';

class UIController {
  private currentState: AppState = 'initial';

  private elements: {
    initialState: HTMLElement | null;
    previewState: HTMLElement | null;
    loadingState: HTMLElement | null;
    convertingState: HTMLElement | null;
    completedState: HTMLElement | null;
    errorState: HTMLElement | null;
    dropZone: HTMLElement | null;
    fileInput: HTMLInputElement | null;
    fileName: HTMLElement | null;
    fileSize: HTMLElement | null;
    fileType: HTMLElement | null;
    progressBar: HTMLElement | null;
    progressText: HTMLElement | null;
    progressMessage: HTMLElement | null;
    outputFileName: HTMLElement | null;
    errorMessage: HTMLElement | null;
    shareButton: HTMLElement | null;
    downloadButton: HTMLElement | null;
    convertButton: HTMLElement | null;
    cancelButton: HTMLElement | null;
    retryButton: HTMLElement | null;
    selectAnotherButton: HTMLElement | null;
    convertAnotherButton: HTMLElement | null;
  };

  constructor() {
    this.elements = {
      initialState: null,
      previewState: null,
      loadingState: null,
      convertingState: null,
      completedState: null,
      errorState: null,
      dropZone: null,
      fileInput: null,
      fileName: null,
      fileSize: null,
      fileType: null,
      progressBar: null,
      progressText: null,
      progressMessage: null,
      outputFileName: null,
      errorMessage: null,
      shareButton: null,
      downloadButton: null,
      convertButton: null,
      cancelButton: null,
      retryButton: null,
      selectAnotherButton: null,
      convertAnotherButton: null,
    };
  }

  init(): void {
    this.elements = {
      initialState: document.getElementById('state-initial'),
      previewState: document.getElementById('state-preview'),
      loadingState: document.getElementById('state-loading'),
      convertingState: document.getElementById('state-converting'),
      completedState: document.getElementById('state-completed'),
      errorState: document.getElementById('state-error'),
      dropZone: document.getElementById('drop-zone'),
      fileInput: document.getElementById('file-input') as HTMLInputElement,
      fileName: document.getElementById('file-name'),
      fileSize: document.getElementById('file-size'),
      fileType: document.getElementById('file-type'),
      progressBar: document.getElementById('progress-bar'),
      progressText: document.getElementById('progress-text'),
      progressMessage: document.getElementById('progress-message'),
      outputFileName: document.getElementById('output-file-name'),
      errorMessage: document.getElementById('error-message'),
      shareButton: document.getElementById('btn-share'),
      downloadButton: document.getElementById('btn-download'),
      convertButton: document.getElementById('btn-convert'),
      cancelButton: document.getElementById('btn-cancel'),
      retryButton: document.getElementById('btn-retry'),
      selectAnotherButton: document.getElementById('btn-select-another'),
      convertAnotherButton: document.getElementById('btn-convert-another'),
    };

    if (!isWebShareSupported() && this.elements.shareButton) {
      this.elements.shareButton.style.display = 'none';
    }

    this.setState('initial');
  }

  setState(state: AppState): void {
    this.currentState = state;
    this.hideAllStates();

    switch (state) {
      case 'initial':
        this.showElement(this.elements.initialState);
        break;
      case 'preview':
        this.showElement(this.elements.previewState);
        break;
      case 'loading-ffmpeg':
        this.showElement(this.elements.loadingState);
        break;
      case 'converting':
        this.showElement(this.elements.convertingState);
        break;
      case 'completed':
        this.showElement(this.elements.completedState);
        break;
      case 'error':
        this.showElement(this.elements.errorState);
        break;
    }
  }

  getState(): AppState {
    return this.currentState;
  }

  showFilePreview(fileInfo: FileInfo): void {
    if (this.elements.fileName) {
      this.elements.fileName.textContent = fileInfo.name;
    }
    if (this.elements.fileSize) {
      this.elements.fileSize.textContent = fileInfo.size;
    }
    if (this.elements.fileType) {
      this.elements.fileType.textContent = fileInfo.type;
    }
    this.setState('preview');
  }

  updateProgress(progress: ProgressState): void {
    if (progress.stage === 'loading') {
      this.setState('loading-ffmpeg');
    } else {
      this.setState('converting');
    }

    if (this.elements.progressBar) {
      this.elements.progressBar.style.width = `${progress.percentage}%`;
      this.elements.progressBar.setAttribute(
        'aria-valuenow',
        progress.percentage.toString()
      );
    }
    if (this.elements.progressText) {
      this.elements.progressText.textContent = `${progress.percentage}%`;
    }
    if (this.elements.progressMessage) {
      this.elements.progressMessage.textContent = progress.message;
    }
  }

  showCompleted(outputFileName: string): void {
    if (this.elements.outputFileName) {
      this.elements.outputFileName.textContent = outputFileName;
    }
    this.setState('completed');
  }

  showError(message: string): void {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.textContent = message;
    }
    this.setState('error');
  }

  resetToInitial(): void {
    if (this.elements.fileInput) {
      this.elements.fileInput.value = '';
    }
    this.resetProgress();
    this.setState('initial');
  }

  setupDragAndDrop(onFileDrop: (file: File) => void): void {
    const dropZone = this.elements.dropZone;
    if (!dropZone) return;

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        onFileDrop(files[0]);
      }
    });

    dropZone.addEventListener('click', () => {
      this.elements.fileInput?.click();
    });
  }

  setupFileInput(onFileSelect: (file: File) => void): void {
    const fileInput = this.elements.fileInput;
    if (!fileInput) return;

    fileInput.addEventListener('change', () => {
      const files = fileInput.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    });
  }

  onConvertClick(callback: () => void): void {
    this.elements.convertButton?.addEventListener('click', callback);
  }

  onCancelClick(callback: () => void): void {
    this.elements.cancelButton?.addEventListener('click', callback);
  }

  onRetryClick(callback: () => void): void {
    this.elements.retryButton?.addEventListener('click', callback);
  }

  onSelectAnotherClick(callback: () => void): void {
    this.elements.selectAnotherButton?.addEventListener('click', callback);
  }

  onConvertAnotherClick(callback: () => void): void {
    this.elements.convertAnotherButton?.addEventListener('click', callback);
  }

  onShareClick(callback: () => void): void {
    this.elements.shareButton?.addEventListener('click', callback);
  }

  onDownloadClick(callback: () => void): void {
    this.elements.downloadButton?.addEventListener('click', callback);
  }

  private hideAllStates(): void {
    const states = [
      this.elements.initialState,
      this.elements.previewState,
      this.elements.loadingState,
      this.elements.convertingState,
      this.elements.completedState,
      this.elements.errorState,
    ];

    states.forEach((state) => {
      if (state) {
        state.classList.add('d-none');
      }
    });
  }

  private showElement(element: HTMLElement | null): void {
    if (element) {
      element.classList.remove('d-none');
    }
  }

  private resetProgress(): void {
    if (this.elements.progressBar) {
      this.elements.progressBar.style.width = '0%';
      this.elements.progressBar.setAttribute('aria-valuenow', '0');
    }
    if (this.elements.progressText) {
      this.elements.progressText.textContent = '0%';
    }
    if (this.elements.progressMessage) {
      this.elements.progressMessage.textContent = '';
    }
  }
}

export const uiController = new UIController();
