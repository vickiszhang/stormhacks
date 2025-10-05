# Job Application Tracker - Chrome Extension

## 🎯 Overview

Transform your job hunting experience! This Chrome extension automatically detects job application pages, extracts relevant information, and stores your applications securely in AWS.

## ✨ Features

- **🤖 AI-Powered Detection**: Automatically identifies job posting pages
- **📊 Smart Data Extraction**: Captures role, company, and job URL
- **💬 Prompt-Based Workflow**: Prompts you to track applications (doesn't auto-save)
- **📝 Notes Field**: Add custom notes about each application
- **☁️ Cloud Storage**: Securely stores resumes in AWS S3
- **💾 Database Integration**: Saves all application data to DynamoDB
- **📅 Application Tracking**: Track dates for screening, interviews, acceptance, or rejection
- **🎨 Beautiful UI**: Modern design with custom color scheme (#F9C6D7 pink, #10559A blue)

## 🚀 Setup Instructions

### 1. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd chrome_extension/backend
   ```

2. Create a `.env` file with your AWS credentials:
   ```env
   AWS_REGION=your-region
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   node server.js
   ```

   The server will run on `http://localhost:3000`

### 2. AWS Setup

#### S3 Bucket
1. Create an S3 bucket named `job-applications-storage`
2. Configure appropriate permissions for file uploads

#### DynamoDB Table
1. Create a table named `JobApplications`
2. Set `ApplicationID` as the partition key (String)
3. Table schema:
   - `ApplicationID` (String) - Primary Key (UUID)
   - `Role` (String) - Job title/position
   - `Company` (String) - Company name
   - `JobURL` (String) - Link to job posting
   - `DateApplied` (String) - Date when application was submitted (ISO format)
   - `DateScreening` (String) - Date of phone screening (optional)
   - `DateInterview` (String) - Date of interview (optional)
   - `DateAccepted` (String) - Date offer was accepted (optional)
   - `DateRejected` (String) - Date application was rejected (optional)
   - `ResumeURL` (String) - S3 path to uploaded resume
   - `DidCL` (Boolean) - Whether a cover letter was submitted
   - `Notes` (String) - Optional notes about the application

### 3. Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `chrome_extension/frontend` folder
5. The extension icon should appear in your toolbar

### 4. API Key Configuration

1. Click the extension icon or it will auto-open on first install
2. Enter your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Click "Save Settings"

## 📖 How to Use

1. **Navigate to a job posting** (LinkedIn, Indeed, company career pages, etc.)
2. **Click the extension icon** in your Chrome toolbar
3. The extension will:
   - Detect if it's a job application page
   - Extract role, company, and job URL automatically
   - **Prompt you** to track this application
4. **Review and edit** the auto-filled information
5. **Enter the date applied** (leave blank if you haven't applied yet)
6. **Upload your resume** (PDF format, optional)
7. **Check the cover letter box** if you submitted one
8. **Add any notes** about the application (optional)
9. **Click "Track Application"** to save
10. Your data is securely saved to AWS!

> **Note**: The extension prompts you and temporarily stores extracted data. It only saves to the database when you explicitly click "Track Application".

## 🎨 Color Scheme

- **Primary Blue**: `#10559A` - Headers, buttons, accents
- **Soft Pink**: `#F9C6D7` - Skill tags, secondary elements
- Clean white backgrounds with modern gradients

## 🔧 Technical Details

### Content Script (`content.js`)
- Detects job application pages using URL patterns and page content
- Extracts job data: role, company, job URL
- Simple, focused extraction without unnecessary fields

### Popup (`popup.js`, `popup.html`)
- Modern, responsive UI
- Auto-detects and displays job information
- **Prompts user** to track application (doesn't auto-save)
- Temporarily stores extracted data
- Handles form submission to backend only on explicit button click
- Supports optional date, resume, notes fields

### Backend (`server.js`)
- Express server with CORS enabled
- `/upload-job` endpoint for saving applications
- Uploads resumes to S3
- Stores metadata in DynamoDB with proper schema

### Data Flow
```
Job Page → Content Script (Extract Role, Company, URL) 
→ Popup (Display & Prompt User) → User Reviews & Edits
→ User Clicks "Track Application" → Backend Server 
→ S3 (Resume) + DynamoDB (Application Data)
```

## 🐛 Troubleshooting

### Extension not detecting job pages
- Ensure you're on a job listing page
- Try clicking the "Refresh" button in the popup
- Supported platforms: LinkedIn, Indeed, Greenhouse, Lever, company career pages

### "Could not scan page" error
- Refresh the webpage and try again
- Check that content scripts are properly loaded

### Backend connection errors
- Ensure the backend server is running on port 3000
- Check AWS credentials in `.env` file
- Verify S3 bucket and DynamoDB table exist

### Resume upload fails
- Ensure file is in PDF format
- Check S3 bucket permissions
- Verify AWS credentials have S3 write access

## 📝 Notes

- The extension requires the backend server to be running locally
- For production, deploy the backend to a cloud service (AWS Lambda, EC2, etc.)
- Resume files are stored with the application ID for easy retrieval
- All dates are stored in ISO format
- Cover letter submission is tracked as a boolean

## 🔐 Security

- API keys stored securely in Chrome sync storage
- AWS credentials never exposed to frontend
- Resume files stored in private S3 bucket
- All communication over HTTPS in production

## 📦 Dependencies

### Frontend
- Chrome Extensions Manifest V3
- Gemini AI API

### Backend
- Express.js
- AWS SDK (S3, DynamoDB)
- Multer (file uploads)
- CORS
- dotenv

## 🎉 Success!

You're now ready to track your job applications like a pro! Every application is automatically organized and securely stored in the cloud.
