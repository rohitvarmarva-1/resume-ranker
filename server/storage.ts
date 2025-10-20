import {
  type User,
  type InsertUser,
  type Job,
  type InsertJob,
  type Resume,
  type InsertResume,
  type Application,
  type InsertApplication,
  type Test,
  type InsertTest,
  type TestResult,
  type InsertTestResult,
  users,
  jobs,
  resumes,
  applications,
  tests,
  testResults,
} from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import createPgStore from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllCandidates(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Job methods
  createJob(job: InsertJob, recruiterId: string): Promise<Job>;
  getJobsByRecruiter(recruiterId: string): Promise<Job[]>;
  getActiveJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined>;
  
  // Resume methods
  createResume(resume: InsertResume, candidateId: string): Promise<Resume>;
  getResumesByCandidate(candidateId: string): Promise<Resume[]>;
  getResume(id: string): Promise<Resume | undefined>;
  
  // Application methods
  createApplication(application: InsertApplication, candidateId: string): Promise<Application>;
  getApplicationsByJob(jobId: string): Promise<Application[]>;
  getApplicationsByCandidate(candidateId: string): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  updateApplication(id: string, updates: Partial<Application>): Promise<Application | undefined>;
  
  // Test methods
  createTest(test: InsertTest): Promise<Test>;
  getTestsByCandidate(candidateId: string): Promise<Test[]>;
  getTest(id: string): Promise<Test | undefined>;
  updateTest(id: string, updates: Partial<Test>): Promise<Test | undefined>;
  
  // Test result methods
  createTestResult(result: InsertTestResult): Promise<TestResult>;
  getTestResult(testId: string): Promise<TestResult | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private jobs: Map<string, Job>;
  private resumes: Map<string, Resume>;
  private applications: Map<string, Application>;
  private tests: Map<string, Test>;
  private testResults: Map<string, TestResult>;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.resumes = new Map();
    this.applications = new Map();
    this.tests = new Map();
    this.testResults = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getAllCandidates(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === "candidate",
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      role: insertUser.role as "recruiter" | "candidate"
    };
    this.users.set(id, user);
    return user;
  }

  // Job methods
  async createJob(insertJob: InsertJob, recruiterId: string): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      ...insertJob,
      id,
      recruiterId,
      isActive: true,
      createdAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async getJobsByRecruiter(recruiterId: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      (job) => job.recruiterId === recruiterId,
    );
  }

  async getActiveJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(
      (job) => job.isActive,
    );
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  // Resume methods
  async createResume(insertResume: InsertResume, candidateId: string): Promise<Resume> {
    const id = randomUUID();
    const resume: Resume = {
      ...insertResume,
      id,
      candidateId,
      createdAt: new Date(),
      summary: insertResume.summary || null,
    };
    this.resumes.set(id, resume);
    return resume;
  }

  async getResumesByCandidate(candidateId: string): Promise<Resume[]> {
    return Array.from(this.resumes.values()).filter(
      (resume) => resume.candidateId === candidateId,
    );
  }

  async getResume(id: string): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  // Application methods
  async createApplication(insertApplication: InsertApplication, candidateId: string): Promise<Application> {
    const id = randomUUID();
    const application: Application = {
      ...insertApplication,
      id,
      candidateId,
      status: "applied" as const,
      createdAt: new Date(),
      aiMatchScore: insertApplication.aiMatchScore || null,
      coverLetter: insertApplication.coverLetter || null,
    };
    this.applications.set(id, application);
    return application;
  }

  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (app) => app.jobId === jobId,
    );
  }

  async getApplicationsByCandidate(candidateId: string): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (app) => app.candidateId === candidateId,
    );
  }

  async getApplication(id: string): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...updates };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Test methods
  async createTest(insertTest: InsertTest): Promise<Test> {
    const id = randomUUID();
    const test: Test = {
      ...insertTest,
      id,
      status: "pending" as const,
      createdAt: new Date(),
    };
    this.tests.set(id, test);
    return test;
  }

  async getTestsByCandidate(candidateId: string): Promise<Test[]> {
    return Array.from(this.tests.values()).filter(
      (test) => test.candidateId === candidateId,
    );
  }

  async getTest(id: string): Promise<Test | undefined> {
    return this.tests.get(id);
  }

  async updateTest(id: string, updates: Partial<Test>): Promise<Test | undefined> {
    const test = this.tests.get(id);
    if (!test) return undefined;
    
    const updatedTest = { ...test, ...updates };
    this.tests.set(id, updatedTest);
    return updatedTest;
  }

  // Test result methods
  async createTestResult(insertResult: InsertTestResult): Promise<TestResult> {
    const id = randomUUID();
    const result: TestResult = {
      ...insertResult,
      id,
      completedAt: new Date(),
      score: insertResult.score || null,
      timeSpent: insertResult.timeSpent || null,
      flaggedQuestions: insertResult.flaggedQuestions || [],
    };
    this.testResults.set(id, result);
    return result;
  }

  async getTestResult(testId: string): Promise<TestResult | undefined> {
    return Array.from(this.testResults.values()).find(
      (result) => result.testId === testId,
    );
  }
}

const PgSession = createPgStore(session);

export class DrizzleStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  private pool: Pool;
  public sessionStore: session.Store;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    this.db = drizzle(this.pool);
    this.sessionStore = new PgSession({
      pool: this.pool,
      tableName: 'session',
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  async getAllCandidates(): Promise<User[]> {
    try {
      const result = await this.db.select().from(users).where(eq(users.role, 'candidate'));
      return result;
    } catch (error) {
      console.error('Error getting all candidates:', error);
      throw new Error('Failed to retrieve candidates');
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await this.db.insert(users).values({
        username: insertUser.username,
        email: insertUser.email,
        password: insertUser.password,
        role: insertUser.role,
      }).returning();
      return result[0];
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.code === '23505') { // Unique constraint violation
        if (error.constraint?.includes('username')) {
          throw new Error('Username already exists');
        }
        if (error.constraint?.includes('email')) {
          throw new Error('Email already exists');
        }
      }
      throw new Error('Failed to create user');
    }
  }

  // Job methods
  async createJob(insertJob: InsertJob, recruiterId: string): Promise<Job> {
    try {
      const result = await this.db.insert(jobs).values({
        title: insertJob.title,
        description: insertJob.description,
        department: insertJob.department,
        experienceLevel: insertJob.experienceLevel,
        employmentType: insertJob.employmentType,
        requiredSkills: insertJob.requiredSkills,
        salaryMin: insertJob.salaryMin,
        salaryMax: insertJob.salaryMax,
        location: insertJob.location,
        recruiterId: recruiterId,
        isActive: insertJob.isActive,
        aiMatchingEnabled: insertJob.aiMatchingEnabled,
        aiTestEnabled: insertJob.aiTestEnabled,
        emailNotificationsEnabled: insertJob.emailNotificationsEnabled,
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating job:', error);
      throw new Error('Failed to create job');
    }
  }

  async getJobsByRecruiter(recruiterId: string): Promise<Job[]> {
    return await this.db.select().from(jobs).where(eq(jobs.recruiterId, recruiterId));
  }

  async getActiveJobs(): Promise<Job[]> {
    return await this.db.select().from(jobs).where(eq(jobs.isActive, true));
  }

  async getJob(id: string): Promise<Job | undefined> {
    const result = await this.db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    return result[0];
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    try {
      // Whitelist updatable fields to prevent accidental modification of immutable columns
      const allowedUpdates: Partial<Job> = {};
      const updatableFields = ['title', 'description', 'department', 'experienceLevel', 'employmentType', 'requiredSkills', 'salaryMin', 'salaryMax', 'location', 'isActive', 'aiMatchingEnabled', 'aiTestEnabled', 'emailNotificationsEnabled'];
      
      for (const field of updatableFields) {
        if (field in updates) {
          (allowedUpdates as any)[field] = (updates as any)[field];
        }
      }
      
      const result = await this.db.update(jobs).set(allowedUpdates).where(eq(jobs.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error updating job:', error);
      throw new Error('Failed to update job');
    }
  }

  // Resume methods
  async createResume(insertResume: InsertResume, candidateId: string): Promise<Resume> {
    try {
      // Validate that extractedSkills is an array
      const skills = Array.isArray(insertResume.extractedSkills) ? insertResume.extractedSkills : [];
      
      const result = await this.db.insert(resumes).values({
        fileName: insertResume.fileName,
        filePath: insertResume.filePath,
        extractedSkills: skills,
        experienceYears: insertResume.experienceYears,
        summary: insertResume.summary,
        candidateId: candidateId,
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating resume:', error);
      throw new Error('Failed to create resume');
    }
  }

  async getResumesByCandidate(candidateId: string): Promise<Resume[]> {
    return await this.db.select().from(resumes).where(eq(resumes.candidateId, candidateId));
  }

  async getResume(id: string): Promise<Resume | undefined> {
    const result = await this.db.select().from(resumes).where(eq(resumes.id, id)).limit(1);
    return result[0];
  }

  // Application methods
  async createApplication(insertApplication: InsertApplication, candidateId: string): Promise<Application> {
    try {
      const result = await this.db.insert(applications).values({
        jobId: insertApplication.jobId,
        resumeId: insertApplication.resumeId,
        status: insertApplication.status,
        aiMatchScore: insertApplication.aiMatchScore,
        coverLetter: insertApplication.coverLetter,
        candidateId: candidateId,
      }).returning();
      return result[0];
    } catch (error: any) {
      console.error('Error creating application:', error);
      if (error.code === '23503') { // Foreign key violation
        throw new Error('Invalid job or resume reference');
      }
      throw new Error('Failed to create application');
    }
  }

  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    return await this.db.select().from(applications).where(eq(applications.jobId, jobId));
  }

  async getApplicationsByCandidate(candidateId: string): Promise<Application[]> {
    return await this.db.select().from(applications).where(eq(applications.candidateId, candidateId));
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const result = await this.db.select().from(applications).where(eq(applications.id, id)).limit(1);
    return result[0];
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application | undefined> {
    try {
      // Whitelist updatable fields
      const allowedUpdates: Partial<Application> = {};
      const updatableFields = ['status', 'aiMatchScore', 'coverLetter'];
      
      for (const field of updatableFields) {
        if (field in updates) {
          (allowedUpdates as any)[field] = (updates as any)[field];
        }
      }
      
      const result = await this.db.update(applications).set(allowedUpdates).where(eq(applications.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error updating application:', error);
      throw new Error('Failed to update application');
    }
  }

  // Test methods
  async createTest(insertTest: InsertTest): Promise<Test> {
    const result = await this.db.insert(tests).values({
      jobId: insertTest.jobId,
      candidateId: insertTest.candidateId,
      applicationId: insertTest.applicationId,
      questions: insertTest.questions,
      timeLimit: insertTest.timeLimit,
      status: insertTest.status,
    }).returning();
    return result[0];
  }

  async getTestsByCandidate(candidateId: string): Promise<Test[]> {
    return await this.db.select().from(tests).where(eq(tests.candidateId, candidateId));
  }

  async getTest(id: string): Promise<Test | undefined> {
    const result = await this.db.select().from(tests).where(eq(tests.id, id)).limit(1);
    return result[0];
  }

  async updateTest(id: string, updates: Partial<Test>): Promise<Test | undefined> {
    try {
      // Whitelist updatable fields
      const allowedUpdates: Partial<Test> = {};
      const updatableFields = ['status', 'timeLimit', 'questions'];
      
      for (const field of updatableFields) {
        if (field in updates) {
          (allowedUpdates as any)[field] = (updates as any)[field];
        }
      }
      
      const result = await this.db.update(tests).set(allowedUpdates).where(eq(tests.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error updating test:', error);
      throw new Error('Failed to update test');
    }
  }

  // Test result methods
  async createTestResult(insertResult: InsertTestResult): Promise<TestResult> {
    const result = await this.db.insert(testResults).values({
      testId: insertResult.testId,
      answers: insertResult.answers,
      score: insertResult.score,
      timeSpent: insertResult.timeSpent,
      flaggedQuestions: insertResult.flaggedQuestions || [],
    }).returning();
    return result[0];
  }

  async getTestResult(testId: string): Promise<TestResult | undefined> {
    const result = await this.db.select().from(testResults).where(eq(testResults.testId, testId)).limit(1);
    return result[0];
  }
}

import { MongoStorage } from "./mongo-storage";

// Use MongoDB if MONGODB_URI is set, otherwise use PostgreSQL/Drizzle
export const storage = process.env.MONGODB_URI
  ? new MongoStorage()
  : new DrizzleStorage();
