# ATS Quick Start Guide

Get your ATS system running in 5 minutes!

## What You Need

1. **MongoDB Atlas Account**: Free tier at https://www.mongodb.com/cloud/atlas
2. **OpenAI API Key**: Get one from https://platform.openai.com/api-keys
3. **Email SMTP Credentials**: Gmail App Password or SendGrid account
4. **Docker**: Installed on your computer

## Step 1: Configure MongoDB Atlas

Your connection string is already configured:
```
mongodb+srv://Vivek:VSweta%401234@vsproduct.bknr22r.mongodb.net/ats
```

Make sure to:
- Whitelist your IP address in MongoDB Atlas Network Access
- Or allow access from anywhere (0.0.0.0/0) for testing

## Step 2: Get Your API Keys

### OpenAI API Key
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Copy it (starts with `sk-...`)

### Gmail SMTP (Easiest Option)
1. Enable 2-Factor Authentication on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Copy the 16-character password

## Step 3: Configure Environment

Create a `.env` file:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# MongoDB (already configured)
MONGODB_URI=mongodb+srv://Vivek:VSweta%401234@vsproduct.bknr22r.mongodb.net/ats?retryWrites=true&w=majority

# OpenAI API Key (REQUIRED)
OPENAI_API_KEY=sk-your-actual-api-key-here

# Gmail SMTP (REQUIRED for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM=your.email@gmail.com

# Session Secret (REQUIRED)
SESSION_SECRET=randomly-generated-secret-here

# Environment
NODE_ENV=production
```

## Step 4: Deploy with Docker

### Option A: Using Docker Compose (Recommended)

```bash
# Build and start the application
docker-compose -f docker-compose.atlas.yml up -d

# View logs
docker-compose -f docker-compose.atlas.yml logs -f

# Stop the application
docker-compose -f docker-compose.atlas.yml down
```

### Option B: Using Docker Directly

```bash
# Build the image
docker build -t ats-app .

# Run the container
docker run -d \
  -p 5000:5000 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  --name ats-application \
  ats-app

# View logs
docker logs -f ats-application

# Stop the container
docker stop ats-application
docker rm ats-application
```

## Step 5: Access Your Application

Open your browser and go to:
```
http://localhost:5000
```

## Features Enabled

✅ **AI-Powered Job Matching**: Automatically matches candidates to jobs
✅ **Email Notifications**: ALL candidates receive emails when new jobs are posted with their match scores
✅ **Resume Analysis**: AI extracts skills and experience from resumes
✅ **Automated Testing**: Generate and evaluate candidate assessments
✅ **Role-Based Access**: Separate dashboards for recruiters and candidates

## Test the Email Notifications

1. Create a recruiter account
2. Create a candidate account with an email
3. Upload a resume as the candidate
4. Post a new job as the recruiter
5. Check the email inbox - ALL candidates will receive job notification with match percentage!

## How Email Notifications Work

When a recruiter posts a new job:
1. System gets ALL candidates from the database
2. For each candidate with a resume:
   - AI calculates match percentage against the job
   - Email sent to candidate with their match score
   - Beautiful HTML email with job details
3. Console logs show all notifications sent

**Example Email:**
```
Subject: Perfect Job Match Alert: Senior Developer (92% Match!)

Dear candidate,

Great news! We found a job that's a 92% match for your profile!

Position: Senior Developer
Company: TechCorp
Match Score: 92%

[Apply Now Button]
```

## Troubleshooting

### Can't connect to MongoDB
- Check MongoDB Atlas Network Access whitelist
- Verify connection string is correct
- Try allowing 0.0.0.0/0 in Atlas for testing

### Emails not sending
- Verify SMTP credentials
- For Gmail: Make sure App Password is used (not regular password)
- Check SMTP_PORT is 587 for most providers

### Application won't start
```bash
# Check logs
docker-compose -f docker-compose.atlas.yml logs app

# Or for direct Docker:
docker logs ats-application
```

### Need to restart
```bash
# Docker Compose:
docker-compose -f docker-compose.atlas.yml restart

# Direct Docker:
docker restart ats-application
```

## Share Your Code

Your code is now portable! Share it by:

1. **GitHub/GitLab**:
   ```bash
   git init
   git add .
   git commit -m "ATS with Docker support"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Zip File**:
   ```bash
   # Exclude unnecessary files
   tar -czf ats-app.tar.gz \
     --exclude=node_modules \
     --exclude=dist \
     --exclude=.env \
     .
   ```

3. **Docker Hub**:
   ```bash
   docker tag ats-app YOUR_USERNAME/ats-app
   docker push YOUR_USERNAME/ats-app
   ```

## What's Next?

- Add more candidates and test matching
- Customize email templates in `server/email.ts`
- Adjust match threshold for notifications
- Deploy to cloud (AWS, DigitalOcean, Azure)
- Configure custom domain

## Need Help?

1. Check `DOCKER_DEPLOYMENT.md` for detailed docs
2. Review application logs
3. Verify all environment variables are set
4. Make sure MongoDB Atlas and SMTP are accessible

Enjoy your AI-powered ATS! 🚀
