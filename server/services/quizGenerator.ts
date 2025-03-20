import { File } from '../../shared/schema';
import nlp from 'compromise';
import natural from 'natural';

// Define types locally to avoid circular dependencies
type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';
type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'mixed';

interface QuizConfig {
  title: string;
  type: QuestionType | 'mixed';
  numberOfQuestions: number;
  difficulty: DifficultyLevel;
  topics: string;
  includeAnswerKey: boolean;
  shuffleQuestions: boolean;
  includeImages: boolean;
}

interface QuizQuestion {
  id: string;
  text: string;
  type: QuestionType;
  choices?: string[];
  correctAnswer: string;
  sourceFile?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizData {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  questions: QuizQuestion[];
  includeAnswerKey: boolean;
  createdAt: string;
}

class QuizGenerator {
  /**
   * Generate a quiz from the processed content of files
   */
  async generateQuiz(files: File[], config: QuizConfig): Promise<QuizData> {
    console.log(`Generating quiz with config:`, config);
    
    // Combine content from all files
    let combinedContent = '';
    for (const file of files) {
      if (file.processedContent) {
        combinedContent += file.processedContent + '\n\n';
      }
    }
    
    // Generate questions based on content
    const questions = await this.generateQuestions(
      combinedContent,
      config.type,
      config.numberOfQuestions,
      config.difficulty,
      config.topics,
      files
    );
    
    // Create quiz data
    const quizData: QuizData = {
      id: Date.now().toString(),
      title: config.title,
      type: config.type,
      difficulty: config.difficulty,
      questions: questions,
      includeAnswerKey: config.includeAnswerKey,
      createdAt: new Date().toISOString()
    };
    
    return quizData;
  }

  /**
   * Generate quiz questions based on the content
   */
  private async generateQuestions(
    content: string,
    type: QuestionType | 'mixed',
    count: number,
    difficulty: DifficultyLevel,
    topics: string,
    files: File[]
  ): Promise<QuizQuestion[]> {
    // Extract sentences from content
    const tokenizer = new natural.SentenceTokenizer([
      'Dr', 'Mr', 'Mrs', 'Ms', 'Prof', 'e.g', 'i.e', 'etc', 'Fig', 'Eq', 'Vol', 'Jan', 'Feb', 'Mar',
      'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Ph.D', 'M.D', 'B.A', 'M.A', 'A.M', 'P.M'
    ]);
    const sentences = tokenizer.tokenize(content) || [];
    
    // Filter sentences to include those related to the topics if specified
    let relevantSentences = sentences;
    if (topics && topics.trim() !== '') {
      const topicKeywords = topics.toLowerCase().split(',').map(t => t.trim());
      relevantSentences = sentences.filter(sentence => {
        const lowercaseSentence = sentence.toLowerCase();
        return topicKeywords.some(keyword => lowercaseSentence.includes(keyword));
      });
      
      // If no relevant sentences found, fallback to all sentences
      if (relevantSentences.length < 5) {
        console.log(`Not enough topic-relevant sentences found, using all content`);
        relevantSentences = sentences;
      }
    }
    
    // Check if we have sentences to work with
    if (relevantSentences.length === 0) {
      // Create some default sentences based on the file metadata if no content is available
      relevantSentences = files.map(file => 
        `This file is called ${file.originalName} and has a size of ${file.size} bytes.`
      );
      
      // Add a few generic statements about quizzes
      relevantSentences.push(
        "Quizzes are effective tools for learning and knowledge assessment.",
        "Multiple-choice questions test recognition of correct answers among alternatives.",
        "True-false questions evaluate understanding of factual statements.",
        "Short-answer questions require recall and formulation of concise responses.",
        "Good quiz questions are clear, unambiguous, and focus on important concepts."
      );
    }
    
    console.log(`Working with ${relevantSentences.length} sentences for quiz generation`);
    
    // Analyze sentences for complexity (using length as a simple proxy for now)
    const analyzedSentences = relevantSentences.map(sentence => {
      const terms = nlp(sentence).terms().out('array');
      return {
        sentence,
        terms,
        complexity: terms.length,
        sourceFile: files.find(f => f.processedContent?.includes(sentence))?.id || ''
      };
    });
    
    // Sort by complexity
    analyzedSentences.sort((a, b) => a.complexity - b.complexity);
    
    // Determine slice of sentences to use based on difficulty
    let selectedSentences: typeof analyzedSentences = [];
    const totalSentences = analyzedSentences.length;
    
    if (difficulty === 'easy') {
      selectedSentences = analyzedSentences.slice(0, Math.floor(totalSentences * 0.4));
    } else if (difficulty === 'medium') {
      selectedSentences = analyzedSentences.slice(
        Math.floor(totalSentences * 0.3),
        Math.floor(totalSentences * 0.7)
      );
    } else if (difficulty === 'hard') {
      selectedSentences = analyzedSentences.slice(Math.floor(totalSentences * 0.6));
    } else {
      // Mixed difficulty - select randomly from all sentences
      selectedSentences = this.shuffleArray(analyzedSentences);
    }
    
    // Generate questions based on type
    const questions: QuizQuestion[] = [];
    let uniqueQuestionTexts = new Set<string>();
    
    // Keep attempting to generate questions until we have enough
    let attempts = 0;
    const maxAttempts = count * 3;
    
    while (questions.length < count && attempts < maxAttempts) {
      attempts++;
      
      // Determine the question type to generate
      let questionType: QuestionType = type as QuestionType;
      if (type === 'mixed') {
        const types: QuestionType[] = ['multiple-choice', 'true-false', 'short-answer'];
        questionType = types[Math.floor(Math.random() * types.length)];
      }
      
      // Randomly select a sentence
      const randomIdx = Math.floor(Math.random() * selectedSentences.length);
      const sentenceData = selectedSentences[randomIdx];
      
      // Skip if the sentence is too short to make a question
      if (sentenceData.terms.length < 5) continue;
      
      let question: QuizQuestion | null = null;
      
      // Generate question based on type
      switch (questionType) {
        case 'multiple-choice':
          question = this.createMultipleChoiceQuestion(sentenceData.sentence, sentenceData.terms, sentenceData.sourceFile, difficulty);
          break;
        case 'true-false':
          question = this.createTrueFalseQuestion(sentenceData.sentence, sentenceData.sourceFile, difficulty);
          break;
        case 'short-answer':
          question = this.createShortAnswerQuestion(sentenceData.sentence, sentenceData.terms, sentenceData.sourceFile, difficulty);
          break;
      }
      
      // Add to questions if it's unique
      if (question && !uniqueQuestionTexts.has(question.text)) {
        uniqueQuestionTexts.add(question.text);
        questions.push(question);
      }
    }
    
    // Shuffle questions
    this.shuffleArray(questions);
    
    console.log(`Generated ${questions.length} questions`);
    return questions;
  }

  /**
   * Create a multiple choice question from a sentence
   */
  private createMultipleChoiceQuestion(
    sentence: string,
    terms: string[],
    sourceFile: string | number,
    difficulty: DifficultyLevel
  ): QuizQuestion {
    // Select a term to use for the question
    const term = this.selectTerm(terms, difficulty);
    
    // Create the question by replacing the term with a blank
    const questionText = sentence.replace(term, '_______');
    
    // Generate incorrect options
    let incorrectOptions = this.shuffleArray([...terms])
      .filter(t => t !== term && t.length > 2)
      .slice(0, 3);
    
    // If we don't have enough incorrect options, add some default ones
    if (incorrectOptions.length < 3) {
      const defaultOptions = [
        "option A", "option B", "option C", "option D", 
        "alternative", "choice", "selection", "possibility"
      ];
      
      const needed = 3 - incorrectOptions.length;
      const additionalOptions = this.shuffleArray(defaultOptions)
        .filter(o => o !== term)
        .slice(0, needed);
      
      incorrectOptions = [...incorrectOptions, ...additionalOptions];
    }
    
    // Create final choices array
    const choices = this.shuffleArray([term, ...incorrectOptions]);
    
    return {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      text: questionText,
      type: 'multiple-choice',
      choices,
      correctAnswer: term,
      sourceFile: sourceFile.toString(),
      difficulty: difficulty === 'mixed' ? 
        (['easy', 'medium', 'hard'] as const)[Math.floor(Math.random() * 3)] : 
        difficulty === 'easy' ? 'easy' : difficulty === 'medium' ? 'medium' : 'hard'
    };
  }

  /**
   * Create a true/false question by potentially modifying a sentence
   */
  private createTrueFalseQuestion(
    sentence: string,
    sourceFile: string | number,
    difficulty: DifficultyLevel
  ): QuizQuestion {
    // For true/false questions, we either keep the sentence as is (true)
    // or modify it slightly to make it false
    const isTrueQuestion = Math.random() > 0.5;
    
    let questionText: string;
    let correctAnswer: string;
    
    if (isTrueQuestion) {
      questionText = sentence;
      correctAnswer = 'True';
    } else {
      // Modify the sentence to make it false
      // For simplicity, we're adding a negation or changing a word
      const doc = nlp(sentence);
      
      if (Math.random() > 0.5 && doc.has('#Verb')) {
        // Negate a verb
        doc.verbs().toNegative();
        questionText = doc.text();
      } else {
        // Replace a noun with a different one
        const nouns = doc.nouns().out('array');
        if (nouns.length > 0) {
          const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
          const replacement = ['thing', 'item', 'object', 'concept', 'idea'][Math.floor(Math.random() * 5)];
          questionText = sentence.replace(randomNoun, replacement);
        } else {
          // If no nouns, just add a negative
          questionText = 'It is not the case that ' + sentence.toLowerCase();
        }
      }
      
      correctAnswer = 'False';
    }
    
    return {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      text: questionText,
      type: 'true-false',
      choices: ['True', 'False'],
      correctAnswer,
      sourceFile: sourceFile.toString(),
      difficulty: difficulty === 'mixed' ? 
        (['easy', 'medium', 'hard'] as const)[Math.floor(Math.random() * 3)] : 
        difficulty === 'easy' ? 'easy' : difficulty === 'medium' ? 'medium' : 'hard'
    };
  }

  /**
   * Create a short answer question from a sentence
   */
  private createShortAnswerQuestion(
    sentence: string,
    terms: string[],
    sourceFile: string | number,
    difficulty: DifficultyLevel
  ): QuizQuestion {
    // Select a term for the question
    const term = this.selectTerm(terms, difficulty);
    
    // Create the question text by converting the sentence to a question about the term
    const doc = nlp(sentence);
    let questionText: string;
    
    // Check if the sentence has the term
    if (sentence.includes(term)) {
      questionText = sentence.replace(term, '_______');
    } else {
      // Fallback question format if term isn't found directly
      questionText = `What is meant by "${term}" in the context of this material?`;
    }
    
    return {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      text: questionText,
      type: 'short-answer',
      correctAnswer: term,
      sourceFile: sourceFile.toString(),
      difficulty: difficulty === 'mixed' ? 
        (['easy', 'medium', 'hard'] as const)[Math.floor(Math.random() * 3)] : 
        difficulty === 'easy' ? 'easy' : difficulty === 'medium' ? 'medium' : 'hard'
    };
  }

  /**
   * Select a term based on difficulty
   */
  private selectTerm(terms: string[], difficulty: DifficultyLevel): string {
    // Filtering out very short terms and articles
    const filteredTerms = terms.filter(term => 
      term.length > 2 && 
      !['the', 'and', 'but', 'for', 'yet', 'nor', 'so', 'as', 'at'].includes(term.toLowerCase())
    );
    
    if (filteredTerms.length === 0) return terms[0] || 'term';
    
    // Select terms based on difficulty
    // For harder difficulty, prefer longer, less common terms
    if (difficulty === 'easy') {
      // Sort by length and pick from the first third (shorter terms)
      filteredTerms.sort((a, b) => a.length - b.length);
      return filteredTerms[Math.floor(Math.random() * Math.floor(filteredTerms.length / 3))] || filteredTerms[0];
    } else if (difficulty === 'hard') {
      // Sort by length and pick from the last third (longer terms)
      filteredTerms.sort((a, b) => b.length - a.length);
      return filteredTerms[Math.floor(Math.random() * Math.floor(filteredTerms.length / 3))] || filteredTerms[0];
    } else {
      // Medium or mixed difficulty - pick randomly
      return filteredTerms[Math.floor(Math.random() * filteredTerms.length)];
    }
  }

  /**
   * Shuffle an array (Fisher-Yates algorithm)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}

export const quizGenerator = new QuizGenerator();