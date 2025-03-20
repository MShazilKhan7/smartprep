export type FileType = "pdf" | "image" | "video" | "unknown";

export interface FileWithPreview {
  id: string;
  file: File;
  name: string;
  size: number;
  type: FileType;
}

export interface QuizConfig {
  title: string;
  type: "multiple-choice" | "true-false" | "short-answer" | "mixed";
  numberOfQuestions: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  topics: string;
  includeAnswerKey: boolean;
  shuffleQuestions: boolean;
  includeImages: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  choices?: string[];
  correctAnswer: string;
  sourceFile?: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface QuizData {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  questions: QuizQuestion[];
  includeAnswerKey: boolean;
  createdAt: string;
}

export interface UploadedFile {
  id: string;
  originalName: string;
  size: number;
  type: FileType;
  path: string;
  processedContent?: string;
}
