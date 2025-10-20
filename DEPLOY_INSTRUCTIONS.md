# Your Exact Deployment Commands

Repository: https://github.com/rohitvarmarva-1/resume-ranker.git

---

## PART 1: Push Code to GitHub (Run These on Replit Shell)

Copy and paste these commands one by one in the Replit Shell:

```bash
# Step 1: Initialize Git
git init

# Step 2: Add all files
git add .

# Step 3: Commit files
git commit -m "Initial commit: AI-powered ATS with Docker and MongoDB support"

# Step 4: Connect to your GitHub repository
git remote add origin https://github.com/rohitvarmarva-1/resume-ranker.git

# Step 5: Set main branch
git branch -M main

# Step 6: Push to GitHub
git push -u origin main
```

**Note:** When asked for credentials:
- **Username**: rohitvarmarva-1
- **Password**: Use a Personal Access Token (not your GitHub password)

### How to Get Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "ATS Deployment"
4. Check the "repo" checkbox (all repo permissions)
5. Click "Generate token"
6. Copy the token (starts with `ghp_...`)
7. Use this token as your password when pushing

---

## PART 2: Deploy on Docker (Run on Your Server/Computer)

### Prerequisites:
- Docker installed on your machine
- MongoDB Atlas connection ready: `mongodb+srv://Vivek:VSweta%401234@vsproduct.bknr22r.mongodb.net/`
- OpenAI API key
- Email SMTP credentials (Gmail recommended)

### Deployment Commands:

```bash
# Step 1: Clone the repository
git clone https://github.com/rohitvarmarva-1/resume-ranker.git

# Step 2: Enter the directory
cd resume-ranker

# Step 3: Create environment file
cp .env.example .env

# Step 4: Edit .env file (use nano, vim, or any text editor)
nano .env
```

### Step 5: Add Your Configuration to .env

```env
# MongoDB Atlas (already configured)
MONGODB_URI=mongodb+srv://Vivek:VSweta%401234@vsproduct.bknr22r.mongodb.net/ats?retryWrites=true&w=majority

# OpenAI API Key (REQUIRED - add your key)
OPENAI_API_KEY=sk-YOUR-ACTUAL-OPENAI-KEY-HERE

# Gmail SMTP Configuration (REQUIRED - add your credentials)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=your.email@gmail.com

# Session Secret (REQUIRED - generate a random string)
SESSION_SECRET=your-random-secret-key-here

# Environment
NODE_ENV=production
```

**Save and exit** (in nano: Ctrl+X, then Y, then Enter)

### Step 6: Build and Run with Docker

**Option A: Simple Docker Run**

```bash
# Build the Docker image
docker build -t ats-app .

# Run the container
docker run -d \
  --name ats-application \
  -p 5000:5000 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  --restart unless-stopped \
  ats-app

# Check if it's running
docker ps

# View logs
docker logs -f ats-application
```

**Option B: Docker Compose (Recommended)**

```bash
# Start the application
docker-compose -f docker-compose.atlas.yml up -d

# View logs
docker-compose -f docker-compose.atlas.yml logs -f

# Stop the application
docker-compose -f docker-compose.atlas.yml down
```

### Step 7: Access Your Application

Open browser and go to:
```
http://localhost:5000
```

If on a cloud server:
```
http://YOUR_SERVER_IP:5000
```

---

## Useful Commands

### Check Application Status

```bash
# See running containers
docker ps

# View logs
docker logs -f ats-application

# Stop application
docker stop ats-application

# Start application
docker start ats-application

# Restart application
docker restart ats-application
```

### Update Application (After Making Changes)

**On Replit (push updates):**
```bash
git add .
git commit -m "Your update description"
git push origin main
```

**On Docker Server (pull and redeploy):**
```bash
cd resume-ranker
git pull origin main
docker-compose -f docker-compose.atlas.yml up -d --build
```

---

## Gmail App Password Setup

To send emails, you need a Gmail App Password:

1. Go to: https://myaccount.google.com/apppasswords
2. App name: "ATS System"
3. Click "Create"
4. Copy the 16-character password (no spaces)
5. Use this in `SMTP_PASSWORD` in your `.env` file

**Note:** You must have 2-Factor Authentication enabled on your Google account first.

---

## Troubleshooting

### Git Push Fails
```bash
# Make sure you're using Personal Access Token, not password
# Create token at: https://github.com/settings/tokens
```

### Docker Build Fails
```bash
# Clear cache and rebuild
docker system prune -a
docker build --no-cache -t ats-app .
```

### Application Won't Start
```bash
# Check logs for errors
docker logs ats-application

# Common issues:
# - Missing OPENAI_API_KEY in .env
# - Wrong MongoDB connection string
# - Missing SMTP credentials
```

### Can't Connect to MongoDB
```bash
# Make sure MongoDB Atlas allows your IP
# Go to MongoDB Atlas → Network Access → Add IP Address
# For testing, you can allow: 0.0.0.0/0 (anywhere)
```

---

## Complete Flow Summary

```
REPLIT → GitHub → Docker Server → Running App

1. Replit: git push
2. Server: git clone
3. Server: configure .env
4. Server: docker build & run
5. Access: http://localhost:5000
```

---

## Your Application Features

✅ AI-powered job matching
✅ Email notifications to ALL candidates with match scores
✅ MongoDB Atlas database
✅ Resume upload and analysis
✅ Automated candidate testing
✅ Recruiter and candidate dashboards

---

## Support

Questions? Check:
- Docker logs: `docker logs ats-application`
- Application is at: http://localhost:5000
- MongoDB Atlas dashboard for database
- SMTP service status for emails

Enjoy your AI-powered ATS! 🚀
