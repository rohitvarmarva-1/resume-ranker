# AI-Powered Applicant Tracking System (ATS)

A modern, full-stack ATS with AI-powered job matching, automated email notifications, and intelligent candidate screening.

## 🚀 Features

- **AI Job Matching**: Automatically calculates compatibility scores between candidates and jobs
- **Email Notifications**: ALL candidates receive emails when new jobs are posted with their match percentages
- **Resume Analysis**: AI-powered skill extraction and experience parsing
- **Automated Testing**: Generate and evaluate candidate assessments
- **Role-Based Access**: Separate dashboards for recruiters and candidates
- **Docker Ready**: Fully containerized for easy deployment
- **MongoDB Support**: Cloud-ready with MongoDB Atlas integration

## 📋 Quick Start

### 🎯 Fastest Way (5 Minutes)

See **[QUICKSTART.md](./QUICKSTART.md)** for the easiest setup guide.

### 🐳 Docker Deployment

See **[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)** for complete deployment instructions.

Quick commands:
```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 2. Run with Docker Compose (MongoDB Atlas)
docker-compose -f docker-compose.atlas.yml up -d

# 3. Access at http://localhost:5000
```

## 🔧 Requirements

- **Docker** (for deployment)
- **MongoDB Atlas** account (free tier works)
- **OpenAI API Key** (for AI features)
- **SMTP Credentials** (Gmail, SendGrid, or other)

## 📧 Email Notification Feature

When recruiters post new jobs, the system:
1. Retrieves ALL candidates from the database
2. Calculates AI match score for each candidate
3. Sends personalized email with match percentage
4. Includes job details and apply link

**Example:**
```
Subject: Perfect Job Match Alert: Senior Developer (92% Match!)

Your profile is a 92% match for this new position!
```

## 🗄️ Database Configuration

The system supports multiple databases:

### MongoDB Atlas (Recommended)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ats
```

### Local MongoDB (Docker Compose)
```env
MONGODB_URI=mongodb://admin:admin123@mongo:27017/ats?authSource=admin
```

### PostgreSQL (Neon)
```env
DATABASE_URL=postgres://user:pass@host/database
# Don't set MONGODB_URI
```

The system automatically selects the database based on environment variables.

## 🏗️ Project Structure

```
.
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/       # Application pages
│   │   └── components/  # Reusable components
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── storage.ts       # Storage interface
│   ├── mongo-storage.ts # MongoDB implementation
│   ├── email.ts         # Email service
│   ├── openai.ts        # AI integration
│   └── routes.ts        # API routes
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schemas
├── Dockerfile           # Docker image configuration
├── docker-compose.yml   # Full stack (app + MongoDB)
├── docker-compose.atlas.yml  # MongoDB Atlas deployment
└── .env.example         # Environment template
```

## 🔐 Environment Variables

Required variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# AI Features
OPENAI_API_KEY=your_openai_api_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=your_email@gmail.com

# Security
SESSION_SECRET=random_secret_key
```

See `.env.example` for complete configuration.

## 🛠️ Development

### Local Development (Replit)
```bash
npm install
npm run dev
```

### Local Development (Docker)
```bash
docker-compose up
```

## 📝 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get current user

### Jobs
- `GET /api/jobs` - List all active jobs
- `POST /api/jobs` - Create new job (recruiter only)
- `GET /api/jobs/:id` - Get job details

### Applications
- `GET /api/applications` - List applications
- `POST /api/applications` - Submit application

### Resumes
- `POST /api/resumes` - Upload resume
- `GET /api/resumes` - List user's resumes

## 🎨 Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS + Shadcn/ui
- TanStack Query
- Wouter (routing)
- React Hook Form + Zod

### Backend
- Node.js + Express
- TypeScript
- Passport.js (authentication)
- Multer (file uploads)

### Database
- MongoDB (Mongoose)
- PostgreSQL (Drizzle ORM)

### AI & Email
- OpenAI GPT-4
- Nodemailer

## 🚢 Deployment

### Docker (Any Platform)
```bash
docker build -t ats-app .
docker run -d -p 5000:5000 --env-file .env ats-app
```

### Cloud Platforms
- **DigitalOcean**: Deploy droplet with Docker
- **AWS ECS**: Container deployment
- **Azure**: Container Instances
- **Heroku**: Docker deployment

See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for detailed instructions.

## 📊 How It Works

### Job Matching Algorithm
1. Candidate uploads resume
2. AI extracts skills and experience
3. When job is posted, AI compares:
   - Required skills vs candidate skills
   - Experience level matching
   - Job requirements vs background
4. Generates match score (0-100%)
5. Sends email notification

### Email Notifications Flow
```
New Job Posted
    ↓
Get ALL Candidates
    ↓
For Each Candidate:
    ↓
Calculate Match Score (AI)
    ↓
Send Personalized Email
    ↓
Log Results
```

## 🔒 Security Features

- Password hashing (scrypt)
- Session-based authentication
- Environment-based secrets
- CSRF protection
- Input validation (Zod)

## 📦 Sharing & Portability

Your code is fully portable! Share via:

1. **Git Repository**
   ```bash
   git init && git add . && git commit -m "Initial commit"
   git remote add origin YOUR_REPO
   git push -u origin main
   ```

2. **Docker Hub**
   ```bash
   docker tag ats-app yourusername/ats-app
   docker push yourusername/ats-app
   ```

3. **Archive**
   ```bash
   tar -czf ats.tar.gz --exclude=node_modules .
   ```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MongoDB URI format
- Check network access in MongoDB Atlas
- Ensure IP is whitelisted

### Email Not Sending
- Verify SMTP credentials
- Check Gmail App Password (not regular password)
- Review logs for errors

### Application Won't Start
```bash
# Check logs
docker logs ats-application

# Or with docker-compose
docker-compose logs -f
```

## 📚 Documentation

- [Quick Start Guide](./QUICKSTART.md) - Get running in 5 minutes
- [Docker Deployment](./DOCKER_DEPLOYMENT.md) - Complete deployment guide
- [Project Architecture](./replit.md) - Technical documentation

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use for your projects!

## 🎯 What's Next?

- Add more AI features (interview scheduling, candidate ranking)
- Implement real-time notifications (WebSockets)
- Add video interview support
- Create mobile app
- Multi-language support

---

**Built with ❤️ using AI-powered development**
