import mongoose from "mongoose";
import session from "express-session";
import createMemoryStore from "memorystore";
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
import { type IStorage } from "./storage";

const MemoryStore = createMemoryStore(session);

// Mongoose Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["recruiter", "candidate"], required: true },
  createdAt: { type: Date, default: Date.now },
});

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: String, required: true },
  experienceLevel: { type: String, required: true },
  employmentType: { type: String, required: true },
  requiredSkills: [{ type: String }],
  salaryMin: { type: Number, default: null },
  salaryMax: { type: Number, default: null },
  location: { type: String, required: true },
  recruiterId: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  aiMatchingEnabled: { type: Boolean, default: true },
  aiTestEnabled: { type: Boolean, default: false },
  emailNotificationsEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const ResumeSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  extractedSkills: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
  summary: { type: String, default: null },
  candidateId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: String, required: true },
  candidateId: { type: String, required: true },
  resumeId: { type: String, required: true },
  status: {
    type: String,
    enum: ["applied", "reviewing", "interview", "rejected", "accepted"],
    default: "applied",
  },
  aiMatchScore: { type: Number, default: null },
  coverLetter: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

const TestSchema = new mongoose.Schema({
  jobId: { type: String, required: true },
  candidateId: { type: String, required: true },
  applicationId: { type: String, required: true },
  questions: { type: mongoose.Schema.Types.Mixed, required: true },
  timeLimit: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const TestResultSchema = new mongoose.Schema({
  testId: { type: String, required: true },
  answers: { type: mongoose.Schema.Types.Mixed, required: true },
  score: { type: Number, default: null },
  timeSpent: { type: Number, default: null },
  flaggedQuestions: [{ type: Number }],
  completedAt: { type: Date, default: Date.now },
});

// Mongoose Models
const UserModel = mongoose.model("User", UserSchema);
const JobModel = mongoose.model("Job", JobSchema);
const ResumeModel = mongoose.model("Resume", ResumeSchema);
const ApplicationModel = mongoose.model("Application", ApplicationSchema);
const TestModel = mongoose.model("Test", TestSchema);
const TestResultModel = mongoose.model("TestResult", TestResultSchema);

export class MongoStorage implements IStorage {
  public sessionStore: session.Store;
  private connected: boolean = false;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.connect();
  }

  private async connect() {
    if (this.connected) return;

    try {
      const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/ats";
      await mongoose.connect(mongoUri);
      this.connected = true;
      console.log("✅ MongoDB connected successfully");
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error);
      throw new Error("Failed to connect to MongoDB");
    }
  }

  // Helper to convert MongoDB document to our types
  private toPlainObject(doc: any): any {
    if (!doc) return undefined;
    const obj = doc.toObject ? doc.toObject() : doc;
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    return obj;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    return user ? this.toPlainObject(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username });
    return user ? this.toPlainObject(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    return user ? this.toPlainObject(user) : undefined;
  }

  async getAllCandidates(): Promise<User[]> {
    const candidates = await UserModel.find({ role: "candidate" });
    return candidates.map((c) => this.toPlainObject(c));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const user = new UserModel(insertUser);
      const savedUser = await user.save();
      return this.toPlainObject(savedUser);
    } catch (error: any) {
      if (error.code === 11000) {
        if (error.keyPattern?.username) {
          throw new Error("Username already exists");
        }
        if (error.keyPattern?.email) {
          throw new Error("Email already exists");
        }
      }
      throw new Error("Failed to create user");
    }
  }

  // Job methods
  async createJob(insertJob: InsertJob, recruiterId: string): Promise<Job> {
    const job = new JobModel({ ...insertJob, recruiterId });
    const savedJob = await job.save();
    return this.toPlainObject(savedJob);
  }

  async getJobsByRecruiter(recruiterId: string): Promise<Job[]> {
    const jobs = await JobModel.find({ recruiterId });
    return jobs.map((j) => this.toPlainObject(j));
  }

  async getActiveJobs(): Promise<Job[]> {
    const jobs = await JobModel.find({ isActive: true });
    return jobs.map((j) => this.toPlainObject(j));
  }

  async getJob(id: string): Promise<Job | undefined> {
    const job = await JobModel.findById(id);
    return job ? this.toPlainObject(job) : undefined;
  }

  async updateJob(
    id: string,
    updates: Partial<Job>
  ): Promise<Job | undefined> {
    const job = await JobModel.findByIdAndUpdate(id, updates, { new: true });
    return job ? this.toPlainObject(job) : undefined;
  }

  // Resume methods
  async createResume(
    insertResume: InsertResume,
    candidateId: string
  ): Promise<Resume> {
    const resume = new ResumeModel({ ...insertResume, candidateId });
    const savedResume = await resume.save();
    return this.toPlainObject(savedResume);
  }

  async getResumesByCandidate(candidateId: string): Promise<Resume[]> {
    const resumes = await ResumeModel.find({ candidateId });
    return resumes.map((r) => this.toPlainObject(r));
  }

  async getResume(id: string): Promise<Resume | undefined> {
    const resume = await ResumeModel.findById(id);
    return resume ? this.toPlainObject(resume) : undefined;
  }

  // Application methods
  async createApplication(
    insertApplication: InsertApplication,
    candidateId: string
  ): Promise<Application> {
    const application = new ApplicationModel({
      ...insertApplication,
      candidateId,
    });
    const savedApplication = await application.save();
    return this.toPlainObject(savedApplication);
  }

  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    const applications = await ApplicationModel.find({ jobId });
    return applications.map((a) => this.toPlainObject(a));
  }

  async getApplicationsByCandidate(candidateId: string): Promise<Application[]> {
    const applications = await ApplicationModel.find({ candidateId });
    return applications.map((a) => this.toPlainObject(a));
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const application = await ApplicationModel.findById(id);
    return application ? this.toPlainObject(application) : undefined;
  }

  async updateApplication(
    id: string,
    updates: Partial<Application>
  ): Promise<Application | undefined> {
    const application = await ApplicationModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return application ? this.toPlainObject(application) : undefined;
  }

  // Test methods
  async createTest(insertTest: InsertTest): Promise<Test> {
    const test = new TestModel(insertTest);
    const savedTest = await test.save();
    return this.toPlainObject(savedTest);
  }

  async getTestsByCandidate(candidateId: string): Promise<Test[]> {
    const tests = await TestModel.find({ candidateId });
    return tests.map((t) => this.toPlainObject(t));
  }

  async getTest(id: string): Promise<Test | undefined> {
    const test = await TestModel.findById(id);
    return test ? this.toPlainObject(test) : undefined;
  }

  async updateTest(id: string, updates: Partial<Test>): Promise<Test | undefined> {
    const test = await TestModel.findByIdAndUpdate(id, updates, { new: true });
    return test ? this.toPlainObject(test) : undefined;
  }

  // Test result methods
  async createTestResult(insertResult: InsertTestResult): Promise<TestResult> {
    const result = new TestResultModel(insertResult);
    const savedResult = await result.save();
    return this.toPlainObject(savedResult);
  }

  async getTestResult(testId: string): Promise<TestResult | undefined> {
    const result = await TestResultModel.findOne({ testId });
    return result ? this.toPlainObject(result) : undefined;
  }
}
