# Overview

This is an AI-powered Applicant Tracking System (ATS) built as a full-stack web application. The system provides intelligent job matching, automated resume screening, and AI-generated assessments for recruiters and job candidates. It features role-based authentication, allowing recruiters to post jobs and manage applications while enabling candidates to upload resumes and take AI-generated tests.

## Recent Updates (October 2025)

- **Email Notifications**: System now sends email notifications to ALL candidates when new jobs are posted, including their match percentages
- **Docker Support**: Fully containerized application with Docker and docker-compose configurations
- **MongoDB Integration**: Added MongoDB Atlas support with complete storage implementation
- **Production Ready**: Configured for deployment with environment variable support for all services

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy and session-based auth
- **File Upload**: Multer for handling resume uploads (PDF, DOC, DOCX)
- **API Design**: RESTful endpoints with proper error handling and middleware
- **Session Storage**: PostgreSQL-backed session store with connect-pg-simple

## Data Storage Solutions
- **Primary Database**: MongoDB Atlas (cloud-hosted) or PostgreSQL with Neon
- **Database Driver**: Mongoose for MongoDB, Drizzle ORM for PostgreSQL
- **Automatic Selection**: System auto-detects database based on MONGODB_URI environment variable
- **Schema Management**: Mongoose schemas for MongoDB, Drizzle Kit for PostgreSQL
- **In-Memory Storage**: Fallback memory store for development/testing

## Authentication and Authorization
- **Strategy**: Session-based authentication using Passport.js
- **Password Security**: Scrypt hashing with salt for secure password storage
- **Role-Based Access**: Two user roles (recruiter/candidate) with different permissions
- **Protected Routes**: Client-side route protection with loading states
- **Session Management**: Secure session handling with PostgreSQL persistence

## AI Integration Architecture
- **OpenAI Integration**: GPT-4 for resume analysis, job matching, and test generation
- **Resume Processing**: AI-powered skill extraction and experience analysis
- **Job Matching**: Intelligent scoring algorithm based on skills and requirements
- **Test Generation**: Dynamic question creation based on job requirements
- **Evaluation System**: Automated test scoring and candidate assessment

## External Dependencies

### Core Framework Dependencies
- **React**: Frontend framework with TypeScript support
- **Express.js**: Backend web framework
- **PostgreSQL**: Primary database via Neon serverless
- **Drizzle ORM**: Database ORM and query builder

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless component primitives
- **Shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library

### Authentication and Security
- **Passport.js**: Authentication middleware
- **Express Session**: Session management
- **Connect PG Simple**: PostgreSQL session store

### AI and Processing
- **OpenAI**: AI model integration for resume processing and test generation
- **Multer**: File upload handling middleware

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **Zod**: Runtime type validation
- **TanStack Query**: Server state management
- **React Hook Form**: Form handling and validation

### Deployment and Hosting
- **Docker**: Containerized deployment with Dockerfile and docker-compose.yml
- **Replit**: Development and hosting platform
- **Database Options**: MongoDB Atlas (primary) or Neon PostgreSQL
- **Environment Variables**: Configuration management for API keys and database URLs
- **SMTP Email**: Production email support via Gmail, SendGrid, or custom SMTP

## Deployment Options

### Option 1: Docker Deployment (Recommended for Production)
See `DOCKER_DEPLOYMENT.md` for complete instructions.

Quick start:
```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and other credentials

# 2. Build and run
docker build -t ats-app .
docker run -d -p 5000:5000 --env-file .env ats-app

# Or use docker-compose for full stack
docker-compose up -d
```

### Option 2: Replit Development
The application runs in development mode on Replit using the configured workflow.

### Environment Configuration

Required environment variables:
- `MONGODB_URI`: MongoDB Atlas connection string
- `OPENAI_API_KEY`: OpenAI API key for AI features  
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`: Email configuration
- `SESSION_SECRET`: Secret for session encryption