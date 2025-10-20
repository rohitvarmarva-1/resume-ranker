# Complete Git + Docker Deployment Guide

This guide shows you exactly how to push your code to Git and deploy it anywhere using Docker.

## 📋 What You'll Need

1. **GitHub/GitLab Account** - Free account at github.com or gitlab.com
2. **Git Repository** - Create a new empty repository
3. **Docker** - On the machine where you'll deploy

---

## Part 1: Push Code to Git

### Step 1: Create a Git Repository

Go to GitHub (https://github.com) and:
1. Click "New Repository"
2. Name it (e.g., "ats-system")
3. Make it **Private** (recommended) or Public
4. **DO NOT** initialize with README
5. Click "Create repository"
6. Copy the repository URL (e.g., `https://github.com/YourUsername/ats-system.git`)

### Step 2: Initialize Git on Replit

Open the Replit Shell and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: AI-powered ATS with Docker support"

# Add your GitHub repository as remote
# REPLACE with your actual repository URL
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note**: When prompted for credentials:
- Username: Your GitHub username
- Password: Use a Personal Access Token (not your password)

### Step 3: Create GitHub Personal Access Token

If you need a token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Select scopes: `repo` (all)
4. Copy the token
5. Use this token as password when pushing

---

## Part 2: Deploy on Another Machine with Docker

### Step 1: Prepare Your Deployment Machine

On your deployment machine (could be cloud server, your computer, etc.):

```bash
# Install Docker (if not installed)
# For Ubuntu/Debian:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# For other OS, visit: https://docs.docker.com/get-docker/
```

### Step 2: Clone Repository

```bash
# Clone your repository
# REPLACE with your actual repository URL
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Navigate to project directory
cd YOUR_REPO_NAME
```

### Step 3: Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit .env file with your credentials
nano .env  # or use vim, or any editor
```

Add your configuration to `.env`:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://Vivek:VSweta%401234@vsproduct.bknr22r.mongodb.net/ats?retryWrites=true&w=majority

# OpenAI API Key
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Email SMTP (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=your.email@gmail.com

# Session Secret
SESSION_SECRET=generate-a-random-secret-key-here

# Environment
NODE_ENV=production
```

Save and exit (Ctrl+X, then Y, then Enter in nano).

### Step 4: Build Docker Image

```bash
# Build the Docker image
docker build -t ats-app .

# This will take a few minutes...
```

### Step 5: Run the Application

**Option A: Using Docker directly**

```bash
# Run the container
docker run -d \
  --name ats-application \
  -p 5000:5000 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  --restart unless-stopped \
  ats-app

# View logs
docker logs -f ats-application
```

**Option B: Using Docker Compose (Recommended)**

```bash
# Start with docker-compose
docker-compose -f docker-compose.atlas.yml up -d

# View logs
docker-compose -f docker-compose.atlas.yml logs -f

# Stop
docker-compose -f docker-compose.atlas.yml down
```

### Step 6: Access Your Application

Open your browser:
```
http://localhost:5000
```

Or if deployed on a server:
```
http://YOUR_SERVER_IP:5000
```

---

## Part 3: Useful Docker Commands

### Managing the Application

```bash
# View running containers
docker ps

# Stop the application
docker stop ats-application

# Start the application
docker start ats-application

# Restart the application
docker restart ats-application

# View logs
docker logs -f ats-application

# View last 100 lines of logs
docker logs --tail 100 ats-application

# Remove container
docker stop ats-application
docker rm ats-application

# Remove image
docker rmi ats-app
```

### With Docker Compose

```bash
# Start all services
docker-compose -f docker-compose.atlas.yml up -d

# Stop all services
docker-compose -f docker-compose.atlas.yml down

# Restart all services
docker-compose -f docker-compose.atlas.yml restart

# View logs
docker-compose -f docker-compose.atlas.yml logs -f

# View specific service logs
docker-compose -f docker-compose.atlas.yml logs -f app

# Rebuild and restart
docker-compose -f docker-compose.atlas.yml up -d --build
```

---

## Part 4: Updating Your Application

### On Replit (Source)

```bash
# Make your changes, then:
git add .
git commit -m "Description of changes"
git push origin main
```

### On Deployment Machine

```bash
# Navigate to project directory
cd YOUR_REPO_NAME

# Pull latest changes
git pull origin main

# Rebuild Docker image
docker build -t ats-app .

# Stop old container
docker stop ats-application
docker rm ats-application

# Start new container
docker run -d \
  --name ats-application \
  -p 5000:5000 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  --restart unless-stopped \
  ats-app
```

Or with Docker Compose:
```bash
git pull origin main
docker-compose -f docker-compose.atlas.yml up -d --build
```

---

## Part 5: Deploy to Cloud (Optional)

### DigitalOcean Droplet

1. Create Ubuntu droplet ($6/month)
2. SSH into droplet: `ssh root@YOUR_DROPLET_IP`
3. Follow "Part 2" steps above
4. Access at `http://YOUR_DROPLET_IP:5000`

### AWS EC2

1. Launch EC2 instance (Ubuntu)
2. Configure security group (allow port 5000)
3. SSH into instance
4. Follow "Part 2" steps above
5. Access at `http://YOUR_EC2_IP:5000`

### Heroku (Container Deployment)

```bash
# Login to Heroku
heroku login
heroku container:login

# Create app
heroku create your-ats-app

# Set environment variables
heroku config:set MONGODB_URI="your_mongo_uri"
heroku config:set OPENAI_API_KEY="your_key"
heroku config:set SMTP_HOST="smtp.gmail.com"
# ... set other variables

# Push container
heroku container:push web
heroku container:release web

# Open app
heroku open
```

---

## Part 6: Production Checklist

Before deploying to production:

- [ ] Set strong `SESSION_SECRET` (use: `openssl rand -base64 32`)
- [ ] Configure production SMTP credentials
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Set up SSL/HTTPS (use Nginx + Let's Encrypt)
- [ ] Configure domain name
- [ ] Set up monitoring and logs
- [ ] Regular backups of MongoDB
- [ ] Review and update dependencies

---

## Troubleshooting

### Git Push Fails

```bash
# If you get authentication errors:
# Use Personal Access Token instead of password

# If you get "repository not found":
# Check your repository URL
git remote -v

# Update remote URL if needed:
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Docker Build Fails

```bash
# Clear Docker cache and rebuild
docker system prune -a
docker build --no-cache -t ats-app .
```

### Application Won't Start

```bash
# Check logs
docker logs ats-application

# Common issues:
# 1. Missing environment variables - check .env file
# 2. MongoDB connection - verify MONGODB_URI
# 3. Port already in use - change port or stop other service
```

### Can't Access Application

```bash
# Check if container is running
docker ps

# Check if port is exposed
docker port ats-application

# If on cloud server, check firewall:
# Ubuntu/Debian:
sudo ufw allow 5000

# Check if app is listening
docker exec ats-application netstat -tuln | grep 5000
```

---

## Quick Reference

### Complete Flow Summary

```bash
# === ON REPLIT (Source) ===
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USER/REPO.git
git push -u origin main

# === ON DEPLOYMENT MACHINE ===
git clone https://github.com/USER/REPO.git
cd REPO
cp .env.example .env
# Edit .env with your credentials
docker build -t ats-app .
docker run -d --name ats-application -p 5000:5000 --env-file .env ats-app
# Access at http://localhost:5000

# === UPDATING ===
# On source: git push
# On deploy: git pull && docker-compose up -d --build
```

---

## Support

Need help? Check:
1. Application logs: `docker logs ats-application`
2. MongoDB Atlas dashboard
3. SMTP service status
4. Docker status: `docker ps`

Your application is now portable and can run anywhere Docker is installed!
