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
} from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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

export const storage = new MemStorage();
