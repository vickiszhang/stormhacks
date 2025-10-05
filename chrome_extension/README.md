# Job Application Tracker - Chrome Extension

> 🤖 AI-powered Chrome extension that automatically detects and tracks job applications

## 📋 Overview

This Chrome extension helps you effortlessly track your job applications by:
- **Automatically detecting** job posting pages
- **Extracting key information** (position, company, location, skills, etc.)
- **Using AI** to identify the top 3 most relevant skills
- **Storing resumes** securely in AWS S3
- **Saving application data** to DynamoDB

## 🎨 Features

- ✨ Smart job page detection (LinkedIn, Indeed, Greenhouse, Lever, etc.)
- 📊 Automatic data extraction (role, company, job URL)
- 💬 **Prompt-based workflow** - asks before saving anything
- 📝 Optional notes field for each application
- ☁️ Secure cloud storage (AWS S3 + DynamoDB)
- 📅 Application lifecycle tracking (screening, interview, acceptance, rejection dates)
- 💎 Beautiful UI with custom color scheme (#F9C6D7, #10559A)
- ✏️ All fields editable before saving
- 📄 PDF resume upload support
- ☑️ Cover letter tracking

## 🚀 Quick Start

**Want to get started fast?** Check out [QUICK_START.md](./QUICK_START.md)

**Need detailed setup instructions?** Read [SETUP.md](./SETUP.md)

**Curious about the technical details?** See [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)

## 🏗️ Architecture

### Backend
- Express.js server for handling uploads
- AWS SDK for S3 and DynamoDB integration
- Multer for file upload handling
- CORS enabled for Chrome extension requests

### Extension
- Content script for page detection and data extraction
- Popup UI for displaying and editing job data
- Background worker for initialization
- Chrome Storage API for settings

### AWS Services
- **DynamoDB** → Store job application metadata
- **S3** → Store resumes securely
- **Gemini AI** → Validate and select top skills

## 📁 Project Structure

```
chrome_extension/
├── backend/
│   ├── server.js          # Express server with AWS integration
│   ├── package.json       # Dependencies
│   └── .env              # AWS credentials (create this)
├── frontend/
│   ├── manifest.json      # Extension configuration
│   ├── popup.html        # Main UI
│   ├── popup.js          # UI logic and API calls
│   ├── content.js        # Page detection and extraction
│   ├── background.js     # Background worker
│   ├── options.html      # Settings page
│   └── options.js        # Settings logic
├── QUICK_START.md        # Fast setup guide
├── SETUP.md              # Detailed documentation
└── MIGRATION_SUMMARY.md  # Technical details
```

## 🎯 Usage

1. **Navigate** to any job posting page
2. **Click** the extension icon in your Chrome toolbar
3. **See prompt**: "Job application detected!"
4. **Review** the auto-extracted information (role, company, URL)
5. **Edit** any fields as needed
6. **Enter date applied** (optional - leave blank if you haven't applied yet)
7. **Upload** your resume (PDF, optional)
8. **Check** the cover letter box if applicable
9. **Add notes** about the application (optional)
10. **Click** "Track Application" to save

**Only saves when you explicitly click the button!** ✅

Your application is now tracked in the cloud! ☁️

## 🛠️ Development

### Prerequisites
- Node.js (v14+)
- Chrome browser
- AWS account
- Gemini API key

### Local Development

```bash
# Start backend server
cd backend
npm install
node server.js

# Load extension in Chrome
1. Open chrome://extensions/
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the 'frontend' folder
```

## 🔐 Environment Variables

Create `backend/.env`:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## 📊 Data Schema

### DynamoDB Table: JobApplications
```javascript
{
  ApplicationID: String (Primary Key, UUID),
  Role: String (Job title/position),
  Company: String (Company name),
  JobURL: String (Link to job posting),
  DateApplied: String (ISO date, optional),
  DateScreening: String (ISO date, optional - for future updates),
  DateInterview: String (ISO date, optional - for future updates),
  DateAccepted: String (ISO date, optional - for future updates),
  DateRejected: String (ISO date, optional - for future updates),
  ResumeURL: String (S3 path, optional),
  DidCL: Boolean (Cover letter submitted?),
  Notes: String (Optional notes)
}
```

## 🎨 Color Palette

- **Primary Blue**: `#10559A`
- **Soft Pink**: `#F9C6D7`
- **Success Green**: `#2e7d32`
- **Warning Orange**: `#e65100`

## 📚 Documentation

- [**QUICK_START.md**](./QUICK_START.md) - Get up and running in 10 minutes
- [**SETUP.md**](./SETUP.md) - Complete setup guide with troubleshooting
- [**UPDATED_SCHEMA.md**](./UPDATED_SCHEMA.md) - New schema and workflow details
- [**MIGRATION_SUMMARY.md**](./MIGRATION_SUMMARY.md) - Technical architecture and changes
- [**TESTING_CHECKLIST.md**](./TESTING_CHECKLIST.md) - Complete testing guide

## 🤝 Contributing

This project was created for StormHacks. Feel free to fork and improve!

## 📄 License

MIT License - Feel free to use this for your job hunt!

## 🙏 Acknowledgments

- Built with ❤️ for job seekers
- Powered by Google Gemini AI
- Hosted on AWS

---

**Happy Job Hunting!** 🎯✨
