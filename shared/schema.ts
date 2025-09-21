import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().$type<"recruiter" | "candidate">(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  department: text("department").notNull(),
  experienceLevel: text("experience_level").notNull(),
  employmentType: text("employment_type").notNull(),
  requiredSkills: jsonb("required_skills").$type<string[]>().notNull(),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  location: text("location").notNull(),
  recruiterId: varchar("recruiter_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  aiMatchingEnabled: boolean("ai_matching_enabled").default(true),
  aiTestEnabled: boolean("ai_test_enabled").default(true),
  emailNotificationsEnabled: boolean("email_notifications_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateId: varchar("candidate_id").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  extractedSkills: jsonb("extracted_skills").$type<string[]>().notNull(),
  experienceYears: integer("experience_years"),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id).notNull(),
  candidateId: varchar("candidate_id").references(() => users.id).notNull(),
  resumeId: varchar("resume_id").references(() => resumes.id).notNull(),
  status: text("status").notNull().$type<"applied" | "in_review" | "test_invited" | "interviewing" | "rejected" | "hired">().default("applied"),
  aiMatchScore: integer("ai_match_score"),
  coverLetter: text("cover_letter"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tests = pgTable("tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id).notNull(),
  candidateId: varchar("candidate_id").references(() => users.id).notNull(),
  applicationId: varchar("application_id").references(() => applications.id).notNull(),
  questions: jsonb("questions").$type<Array<{
    id: string;
    question: string;
    type: "multiple_choice" | "code" | "essay";
    options?: string[];
    correctAnswer?: string;
    codeExample?: string;
  }>>().notNull(),
  timeLimit: integer("time_limit").notNull(), // in minutes
  status: text("status").notNull().$type<"pending" | "in_progress" | "completed" | "expired">().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const testResults = pgTable("test_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testId: varchar("test_id").references(() => tests.id).notNull(),
  answers: jsonb("answers").$type<Record<string, string>>().notNull(),
  score: integer("score"),
  completedAt: timestamp("completed_at").defaultNow(),
  timeSpent: integer("time_spent"), // in minutes
  flaggedQuestions: jsonb("flagged_questions").$type<string[]>().default([]),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  recruiterId: true,
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
  candidateId: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  candidateId: true,
});

export const insertTestSchema = createInsertSchema(tests).omit({
  id: true,
  createdAt: true,
});

export const insertTestResultSchema = createInsertSchema(testResults).omit({
  id: true,
  completedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;
export type Test = typeof tests.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type TestResult = typeof testResults.$inferSelect;
