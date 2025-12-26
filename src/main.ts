/**
 * Main entry point - Application initialization and orchestration
 */

import { uiController } from "./ui-controller";
import { audioConverter } from "./converter";
import { shareHandler } from "./share-handler";
import { validateFile, getFileInfo, isServiceWorkerSupported } from "./utils";
import { ConversionResult } from "./types";

class App {
  private currentFile: File | null = null;
  private conversionResult: ConversionResult | null = null;

  async init(): Promise<void> {
    uiController.init();

    this.setupEventHandlers();

    await this.registerServiceWorker();

    await this.checkForSharedFile();
  }

  private setupEventHandlers(): void {
    uiController.setupDragAndDrop((file) => this.handleFileSelected(file));
    uiController.setupFileInput((file) => this.handleFileSelected(file));

    uiController.onConvertClick(() => this.startConversion());
    uiController.onCancelClick(() => this.cancelConversion());
    uiController.onRetryClick(() => this.retryConversion());
    uiController.onSelectAnotherClick(() => this.reset());
    uiController.onConvertAnotherClick(() => this.reset());
    uiController.onShareClick(() => this.shareResult());
    uiController.onDownloadClick(() => this.downloadResult());
  }

  private async registerServiceWorker(): Promise<void> {
    if (!isServiceWorkerSupported()) {
      console.warn("Service Worker not supported");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "./",
      });

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("New version available");
            }
          });
        }
      });

      console.log("Service Worker registered");
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  private async checkForSharedFile(): Promise<void> {
    if (!shareHandler.isShareTargetAvailable()) {
      return;
    }

    const sharedFile = await shareHandler.getSharedFile();

    if (sharedFile) {
      shareHandler.clearShareParams();
      this.handleFileSelected(sharedFile);
      await this.startConversion();
    }
  }

  private handleFileSelected(file: File): void {
    const validation = validateFile(file);

    if (!validation.valid) {
      uiController.showError(validation.error || "Arquivo inválido");
      return;
    }

    this.currentFile = file;
    const fileInfo = getFileInfo(file);
    uiController.showFilePreview(fileInfo);
  }

  private async startConversion(): Promise<void> {
    if (!this.currentFile) {
      uiController.showError("Nenhum arquivo selecionado");
      return;
    }

    try {
      this.conversionResult = await audioConverter.convert(
        this.currentFile,
        (progress) => uiController.updateProgress(progress)
      );

      if (this.conversionResult.success && this.conversionResult.outputFile) {
        uiController.showCompleted(this.conversionResult.outputFileName);
      } else {
        uiController.showError(
          this.conversionResult.error ||
            "Ocorreu um erro durante a conversão. Por favor, tente novamente."
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro durante a conversão. Por favor, tente novamente.";
      uiController.showError(message);
    }
  }

  private cancelConversion(): void {
    audioConverter.cancel();
    this.reset();
  }

  private async retryConversion(): Promise<void> {
    if (this.currentFile) {
      await this.startConversion();
    } else {
      this.reset();
    }
  }

  private reset(): void {
    this.currentFile = null;
    this.conversionResult = null;
    uiController.resetToInitial();
  }

  private async shareResult(): Promise<void> {
    if (!this.conversionResult?.outputFile) {
      return;
    }

    const shared = await shareHandler.shareFile(
      this.conversionResult.outputFile,
      this.conversionResult.outputFileName
    );

    if (!shared) {
      this.downloadResult();
    }
  }

  private downloadResult(): void {
    if (!this.conversionResult?.outputFile) {
      return;
    }

    shareHandler.downloadFile(
      this.conversionResult.outputFile,
      this.conversionResult.outputFileName
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init().catch(console.error);
});
