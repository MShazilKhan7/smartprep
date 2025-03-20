import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Files table to store uploaded files
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  originalName: text("original_name").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(), // pdf, image, video
  path: text("path").notNull(),
  processedContent: text("processed_content"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Define a Quizzes table
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // multiple-choice, true-false, short-answer, mixed
  difficulty: text("difficulty").notNull(), // easy, medium, hard, mixed
  includeAnswerKey: boolean("include_answer_key").notNull().default(true),
  numberOfQuestions: integer("number_of_questions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define a Questions table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  text: text("text").notNull(),
  type: text("type").notNull(), // multiple-choice, true-false, short-answer
  choices: jsonb("choices"), // For multiple-choice questions
  correctAnswer: text("correct_answer").notNull(),
  sourceFileId: integer("source_file_id"),
  difficulty: text("difficulty").notNull(), // easy, medium, hard
});

// Create insert schemas using drizzle-zod
export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadedAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

// Define insert types
export type InsertFile = z.infer<typeof insertFileSchema>;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

// Define select types
export type File = typeof files.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type Question = typeof questions.$inferSelect;
