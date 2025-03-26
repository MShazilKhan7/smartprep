import fs from "fs";
import { createWorker } from "tesseract.js";
import pdfParse from "pdf-parse";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("FileProcessor module loaded");


class FileProcessor {
  /**
   * Process different file types and extract text content
   */
  async processFile(filePath: string, fileType: string): Promise<string> {
    console.log(`Processing file: ${filePath}, type: ${fileType}`);

    switch (fileType) {
      case "pdf":
        return await this.processPdf(filePath);
      case "image":
        return await this.processImage(filePath);
      case "video":
        return await this.processVideo(filePath);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  /**
   * Extract text from PDF files using pdf-parse
   */
  async processPdf(filePath: string): Promise<string> {
    console.log(`Processing PDF file: ${filePath}`);
    try {
      console.log(`Processing PDF file: ${filePath}`);

      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      console.log(data.text)
      return data.text;
    } catch (error) {
      console.error("Error processing PDF:", error);
      throw new Error(`Failed to process PDF: ${(error as Error).message}`);
    }
  }

  /**
   * Extract text from images using Tesseract OCR
   */
  async processImage(filePath: string): Promise<string> {
    try {
      console.log(`Processing image file: ${filePath}`);

      const worker = await createWorker();
      const result = await worker.recognize(filePath);
      await worker.terminate();

      console.log(`Extracted ${result.data.text.length} characters from image`);
      return result.data.text;
    } catch (error) {
      console.error("Error processing image:", error);
      throw new Error(`Failed to process image: ${(error as Error).message}`);
    }
  }

  /**
   * Process video files (placeholder - would require additional libraries)
   */
  async processVideo(filePath: string): Promise<string> {
    console.log(`Video processing requested for: ${filePath}`);
    return "Video processing is currently not fully implemented. This would extract text from video captions and audio transcription.";
  }
}

export const fileProcessor = new FileProcessor();