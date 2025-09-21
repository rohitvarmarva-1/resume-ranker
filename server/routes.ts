import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertJobSchema, 
  insertResumeSchema, 
  insertApplicationSchema,
  insertTestResultSchema,
  type Job,
  type Application,
  type Test,
} from "@shared/schema";
import { 
  calculateJobMatch, 
  extractResumeSkills, 
  generateTestQuestions, 
  evaluateTestAnswers 
} from "./openai";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOC, and DOCX files are allowed."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Job routes
  app.post("/api/jobs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "recruiter") return res.sendStatus(403);

    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData, req.user.id);
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ error: "Invalid job data" });
    }
  });

  app.get("/api/jobs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      if (req.user?.role === "recruiter") {
        const jobs = await storage.getJobsByRecruiter(req.user.id);
        res.json(jobs);
      } else {
        const jobs = await storage.getActiveJobs();
        res.json(jobs);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const job = await storage.getJob(req.params.id);
      if (!job) return res.sendStatus(404);
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  // Resume routes
  app.post("/api/resumes", upload.single("resume"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "candidate") return res.sendStatus(403);
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
      // In a real implementation, you'd extract text from the PDF/DOC file
      // For now, we'll simulate extracted text
      const simulatedResumeText = `
        Professional software developer with ${Math.floor(Math.random() * 10) + 1} years of experience.
        Skills include: React, JavaScript, TypeScript, Node.js, Python, SQL, Git.
        Experience in frontend and backend development, agile methodologies, and team collaboration.
      `;

      const extractedData = await extractResumeSkills(simulatedResumeText);

      const resumeData = {
        fileName: req.file.originalname,
        filePath: req.file.path,
        extractedSkills: extractedData.skills,
        experienceYears: extractedData.experienceYears,
        summary: extractedData.summary,
      };

      const resume = await storage.createResume(resumeData, req.user.id);
      res.status(201).json(resume);
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Failed to process resume" });
    }
  });

  app.get("/api/resumes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "candidate") return res.sendStatus(403);

    try {
      const resumes = await storage.getResumesByCandidate(req.user.id);
      res.json(resumes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch resumes" });
    }
  });

  // Application routes
  app.post("/api/applications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "candidate") return res.sendStatus(403);

    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(applicationData, req.user.id);

      // Calculate AI match score
      const job = await storage.getJob(applicationData.jobId);
      const resume = await storage.getResume(applicationData.resumeId);

      if (job && resume && job.aiMatchingEnabled) {
        try {
          const matchResult = await calculateJobMatch(
            resume.summary || "",
            job.description,
            job.requiredSkills
          );

          await storage.updateApplication(application.id, {
            aiMatchScore: matchResult.matchScore,
          });

          // Generate test if enabled
          if (job.aiTestEnabled) {
            const questions = await generateTestQuestions(
              job.title,
              job.requiredSkills,
              job.experienceLevel,
              15
            );

            await storage.createTest({
              jobId: job.id,
              candidateId: req.user.id,
              applicationId: application.id,
              questions,
              timeLimit: 60,
            });

            await storage.updateApplication(application.id, {
              status: "test_invited",
            });
          }
        } catch (aiError) {
          console.error("AI processing failed:", aiError);
          // Continue without AI features
        }
      }

      const updatedApplication = await storage.getApplication(application.id);
      res.status(201).json(updatedApplication);
    } catch (error) {
      res.status(400).json({ error: "Invalid application data" });
    }
  });

  app.get("/api/applications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      let applications: Application[];
      if (req.user?.role === "recruiter") {
        // Get applications for recruiter's jobs
        const jobs = await storage.getJobsByRecruiter(req.user.id);
        const allApplications = await Promise.all(
          jobs.map(job => storage.getApplicationsByJob(job.id))
        );
        applications = allApplications.flat();
      } else {
        applications = await storage.getApplicationsByCandidate(req.user.id);
      }

      // Enrich with job and user data
      const enrichedApplications = await Promise.all(
        applications.map(async (app) => {
          const job = await storage.getJob(app.jobId);
          const candidate = await storage.getUser(app.candidateId);
          return { ...app, job, candidate };
        })
      );

      res.json(enrichedApplications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Test routes
  app.get("/api/tests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "candidate") return res.sendStatus(403);

    try {
      const tests = await storage.getTestsByCandidate(req.user.id);
      
      // Enrich with job data
      const enrichedTests = await Promise.all(
        tests.map(async (test) => {
          const job = await storage.getJob(test.jobId);
          return { ...test, job };
        })
      );

      res.json(enrichedTests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tests" });
    }
  });

  app.get("/api/tests/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "candidate") return res.sendStatus(403);

    try {
      const test = await storage.getTest(req.params.id);
      if (!test) return res.sendStatus(404);
      if (test.candidateId !== req.user.id) return res.sendStatus(403);

      // Update test status to in_progress if it's pending
      if (test.status === "pending") {
        await storage.updateTest(test.id, { status: "in_progress" });
      }

      res.json(test);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test" });
    }
  });

  app.post("/api/tests/:id/submit", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "candidate") return res.sendStatus(403);

    try {
      const test = await storage.getTest(req.params.id);
      if (!test) return res.sendStatus(404);
      if (test.candidateId !== req.user.id) return res.sendStatus(403);

      const resultData = insertTestResultSchema.parse(req.body);

      // Evaluate answers
      const evaluation = await evaluateTestAnswers(test.questions, resultData.answers);

      const testResult = await storage.createTestResult({
        ...resultData,
        testId: test.id,
        score: evaluation.score,
      });

      // Update test status
      await storage.updateTest(test.id, { status: "completed" });

      // Update application status
      await storage.updateApplication(test.applicationId, { status: "in_review" });

      res.json({ ...testResult, feedback: evaluation.feedback });
    } catch (error) {
      res.status(400).json({ error: "Failed to submit test" });
    }
  });

  // Dashboard stats routes
  app.get("/api/stats/recruiter", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "recruiter") return res.sendStatus(403);

    try {
      const jobs = await storage.getJobsByRecruiter(req.user.id);
      const activeJobs = jobs.filter(job => job.isActive).length;
      
      const allApplications = await Promise.all(
        jobs.map(job => storage.getApplicationsByJob(job.id))
      );
      const applications = allApplications.flat();
      
      const matches = applications.filter(app => app.aiMatchScore && app.aiMatchScore >= 80).length;
      const testsCompleted = applications.filter(app => app.status === "in_review" || app.status === "interviewing").length;

      res.json({
        activeJobs,
        applications: applications.length,
        matches,
        tests: testsCompleted,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/stats/candidate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "candidate") return res.sendStatus(403);

    try {
      const applications = await storage.getApplicationsByCandidate(req.user.id);
      const tests = await storage.getTestsByCandidate(req.user.id);
      
      const matches = applications.filter(app => app.aiMatchScore && app.aiMatchScore >= 80).length;
      const pendingTests = tests.filter(test => test.status === "pending").length;
      
      // Simulate profile views
      const profileViews = Math.floor(Math.random() * 100) + 20;

      res.json({
        applications: applications.length,
        matches,
        pendingTests,
        profileViews,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
