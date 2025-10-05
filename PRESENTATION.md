# Beacon - Job Application Tracker
### Chrome Extension for Smart Job Application Management

---

## 📋 Project Overview

**Beacon** is a Chrome extension that intelligently detects when you're viewing a job posting and prompts you to track your application. It provides a streamlined workflow for job seekers to organize applications, store resumes, and maintain a centralized database of their job search journey.

### Key Features
- **Automatic Job Detection**: Detects job postings on LinkedIn, Indeed, SAP, Greenhouse, Lever, Workday, and other major platforms
- **Prompt-Based Workflow**: No auto-save - prompts user to input information when a job posting is detected
- **Resume Storage**: Upload and store resumes securely in AWS S3
- **Application Tracking**: Track application lifecycle (Applied → Screening → Interview → Accepted/Rejected)
- **Smart Data Extraction**: Pre-fills role, company, and URL from the job posting
- **Persistent Storage**: DynamoDB backend for reliable data storage

---

## 🏗️ Architecture

### Frontend (Chrome Extension - Manifest V3)
```
chrome_extension/frontend/
├── manifest.json        # Extension configuration
├── popup.html          # Main UI
├── popup.js            # Popup logic
├── content.js          # Job detection & extraction
├── background.js       # Service worker
├── options.html        # Settings page
└── icon.png            # Extension icon
```

### Backend (Express.js)
```
chrome_extension/backend/
├── server.js           # API server (localhost:3000)
├── package.json        # Dependencies
└── .env               # AWS credentials (not tracked)
```

### Cloud Services (AWS)
- **S3**: Resume storage in `job-applications-storage` bucket
- **DynamoDB**: Application data in `JobApplications` table

---

## 🎨 Design System

### Beacon Color Palette
- **Soft Pink**: `#F9C6D7` - Used for warm gradients and accents
- **Deep Pink**: `#DB4C77` - Primary brand color, "not detected" state
- **Deep Blue**: `#10559A` - Secondary brand color, "job detected" state
- **Cyan**: `#3CA2C8` - Accent color for buttons and highlights

### Dynamic Header Colors
- **Pink Header** (Gradient: #DB4C77 → #F9C6D7): Shown when NOT on a job posting or during errors
- **Blue Header** (Gradient: #10559A → #3CA2C8): Shown when a job posting is successfully detected
- **Smooth Transition**: 0.3s ease transition between states

### Border Radius Scale
- **8px**: Input fields
- **10px**: Buttons and status banners
- **12px**: Icon containers
- **16px**: Large containers and notification banners

---

## 🤖 AI Integration (Original Plan)

### Gemini API Implementation
**Original Intent**: The project was initially designed to use Google's Gemini API for intelligent skill extraction and matching.

#### Planned Workflow:
1. **Skill Extraction**: Parse job description to extract required skills
2. **Resume Analysis**: Analyze uploaded resume for matching skills
3. **Compatibility Score**: Generate match percentage
4. **Recommendations**: Suggest skills to highlight in application

#### Why We Simplified:
After testing, we decided to **remove the AI vetting system** and focus on a **prompt-based workflow** where users maintain full control. This reduces complexity, eliminates API dependencies, and gives users agency over what they track.

#### Current Approach:
- **No automatic skill extraction**
- **User-driven input**: Users manually confirm and edit extracted data
- **Optional fields**: Users can add notes about skills/qualifications themselves
- Focus on **speed and simplicity** over automated analysis

**Note**: The Gemini integration code was removed to streamline the extension, but the architecture supports re-enabling it if needed in the future.

---

## 🗄️ Database Connection

### DynamoDB Schema

**Table Name**: `JobApplications`

| Field | Type | Description |
|-------|------|-------------|
| `ApplicationID` | String (Primary Key) | UUID v4 |
| `Role` | String | Job title/position |
| `Company` | String | Company name |
| `JobURL` | String | Link to job posting |
| `DateApplied` | String (ISO Date) | Date application submitted |
| `DateScreening` | String (ISO Date) | Date of phone/initial screening |
| `DateInterview` | String (ISO Date) | Date of interview |
| `DateAccepted` | String (ISO Date) | Date of offer acceptance |
| `DateRejected` | String (ISO Date) | Date of rejection |
| `ResumeURL` | String | S3 URL to uploaded resume |
| `DidCL` | Boolean | Whether cover letter was submitted |
| `Notes` | String | User's custom notes |

### AWS Configuration

#### S3 Bucket: `job-applications-storage`
- **Purpose**: Store PDF resumes
- **Access**: Private with signed URLs
- **File Naming**: `resumes/{ApplicationID}.pdf`

#### DynamoDB Table: `JobApplications`
- **Partition Key**: ApplicationID (String)
- **Capacity**: On-demand billing
- **Region**: Your AWS region (e.g., us-west-2)

### Backend API Endpoint

**POST** `/upload-job`

**Request** (multipart/form-data):
```javascript
{
  role: "Software Engineer",
  company: "Google",
  jobURL: "https://...",
  dateApplied: "2024-01-15",
  coverLetter: true,
  notes: "Applied through referral",
  resume: File (PDF)
}
```

**Response**:
```javascript
{
  message: "Application saved successfully!",
  applicationId: "a3d8f5c2-1b4e-4f9a-8e7c-6d5a4b3c2e1f"
}
```

### Environment Variables Required

Create `chrome_extension/backend/.env`:
```env
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=job-applications-storage
DYNAMODB_TABLE_NAME=JobApplications
```

---

## 💬 Prompts & User Workflow

### User Journey

1. **Navigate to Job Posting**
   - User opens any job listing on supported platforms
   - Extension badge shows notification

2. **Extension Detection**
   - Content script runs 3-step validation
   - Shows on-page notification: "Job posting detected! Click the Beacon icon to track this application."

3. **Open Extension Popup**
   - User clicks Beacon icon in toolbar
   - Popup checks if current page is a job posting (3-second timeout)

4. **Dynamic Header Color**
   - **Pink**: If not a job posting or error
   - **Blue**: If job posting detected

5. **Pre-filled Form**
   - Role, Company, and URL automatically extracted
   - User can edit any field
   - Date defaults to today

6. **Optional Additions**
   - Upload resume (PDF only)
   - Check "cover letter submitted" box
   - Add custom notes

7. **Save Application**
   - Submits to backend API
   - Stores in DynamoDB + S3
   - Shows success message

### Prompt Examples

#### Timeout State (Pink Header)
```
⚠️ Timeout
Unable to scan this page. Try refreshing or navigating to a job posting.
[🔄 Try Again]
```

#### Not a Job Posting (Pink Header)
```
ℹ️ Not a job posting
This doesn't appear to be a job application page.

Navigate to a job posting on sites like LinkedIn, Indeed, 
or company career pages to start tracking.
[🔄 Refresh Detection]
```

#### Job Detected (Blue Header)
```
✅ Job posting detected!

[Pre-filled form with extracted data]
Role/Position: _______________
Company: _______________
Job URL: _______________
Date Applied: [Today's date]
Upload Resume: [Choose file]
☐ I submitted a cover letter
Notes: _______________

[Refresh] [Save Application]
```

---

## 🔍 Job Detection Logic

### Detection Restrictions (3-Step Validation)

The extension uses **strict validation** to minimize false positives:

#### Step 1: URL Pattern Matching
```javascript
// ✅ MUST match one of these patterns:
const jobPatterns = [
  /linkedin\.com\/jobs\/view/,
  /indeed\.com\/viewjob/,
  /indeed\.com\/.*\/jobs\//,
  /greenhouse\.io\/.*\/jobs\//,
  /lever\.co\/.*\/jobs\//,
  /jobs\.lever\.co/,
  /workday\.com\/.*\/job\//,
  /myworkdayjobs\.com/,
  /sap\.com\/.*\/job-detail/,
  /jobs\.sap\.com/,
  /\/careers?\/.*\/job\//,
  /\/job-details?\//,
  /\/positions?\//,
  /\/openings?\//,
  /requisition.*id/i,
  /job[-_]?id/i
];

// ❌ MUST NOT match exclusion patterns:
const excludePatterns = [
  /\/search/,
  /\/results/,
  /\/browse/,
  /google\.com/,
  /bing\.com/
];
```

#### Step 2: Content Verification
```javascript
// ✅ Page MUST contain job-related keywords:
const keywords = [
  'apply', 'application', 'job description', 
  'qualifications', 'responsibilities', 
  'requirements', 'experience', 'skills'
];

// Minimum 3 keywords must be present
```

#### Step 3: Requisition ID Detection
```javascript
// ✅ OR find a requisition ID pattern:
const requisitionPatterns = [
  /req(?:uisition)?[:\s-]?#?\s*([A-Z0-9-]+)/i,
  /job[:\s-]?#?\s*([A-Z0-9-]+)/i,
  /position[:\s-]?#?\s*([A-Z0-9-]+)/i,
  /opening[:\s-]?#?\s*([A-Z0-9-]+)/i
];
```

**Logic**: A page is considered a job posting if:
- (URL matches job patterns AND NOT exclusion patterns) 
- AND (Contains 3+ keywords OR has requisition ID)

### Data Extraction Rules

#### Role Extraction Priority
1. `<meta property="og:title">` content
2. `<h1>` tags
3. Elements with class/id containing "job-title", "position", "role"
4. Fallback: "Unknown Role"

#### Company Extraction Priority
1. `<meta property="og:site_name">` content
2. Elements with class/id containing "company"
3. **Smart Domain Fallbacks**:
   - `sap.com` → "SAP"
   - `greenhouse.io` → Extract from subdomain
   - `lever.co` → Extract from subdomain
   - Generic: Clean up domain name
4. Fallback: "Unknown Company"

#### URL Extraction
- Uses `window.location.href`
- Strips tracking parameters for cleaner URLs

---

## 🚀 Technical Challenges Solved

### 1. Infinite Loading Issue
**Problem**: Extension stuck on "Checking page..." indefinitely

**Solution**: 
- Added 3-second timeout with `setTimeout()`
- Show error message with retry button after timeout
- Clear timeout when response received

### 2. SAP Careers Detection
**Problem**: SAP's career pages weren't being detected (no "Apply" button, different URL structure)

**Solution**:
- Added SAP-specific URL patterns: `/sap\.com\/.*\/job-detail/`, `/jobs\.sap\.com/`
- Implemented requisition ID detection as alternative validation method
- Added fallback company extraction for `sap.com` domain

### 3. False Positives on Search Pages
**Problem**: Job search results pages were triggering detection

**Solution**:
- Added exclusion patterns: `/search/`, `/results/`, `/browse/`
- Increased keyword threshold from 1 to 3
- Required requisition ID OR multiple keywords (not just one indicator)

### 4. Inconsistent Design
**Problem**: Mixed border radius values (4px, 6px, 8px, 12px, 14px) across UI elements

**Solution**:
- Established design system with 4-tier scale: 8px, 10px, 12px, 16px
- Applied consistently across all components
- Documented in style guide

### 5. CSS Caching in Extension
**Problem**: Style changes not appearing after updates

**Solution**:
- Hard reload extension in `chrome://extensions/`
- Close and reopen popup to clear cache
- Use Ctrl+Shift+R for hard refresh on options page

---

## 🎯 Supported Platforms

### Tier 1: Full Support
- ✅ **LinkedIn**: `/linkedin.com/jobs/view/`
- ✅ **Indeed**: `/indeed.com/viewjob/` or `/indeed.com/.*/jobs/`
- ✅ **SAP Careers**: `/sap.com/.*/job-detail/` or `/jobs.sap.com/`

### Tier 2: ATS Platforms
- ✅ **Greenhouse**: `/greenhouse.io/.*/jobs/`
- ✅ **Lever**: `/lever.co/.*/jobs/` or `/jobs.lever.co/`
- ✅ **Workday**: `/workday.com/.*/job/` or `/myworkdayjobs.com/`

### Tier 3: Generic Patterns
- ✅ Company career pages with `/careers/job/`, `/job-details/`, `/positions/`, `/openings/`
- ✅ Any page with requisition ID patterns

### Not Supported
- ❌ Job search results pages
- ❌ Job board home pages
- ❌ Company career landing pages (without specific job)
- ❌ Google/Bing search results

---

## 📊 Future Enhancements

### Potential Features
1. **Dashboard**: Next.js dashboard to visualize applications (currently in `/dashboard` folder)
2. **Email Notifications**: Remind users to follow up on applications
3. **Calendar Integration**: Add interview dates to Google Calendar
4. **Resume Versioning**: Store multiple resume versions per application
5. **Cover Letter Templates**: Generate cover letters with AI
6. **Application Analytics**: Track success rates by platform, company size, etc.
7. **Chrome Sync**: Sync application data across devices
8. **Export**: Download applications as CSV/Excel

### Re-enabling Gemini AI
If you want to add AI skill matching:
1. Get Gemini API key from Google AI Studio
2. Add `/analyze-skills` endpoint to backend
3. Call Gemini with job description + resume
4. Display match percentage in popup
5. Show suggested skills to highlight

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 14+
- Chrome Browser
- AWS Account (for S3 + DynamoDB)

### Installation

1. **Clone Repository**
```bash
cd ~/Desktop/stormhacks
```

2. **Install Backend Dependencies**
```bash
cd chrome_extension/backend
npm install
```

3. **Configure AWS**
Create `.env` file in `backend/`:
```env
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=job-applications-storage
DYNAMODB_TABLE_NAME=JobApplications
```

4. **Start Backend Server**
```bash
node server.js
# Server runs on http://localhost:3000
```

5. **Load Extension in Chrome**
- Open `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select `chrome_extension/frontend/` folder

6. **Test Detection**
- Navigate to a job posting on LinkedIn or Indeed
- Click Beacon icon in toolbar
- Verify header turns blue and form is pre-filled

---

## 📝 Testing Checklist

### Functional Tests
- [ ] Extension loads without errors
- [ ] Badge notification appears on job pages
- [ ] Header turns blue when job detected
- [ ] Header turns pink when not detected
- [ ] Refresh buttons work in error states
- [ ] Form pre-fills with correct data
- [ ] Resume upload accepts PDF only
- [ ] Save button submits to backend
- [ ] Success message appears after save
- [ ] Data appears in DynamoDB

### Platform Tests
- [ ] LinkedIn job posting detected
- [ ] Indeed job posting detected
- [ ] SAP careers page detected
- [ ] Greenhouse ATS detected
- [ ] Lever ATS detected
- [ ] Workday ATS detected
- [ ] Search results pages NOT detected
- [ ] Google search NOT detected

### Design Tests
- [ ] All border-radius values correct
- [ ] Colors match Beacon palette
- [ ] Header gradient smooth transition
- [ ] Buttons have hover states
- [ ] Loading spinner visible
- [ ] Icons sized correctly (56px)
- [ ] Text readable on gradients

---

## 🎬 Presentation Talking Points

### Opening
> "Beacon is a Chrome extension that turns job hunting chaos into organized tracking. It automatically detects when you're on a job posting and prompts you to save your application with just a few clicks."

### Problem Statement
> "Job seekers apply to dozens of companies but lose track of where they applied, when they applied, and what resume version they used. Beacon solves this by capturing application details the moment you apply."

### Key Innovation
> "Unlike other trackers that require manual entry, Beacon intelligently detects job postings across 20+ platforms and pre-fills all the data for you. We use strict 3-step validation to avoid false positives."

### Technical Highlights
> "Built with Chrome Manifest V3, Express.js backend, and AWS services (S3 for resumes, DynamoDB for data). The extension uses advanced pattern matching to detect jobs on enterprise ATS platforms like Greenhouse, Lever, and Workday—not just LinkedIn and Indeed."

### Design Philosophy
> "We designed Beacon with dynamic visual feedback: the header turns blue when a job is detected, pink when it's not. This gives users instant confidence that the extension is working."

### AI Integration Story
> "We initially planned to use Google's Gemini API for skill extraction and resume matching, but decided to remove it for simplicity. Users prefer full control over their data rather than automated analysis."

### Future Vision
> "Next steps include building a dashboard to visualize application pipelines, adding email reminders for follow-ups, and potentially re-enabling AI for personalized insights."

---

## 📄 License & Credits

**Created for**: StormHacks Hackathon  
**Team**: David Lim  
**Stack**: Chrome Extension (Manifest V3) + Express.js + AWS (S3 + DynamoDB)  
**Design**: Beacon brand identity with pink/blue color palette  
**Status**: Functional prototype with production-ready architecture  

---

## 🔗 Quick Links

- **Repository**: `/Users/davidlim/Desktop/stormhacks/`
- **Extension Folder**: `chrome_extension/frontend/`
- **Backend Server**: `chrome_extension/backend/`
- **Dashboard (Future)**: `dashboard/`
- **Load Extension**: `chrome://extensions/` → Load unpacked

---

**Built with ❤️ for job seekers who deserve better tools.**
