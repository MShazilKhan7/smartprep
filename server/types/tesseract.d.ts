declare module 'tesseract.js' {
  interface Worker {
    recognize(image: string | Uint8Array | ImageData | HTMLCanvasElement | HTMLImageElement): Promise<{
      data: {
        text: string;
        [key: string]: any;
      };
    }>;
    terminate(): Promise<void>;
  }

  export function createWorker(): Promise<Worker>;
}