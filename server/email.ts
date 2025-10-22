import nodemailer from "nodemailer";
import type { Application, Job, Test, User } from "@shared/schema";

// Email templates
const EMAIL_TEMPLATES = {
  applicationReceived: (candidate: User, job: Job, recruiterName: string) => ({
    subject: `Application Received: ${job.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thank you for your application!</h2>
        <p>Dear ${candidate.username},</p>
        <p>We have successfully received your application for the <strong>${job.title}</strong> position.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Application Details:</h3>
          <p><strong>Position:</strong> ${job.title}</p>
          <p><strong>Company:</strong> ${recruiterName}</p>
          <p><strong>Experience Level:</strong> ${job.experienceLevel}</p>
          <p><strong>Application Status:</strong> Under Review</p>
        </div>
        <p>We will review your application and get back to you within 3-5 business days.</p>
        <p>Best regards,<br>The ATS Team</p>
      </div>
    `,
  }),

  testInvitation: (candidate: User, job: Job, test: Test, recruiterName: string) => ({
    subject: `Test Invitation: ${job.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">You're invited to take a test!</h2>
        <p>Dear ${candidate.username},</p>
        <p>Great news! Your application for <strong>${job.title}</strong> has passed our initial review.</p>
        <p>You are now invited to take our skills assessment test to proceed to the next stage.</p>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0;">Test Details:</h3>
          <p><strong>Position:</strong> ${job.title}</p>
          <p><strong>Questions:</strong> ${test.questions.length}</p>
          <p><strong>Time Limit:</strong> ${test.timeLimit} minutes</p>
          <p><strong>Status:</strong> Ready to start</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="margin-bottom: 15px;">Click the button below to access your test:</p>
          <a href="${process.env.REPL_ID ? `https://${process.env.REPL_ID}.repl.co/candidate-dashboard` : 'http://localhost:5000/candidate-dashboard'}" 
             style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Take Test Now
          </a>
        </div>
        
        <p><strong>Important:</strong> Please complete the test within 24 hours of receiving this invitation.</p>
        <p>Best regards,<br>${recruiterName}</p>
      </div>
    `,
  }),

  statusUpdate: (candidate: User, job: Job, status: string, recruiterName: string) => ({
    subject: `Application Update: ${job.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Status Update</h2>
        <p>Dear ${candidate.username},</p>
        <p>We wanted to update you on the status of your application for the <strong>${job.title}</strong> position.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3 style="margin-top: 0;">Status Update:</h3>
          <p><strong>Position:</strong> ${job.title}</p>
          <p><strong>Current Status:</strong> ${status.replace("_", " ").toUpperCase()}</p>
          <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        ${getStatusMessage(status)}
        
        <p>You can track your application status anytime by visiting your candidate dashboard.</p>
        <p>Best regards,<br>${recruiterName}</p>
      </div>
    `,
  }),

  recruiterNewApplication: (recruiter: User, candidate: User, job: Job, application: Application) => ({
    subject: `New Application: ${job.title} - ${candidate.username}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">New Application Received</h2>
        <p>Dear ${recruiter.username},</p>
        <p>You have received a new application for your <strong>${job.title}</strong> position.</p>
        
        <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
          <h3 style="margin-top: 0;">Candidate Details:</h3>
          <p><strong>Name:</strong> ${candidate.username}</p>
          <p><strong>Email:</strong> ${candidate.email}</p>
          <p><strong>Position:</strong> ${job.title}</p>
          <p><strong>Applied:</strong> ${new Date().toLocaleDateString()}</p>
          ${application.aiMatchScore ? `<p><strong>AI Match Score:</strong> ${application.aiMatchScore}%</p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.REPL_ID ? `https://${process.env.REPL_ID}.repl.co/recruiter-dashboard` : 'http://localhost:5000/recruiter-dashboard'}" 
             style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Application
          </a>
        </div>
        
        <p>Best regards,<br>The ATS Team</p>
      </div>
    `,
  }),

  highMatchJobAlert: (candidate: User, job: Job, matchScore: number, recruiterName: string) => ({
    subject: `Perfect Job Match Alert: ${job.title} (${matchScore}% Match!)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">🎯 Perfect Job Match Found!</h2>
        <p>Dear ${candidate.username},</p>
        <p>Great news! We found a job that's a <strong style="color: #16a34a;">${matchScore}% match</strong> for your profile!</p>
        
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h3 style="margin-top: 0; color: #16a34a;">Job Details:</h3>
          <p><strong>Position:</strong> ${job.title}</p>
          <p><strong>Company:</strong> ${recruiterName}</p>
          <p><strong>Experience Level:</strong> ${job.experienceLevel}</p>
          <p><strong>Location:</strong> ${job.location}</p>
          <p><strong>AI Match Score:</strong> <span style="color: #16a34a; font-weight: bold;">${matchScore}%</span></p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;"><strong>Why this is a great match:</strong></p>
          <p style="margin: 5px 0 0 0; color: #92400e;">Your skills and experience align perfectly with this role's requirements!</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="margin-bottom: 15px;">Don't miss this opportunity - apply now!</p>
          <a href="${process.env.REPL_ID ? `https://${process.env.REPL_ID}.repl.co/candidate-dashboard` : 'http://localhost:5000/candidate-dashboard'}" 
             style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
            View Job & Apply
          </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          <strong>Pro Tip:</strong> High-match jobs like this are rare! We recommend applying quickly as these positions often fill fast.
        </p>
        
        <p>Best regards,<br>The ATS AI Team</p>
      </div>
    `,
  }),
};

function getStatusMessage(status: string): string {
  switch (status) {
    case "pending":
      return "<p>Your application is currently being reviewed by our team.</p>";
    case "ai_screened":
      return "<p>Your application has passed our initial AI screening. A human recruiter will review it shortly.</p>";
    case "test_invited":
      return "<p>Congratulations! You've been invited to take our skills assessment test. Please check your candidate dashboard to begin.</p>";
    case "in_review":
      return "<p>Your test has been completed and your application is now under final review.</p>";
    case "interviewing":
      return "<p>Great news! You've advanced to the interview stage. We'll contact you soon to schedule.</p>";
    case "hired":
      return "<p>🎉 Congratulations! We're excited to offer you the position. Our HR team will contact you with details.</p>";
    case "rejected":
      return "<p>Thank you for your interest. While we won't be moving forward with your application at this time, we encourage you to apply for future positions.</p>";
    default:
      return "<p>Your application status has been updated.</p>";
  }
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Check if SMTP credentials are provided
      const hasSmtpCredentials = process.env.SMTP_USER && process.env.SMTP_PASSWORD;
      
      if (hasSmtpCredentials) {
        // Use production SMTP configuration with provided credentials
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });
        
        console.log("📧 Email service initialized with SMTP:", process.env.SMTP_USER);
      } else if (process.env.NODE_ENV !== "production") {
        // For development without credentials, use Ethereal email (test email service)
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        
        console.log("📧 Email service initialized with Ethereal (development mode)");
        console.log(`📧 Preview URLs will be logged to console`);
      } else {
        // Production mode but no credentials - log warning and continue
        console.warn("⚠️  SMTP credentials not configured. Email notifications will be disabled.");
        console.warn("⚠️  Set SMTP_USER and SMTP_PASSWORD environment variables to enable emails.");
        this.transporter = null;
      }
      
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize email service:", error);
      // Continue without email service
    }
  }

  async sendEmail(to: string, template: { subject: string; html: string }) {
    if (!this.transporter) {
      console.log(`📧 Email would be sent to ${to}: ${template.subject}`);
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"ATS System" <noreply@ats.com>',
        to,
        subject: template.subject,
        html: template.html,
      });

      if (process.env.NODE_ENV !== "production") {
        console.log(`📧 Email sent to ${to}: ${template.subject}`);
        console.log(`📧 Preview: ${nodemailer.getTestMessageUrl(info)}`);
      } else {
        console.log(`📧 Email sent to ${to}: ${template.subject}`);
      }

      return info;
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  }

  // Notification methods
  async notifyApplicationReceived(candidate: User, job: Job, recruiterName: string) {
    const template = EMAIL_TEMPLATES.applicationReceived(candidate, job, recruiterName);
    await this.sendEmail(candidate.email, template);
  }

  async notifyTestInvitation(candidate: User, job: Job, test: Test, recruiterName: string) {
    const template = EMAIL_TEMPLATES.testInvitation(candidate, job, test, recruiterName);
    await this.sendEmail(candidate.email, template);
  }

  async notifyStatusUpdate(candidate: User, job: Job, status: string, recruiterName: string) {
    const template = EMAIL_TEMPLATES.statusUpdate(candidate, job, status, recruiterName);
    await this.sendEmail(candidate.email, template);
  }

  async notifyRecruiterNewApplication(recruiter: User, candidate: User, job: Job, application: Application) {
    const template = EMAIL_TEMPLATES.recruiterNewApplication(recruiter, candidate, job, application);
    await this.sendEmail(recruiter.email, template);
  }

  async notifyHighMatchJob(candidate: User, job: Job, matchScore: number, recruiterName: string) {
    const template = EMAIL_TEMPLATES.highMatchJobAlert(candidate, job, matchScore, recruiterName);
    await this.sendEmail(candidate.email, template);
  }
}

// Export singleton instance
export const emailService = new EmailService();