# Updated Schema & Workflow - Job Application Tracker

## 🔄 Key Changes from Previous Version

### **Previous Approach** ❌
- Auto-extracted position, company, location, industry, skills
- Used AI to vet top 3 skills
- Automatically saved data on button click

### **New Approach** ✅
- **Prompts user** when job page is detected
- Only extracts: Role, Company, Job URL
- **Temporarily stores** data in case user is applying
- User explicitly clicks **"Track Application"** to save
- Simplified schema focused on application lifecycle tracking

---

## 📋 Updated DynamoDB Schema

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ApplicationID` | String | Yes | Unique UUID for each application |
| `Role` | String | Yes | Job title/position name |
| `Company` | String | Yes | Company name |
| `JobURL` | String | Yes | Link to the job posting |
| `DateApplied` | String | No | Date when you submitted the application (ISO format: YYYY-MM-DD) |
| `DateScreening` | String | No | Date of phone/initial screening (for future updates) |
| `DateInterview` | String | No | Date of interview (for future updates) |
| `DateAccepted` | String | No | Date offer was accepted (for future updates) |
| `DateRejected` | String | No | Date application was rejected (for future updates) |
| `ResumeURL` | String | No | S3 path to uploaded resume file |
| `DidCL` | Boolean | Yes | Whether a cover letter was submitted (true/false) |
| `Notes` | String | No | Optional notes about the application |

### Example DynamoDB Item

```json
{
  "ApplicationID": "a3f2c8e5-9b4d-4c1a-8e2f-5d6c7b8a9e0f",
  "Role": "Senior Software Engineer",
  "Company": "Google",
  "JobURL": "https://careers.google.com/jobs/12345",
  "DateApplied": "2025-10-05",
  "DateScreening": null,
  "DateInterview": null,
  "DateAccepted": null,
  "DateRejected": null,
  "ResumeURL": "s3://job-applications-storage/a3f2c8e5-9b4d-4c1a-8e2f-5d6c7b8a9e0f/resume-MyResume.pdf",
  "DidCL": true,
  "Notes": "Applied through referral from John. Really excited about this role!"
}
```

---

## 🔄 Updated Workflow

### 1. Page Detection
```
User visits job posting → Extension detects page → Temporarily stores extracted data
```

### 2. User Prompt
```
Popup opens → Shows "Job application detected!" → Prompts user to track
```

### 3. Form Display
```
Pre-fills: Role, Company, Job URL
User can edit: All fields
User can add: Date Applied, Resume, Cover Letter checkbox, Notes
```

### 4. Explicit Save
```
User clicks "Track Application" → Data sent to backend → Saved to S3 + DynamoDB
```

### 5. Confirmation
```
Success message displayed → Popup auto-closes after 2 seconds
```

---

## 🎯 What Changed in Each File

### **content.js** - Simplified Extraction
**Removed:**
- Location extraction
- Industry detection
- Skills keyword matching (50+ skills)
- Description scraping for AI processing

**Kept:**
- Job page detection logic
- Role/position extraction
- Company name extraction
- Job URL capture

**Why:** Focus on essential data. Other fields (location, skills) can be added manually if needed, or tracked in the dashboard.

---

### **popup.js** - Prompt-Based Workflow
**Changed:**
- Renamed variables: `position` → `role`
- Removed AI skill vetting function
- Added temporary data storage (`tempSavedData`)
- Changed button text: "Save Application" → "Track Application"
- Removed auto-filled fields: location, industry, skills
- Added Notes textarea field
- Made DateApplied optional (can be blank if not yet applied)

**New User Flow:**
1. Detects job page
2. Prompts user with "Job application detected!"
3. Shows editable form with extracted data
4. User reviews, edits, adds notes
5. User explicitly clicks "Track Application"
6. Only then is data saved

---

### **popup.html** - Simplified Form
**Removed Fields:**
- Location input
- Industry input
- Top 3 Skills display (pink tags)

**Added Fields:**
- Notes textarea (optional)

**Kept Fields:**
- Role input
- Company input
- Job URL input
- Date Applied input (now optional)
- Resume upload
- Cover Letter checkbox

**UI Changes:**
- Changed `type="text"` to `type="date"` for Date Applied
- Added helper text: "Leave blank if you haven't applied yet"
- Increased textarea min-height for notes

---

### **server.js** - Updated Schema
**Changed Field Names:**
- `Position` → `Role`
- Removed: `Location`, `Industry`, `Skills`, `CreatedAt`
- Added: `Notes`, `DateScreening`, `DateInterview`, `DateAccepted`, `DateRejected`

**New Logic:**
- Only adds fields to DynamoDB if they have values (optional fields)
- Initializes future date fields as `null`
- Success message: "Job application tracked successfully!"

**DynamoDB Item Structure:**
```javascript
{
  ApplicationID: String (required),
  Role: String (required),
  Company: String (required),
  JobURL: String (required),
  DidCL: Boolean (required),
  DateApplied: String (optional),
  ResumeURL: String (optional),
  Notes: String (optional),
  DateScreening: null,
  DateInterview: null,
  DateAccepted: null,
  DateRejected: null
}
```

---

## 🎨 UI/UX Improvements

### Status Messages
- **Job Detected**: "📋 Job application detected!"
- **Not a Job**: "ℹ️ Not a job application page"
- **Loading**: "Checking if this is a job application..."
- **Success**: "✓ Application tracked successfully!"

### Form Behavior
- All fields are editable (even auto-filled ones)
- Date Applied can be left blank
- Notes field expands as you type
- Resume upload is optional
- Form validates before submission

### Button Text
- Primary button: "💾 Track Application"
- Secondary button: "🔄 Refresh"
- During save: "Saving..."

---

## 📊 Comparison: Old vs New

| Feature | Previous Version | New Version |
|---------|------------------|-------------|
| **Auto-save** | ❌ No | ❌ No (explicit click required) |
| **AI Integration** | ✅ Gemini for skills | ❌ Removed (not needed) |
| **Fields Tracked** | 11 fields | 12 fields (focused on lifecycle) |
| **Date Fields** | 1 (DateApplied) | 5 (Applied, Screening, Interview, Accepted, Rejected) |
| **Notes** | ❌ No | ✅ Yes |
| **Skills** | ✅ Top 3 AI-vetted | ❌ Removed |
| **Location** | ✅ Yes | ❌ Removed |
| **Industry** | ✅ Yes | ❌ Removed |
| **User Prompt** | ❌ No | ✅ Yes |
| **Temporary Storage** | ❌ No | ✅ Yes |

---

## 🔐 Security & Privacy

- ✅ No automatic data saving without user consent
- ✅ User must explicitly click "Track Application"
- ✅ Temporary data cleared if popup is closed without saving
- ✅ Resume files stored securely in private S3 bucket
- ✅ AWS credentials never exposed to frontend
- ✅ API keys stored in Chrome sync storage (encrypted)

---

## 🚀 Future Enhancements

### Possible Features to Add:
1. **Status Updates**: Update `DateScreening`, `DateInterview`, etc. from dashboard
2. **Edit Applications**: Modify saved applications later
3. **Dashboard Integration**: View all applications in Next.js dashboard
4. **Duplicate Detection**: Warn if applying to same role/company twice
5. **Application Stats**: Track success rates, avg time to response
6. **Follow-up Reminders**: Notifications for follow-ups
7. **Export**: Download applications as CSV/JSON
8. **Search**: Find applications by company, role, date range
9. **Tags**: Categorize applications (e.g., "High Priority", "Dream Job")
10. **Referral Tracking**: Note if application was through referral

---

## ✅ Migration Checklist

- [x] Updated DynamoDB schema documentation
- [x] Simplified content.js extraction (Role, Company, URL only)
- [x] Changed popup.js to prompt-based workflow
- [x] Removed AI skill vetting
- [x] Added Notes field to form
- [x] Made DateApplied optional
- [x] Updated backend to match new schema
- [x] Changed button text to "Track Application"
- [x] Added temporary data storage
- [x] Updated SETUP.md documentation
- [x] Updated MIGRATION_SUMMARY.md
- [x] Tested prompt workflow

---

## 📝 AWS Setup Reminder

### DynamoDB Table Creation (AWS CLI)
```bash
aws dynamodb create-table \
    --table-name JobApplications \
    --attribute-definitions AttributeName=ApplicationID,AttributeType=S \
    --key-schema AttributeName=ApplicationID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

### S3 Bucket Creation (AWS CLI)
```bash
aws s3 mb s3://job-applications-storage --region us-east-1
```

---

## 🎉 Summary

The Job Application Tracker now has a **prompt-based workflow** that:
1. ✅ Detects job pages intelligently
2. ✅ Temporarily stores extracted data
3. ✅ Prompts user to track application
4. ✅ Only saves on explicit user action
5. ✅ Supports application lifecycle tracking (screening → interview → acceptance/rejection)
6. ✅ Allows optional notes for each application
7. ✅ Maintains clean, focused schema

This approach gives users **full control** over what gets tracked and when! 🎯
