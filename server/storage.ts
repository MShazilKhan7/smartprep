import { 
  InsertFile, File, 
  InsertQuiz, Quiz,
  InsertQuestion, Question,
  files, quizzes, questions
} from "../shared/schema";

// Interface for storage operations
export interface IStorage {
  // File operations
  createFile(file: InsertFile): Promise<File>;
  getFile(id: number): Promise<File | undefined>;
  
  // Quiz operations
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  getQuizWithQuestions(id: number): Promise<Quiz & { questions: Question[] }>;
  
  // Question operations
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestion(id: number): Promise<Question | undefined>;
  getQuestionsByQuizId(quizId: number): Promise<Question[]>;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private filesMap: Map<number, File>;
  private quizzesMap: Map<number, Quiz>;
  private questionsMap: Map<number, Question>;
  private fileIdCounter: number;
  private quizIdCounter: number;
  private questionIdCounter: number;

  constructor() {
    this.filesMap = new Map();
    this.quizzesMap = new Map();
    this.questionsMap = new Map();
    this.fileIdCounter = 1;
    this.quizIdCounter = 1;
    this.questionIdCounter = 1;
  }

  // File operations
  async createFile(file: InsertFile): Promise<File> {
    const id = this.fileIdCounter++;
    const newFile: File = {
      id,
      ...file,
      processedContent: file.processedContent || null,
      uploadedAt: new Date()
    };
    this.filesMap.set(id, newFile);
    return newFile;
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.filesMap.get(id);
  }

  // Quiz operations
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const id = this.quizIdCounter++;
    const newQuiz: Quiz = {
      id,
      ...quiz,
      includeAnswerKey: quiz.includeAnswerKey ?? true,
      createdAt: new Date()
    };
    this.quizzesMap.set(id, newQuiz);
    return newQuiz;
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzesMap.get(id);
  }

  async getQuizWithQuestions(id: number): Promise<Quiz & { questions: Question[] }> {
    const quiz = await this.getQuiz(id);
    if (!quiz) {
      throw new Error(`Quiz with id ${id} not found`);
    }
    
    const quizQuestions = await this.getQuestionsByQuizId(id);
    return {
      ...quiz,
      questions: quizQuestions
    };
  }

  // Question operations
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.questionIdCounter++;
    const newQuestion: Question = {
      id,
      ...question,
      choices: question.choices ?? null,
      sourceFileId: question.sourceFileId ?? null
    };
    this.questionsMap.set(id, newQuestion);
    return newQuestion;
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questionsMap.get(id);
  }

  async getQuestionsByQuizId(quizId: number): Promise<Question[]> {
    return Array.from(this.questionsMap.values()).filter(
      (question) => question.quizId === quizId
    );
  }
}

export const storage = new MemStorage();
