import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileProcessor } from "./services/fileProcessor";
import { quizGenerator } from "./services/quizGenerator";
import { fileURLToPath } from 'url';

// ES modules equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      // Use a unique filename to prevent collisions
      const uniqueFileName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueFileName);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only pdf, common image formats, and mp4
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'video/mp4'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Only PDF, JPG, PNG and MP4 files are supported.') as any);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // File upload endpoint
  app.post("/api/upload", upload.array("files", 10), async (req, res) => {
    try {
      const uploadedFiles = req.files as Express.Multer.File[];
      
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ message: "No files were uploaded" });
      }
      
      // Process and store files
      const savedFiles = [];
      for (const file of uploadedFiles) {
        // Determine file type
        let fileType = "unknown";
        if (file.mimetype.includes("pdf")) fileType = "pdf";
        else if (file.mimetype.includes("image")) fileType = "image";
        else if (file.mimetype.includes("video")) fileType = "video";
        
        // Process file content
        const processedContent = await fileProcessor.processFile(file.path, fileType);
        
        // Save file in storage
        const savedFile = await storage.createFile({
          originalName: file.originalname,
          size: file.size,
          type: fileType,
          path: file.path,
          processedContent
        });
        
        savedFiles.push(savedFile);
      }
      
      res.status(200).json(savedFiles);
    } catch (error) {
      console.error("File upload failed:", error);
      res.status(500).json({ message: "File upload failed", error: (error as Error).message });
    }
  });
  
  // Generate quiz endpoint
  app.post("/api/generate-quiz", async (req, res) => {
    try {
      console.log("Generate quiz request received:", JSON.stringify(req.body, null, 2));
      
      const { config, fileIds } = req.body;
      
      if (!config) {
        console.log("Error: Quiz configuration is missing");
        return res.status(400).json({ message: "Quiz configuration is required" });
      }
      
      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        console.log("Error: File IDs are missing or invalid:", fileIds);
        return res.status(400).json({ message: "At least one file is required" });
      }
      
      // Get files from storage
      const files = [];
      console.log("Looking up files with IDs:", fileIds);
      
      for (const fileId of fileIds) {
        console.log(`Looking up file with ID: ${fileId}, type: ${typeof fileId}`);
        
        let parsedId;
        try {
          parsedId = parseInt(fileId, 10);
          console.log(`Parsed ID: ${parsedId}`);
        } catch (err) {
          console.log(`Failed to parse ID: ${fileId}`, err);
          continue;
        }
        
        if (isNaN(parsedId)) {
          console.log(`ID is not a valid number: ${fileId}`);
          continue;
        }
        
        const file = await storage.getFile(parsedId);
        if (file) {
          console.log(`Found file: ${file.originalName}`);
          files.push(file);
        } else {
          console.log(`File not found with ID: ${parsedId}`);
        }
      }
      
      if (files.length === 0) {
        console.log("Error: No valid files found for the provided IDs");
        return res.status(404).json({ message: "No valid files found" });
      }
      
      // Generate quiz from files
      const generatedQuizData = await quizGenerator.generateQuiz(files, config);
      
      // Save quiz to storage
      const savedQuiz = await storage.createQuiz({
        title: config.title || "Generated Quiz",
        type: config.type,
        difficulty: config.difficulty,
        includeAnswerKey: config.includeAnswerKey,
        numberOfQuestions: config.numberOfQuestions,
      });
      
      // Save quiz questions
      for (const question of generatedQuizData.questions) {
        await storage.createQuestion({
          quizId: savedQuiz.id,
          text: question.text,
          type: question.type,
          choices: question.choices,
          correctAnswer: question.correctAnswer,
          sourceFileId: question.sourceFile ? parseInt(question.sourceFile, 10) : undefined,
          difficulty: question.difficulty,
        });
      }
      
      // Get the complete quiz with questions
      const completeQuiz = await storage.getQuizWithQuestions(savedQuiz.id);
      
      res.status(200).json({
        ...completeQuiz,
        includeAnswerKey: config.includeAnswerKey
      });
    } catch (error) {
      console.error("Quiz generation failed:", error);
      res.status(500).json({ message: "Quiz generation failed", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
