# Docker Deployment Guide

This guide explains how to deploy the ATS (Applicant Tracking System) using Docker.

## 🚀 **EASIEST DEPLOYMENT** - Just One Command!

The application includes default configuration for instant deployment. Simply run:

```bash
docker-compose up -d
```

That's it! The app will run on `http://localhost:5000` with:
- ✅ MongoDB Atlas database (pre-configured)
- ⚠️  AI features disabled (no OpenAI key)
- ⚠️  Email notifications disabled (no SMTP credentials)

**To enable ALL features**, add your API keys (see "Optional: Enable AI & Email" below).

---

## Prerequisites

- Docker installed on your system
- Docker Compose installed

**Optional** (for full functionality):
- OpenAI API key (for AI matching & test generation)
- Email SMTP credentials (for notifications)

## Quick Start

### Option 1: Basic Deployment (No Setup Required)

```bash
# Clone the repository
git clone https://github.com/rohitvarmarva-1/resume-ranker.git
cd resume-ranker

# Start the application
docker-compose up -d
```

**Access:** `http://localhost:5000`

### Option 2: Full Features (AI + Email)

Create a `.env` file in the project root:

```env
# OpenAI API Key (REQUIRED for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (REQUIRED for notifications)
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
```

Then run:
```bash
docker-compose up -d
```

**✅ What Gets Enabled:**
- 🤖 AI-powered resume matching
- 📝 Auto-generated test questions
- 📧 Email notifications to candidates and recruiters

---

## Configuration Details

### Default Configuration (docker/default.env)

The application ships with safe defaults:
- **Database:** MongoDB Atlas (already configured)
- **Session Secret:** Auto-generated
- **OpenAI:** Disabled (add key to enable)
- **Email:** Disabled (add SMTP to enable)

### Custom Configuration (.env)

Create `.env` in the root directory to override defaults:

```env
# Optional: Use your own MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ats

# Optional: Enable AI Features
OPENAI_API_KEY=sk-...

# Optional: Enable Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=your_email@gmail.com

# Optional: Custom Session Secret
SESSION_SECRET=your_random_secret_here
```

### Access the Application

Open your browser: `http://localhost:5000`

## Full Stack Deployment with Local MongoDB

If you want to use a local MongoDB database instead of Atlas:

### 1. Update `.env` for Local MongoDB

```env
# Local MongoDB (for docker-compose)
MONGODB_URI=mongodb://admin:admin123@mongo:27017/ats?authSource=admin

# Rest of the configuration remains the same
OPENAI_API_KEY=your_openai_api_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM=your_email@gmail.com
SESSION_SECRET=your_random_secret_key_here
NODE_ENV=production
```

### 2. Run with Docker Compose

```bash
# Start all services (app + MongoDB)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Email Configuration Options

### Gmail SMTP

1. Enable 2-factor authentication in your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use these settings:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_character_app_password
SMTP_FROM=your_email@gmail.com
```

### SendGrid SMTP

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
SMTP_FROM=noreply@yourdomain.com
```

### Other SMTP Providers

Most SMTP providers will work with these settings:
- Update `SMTP_HOST` with your provider's SMTP server
- Update `SMTP_PORT` (usually 587 or 465)
- Provide authentication credentials

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier is sufficient for development)
3. Create a database user with password
4. Whitelist your IP address (or use 0.0.0.0/0 for testing)
5. Get your connection string from the "Connect" button
6. Replace `<username>`, `<password>`, and `<cluster>` in the connection string

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/ats` |
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI features | `sk-...` |
| `SMTP_HOST` | Yes | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | Yes | SMTP server port | `587` |
| `SMTP_USER` | Yes | SMTP username | `your_email@gmail.com` |
| `SMTP_PASSWORD` | Yes | SMTP password | `your_app_password` |
| `SMTP_FROM` | Yes | Email sender address | `noreply@yourapp.com` |
| `SESSION_SECRET` | Yes | Secret for session encryption | `random_string_here` |
| `NODE_ENV` | No | Environment mode | `production` |

## Deployment to Cloud Platforms

### Deploy to DigitalOcean

1. Create a Droplet with Docker installed
2. SSH into your droplet
3. Clone your repository
4. Follow the Quick Start guide above
5. Configure your domain DNS to point to the droplet IP

### Deploy to AWS ECS

1. Build and push Docker image to ECR
2. Create an ECS cluster
3. Define a task with environment variables
4. Create a service to run the task
5. Configure load balancer for port 5000

### Deploy to Azure Container Instances

```bash
# Build image
docker build -t ats-app .

# Tag for Azure Container Registry
docker tag ats-app myregistry.azurecr.io/ats-app

# Push to registry
docker push myregistry.azurecr.io/ats-app

# Deploy to Azure
az container create \
  --resource-group myResourceGroup \
  --name ats-app \
  --image myregistry.azurecr.io/ats-app \
  --dns-name-label ats-app \
  --ports 5000
```

## Troubleshooting

### Application won't start

1. Check logs: `docker logs ats-application`
2. Verify environment variables are set correctly
3. Ensure MongoDB is accessible

### Can't connect to MongoDB

1. Check MongoDB URI format
2. Verify network connectivity
3. Check MongoDB Atlas whitelist settings

### Email notifications not sending

1. Verify SMTP credentials
2. Check SMTP port is not blocked by firewall
3. Review logs for error messages

### Database connection issues

```bash
# Test MongoDB connection
docker exec -it ats-application sh
# Inside container:
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.error(e))"
```

## Sharing Your Code

The application is now fully portable! You can share it by:

1. **Git Repository**: Push to GitHub/GitLab
   ```bash
   git init
   git add .
   git commit -m "ATS application with Docker support"
   git remote add origin your_repo_url
   git push -u origin main
   ```

2. **Docker Hub**: Share the Docker image
   ```bash
   docker tag ats-app yourusername/ats-app
   docker push yourusername/ats-app
   ```

3. **Zip Archive**: Package the entire project
   ```bash
   tar -czf ats-application.tar.gz . --exclude=node_modules --exclude=dist
   ```

## Security Notes

- Never commit `.env` file to version control
- Use strong SESSION_SECRET (generate with: `openssl rand -base64 32`)
- Keep SMTP credentials secure
- Regularly update dependencies
- Use environment-specific MongoDB databases (don't use production DB for testing)

## Monitoring & Maintenance

### View Logs

```bash
# Application logs
docker logs -f ats-application

# Docker Compose logs
docker-compose logs -f app
```

### Update Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Backup MongoDB Data

```bash
# For Docker Compose MongoDB
docker exec mongo mongodump --out /backup
docker cp mongo:/backup ./backup

# For MongoDB Atlas
# Use Atlas built-in backup features
```

## Support

For issues or questions:
1. Check application logs
2. Verify all environment variables
3. Review this documentation
4. Check MongoDB and SMTP service status
