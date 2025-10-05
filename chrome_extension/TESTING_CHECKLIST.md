# ✅ Testing Checklist - Job Application Tracker

Use this checklist to verify all functionality is working correctly.

---

## 🔧 Pre-Flight Checks

- [ ] Node.js installed (`node --version`)
- [ ] Chrome browser installed
- [ ] AWS account set up
- [ ] Gemini API key obtained
- [ ] Backend dependencies installed (`npm install`)
- [ ] `.env` file created with AWS credentials
- [ ] S3 bucket `job-applications-storage` exists
- [ ] DynamoDB table `JobApplications` exists

---

## 🚀 Backend Testing

### Server Startup
- [ ] Navigate to `chrome_extension/backend`
- [ ] Run `node server.js`
- [ ] Server starts without errors
- [ ] Console shows "Server running on port 3000"
- [ ] No AWS credential errors

### API Endpoint Test (Optional)
```bash
# Test with curl
curl -X POST http://localhost:3000/upload-job \
  -F "position=Software Engineer" \
  -F "company=Test Company" \
  -F "location=Remote" \
  -F "industry=Technology" \
  -F "dateApplied=2025-10-05" \
  -F "skills=Python, React, AWS" \
  -F "jobURL=https://example.com/job" \
  -F "didCL=true"
```

- [ ] Returns success response
- [ ] Data appears in DynamoDB

---

## 🌐 Extension Installation

### Load Extension
- [ ] Open Chrome
- [ ] Navigate to `chrome://extensions/`
- [ ] Developer mode enabled (top-right toggle)
- [ ] Click "Load unpacked"
- [ ] Select `chrome_extension/frontend` folder
- [ ] Extension loads without errors
- [ ] Extension icon visible in toolbar
- [ ] No errors in console (F12)

### First-Time Setup
- [ ] Options page opens automatically (or manually open it)
- [ ] Enter Gemini API key
- [ ] Click "Save Settings"
- [ ] Success message displays
- [ ] Page can be closed

---

## 🎯 Core Functionality Testing

### Test Case 1: LinkedIn Job Page
- [ ] Go to https://www.linkedin.com/jobs/
- [ ] Find any job posting
- [ ] Click extension icon
- [ ] Status shows "✓ Job posting detected!"
- [ ] Position field populated
- [ ] Company field populated
- [ ] Location extracted (or shows default)
- [ ] Industry detected (or shows default)
- [ ] Date defaults to today
- [ ] Top 3 skills displayed as pink tags
- [ ] Skills are relevant to job

### Test Case 2: Indeed Job Page
- [ ] Go to https://www.indeed.com/
- [ ] Find any job posting
- [ ] Click extension icon
- [ ] Job detected successfully
- [ ] Data extracted correctly

### Test Case 3: Company Career Page
- [ ] Go to any company's career page (e.g., Google, Microsoft, etc.)
- [ ] Find a job listing
- [ ] Click extension icon
- [ ] Job detected (or shows "not a job page" - acceptable)
- [ ] If detected, verify data extraction

### Test Case 4: Non-Job Page
- [ ] Go to https://www.google.com
- [ ] Click extension icon
- [ ] Shows "⚠️ This doesn't appear to be a job application page"
- [ ] Message is clear and helpful

---

## ✏️ Form Functionality

### Editable Fields
- [ ] Position field is editable
- [ ] Company field is editable
- [ ] Location field is editable
- [ ] Industry field is editable
- [ ] Date field is editable
- [ ] Skills are displayed (read-only tags)

### Resume Upload
- [ ] Click "Choose File" button
- [ ] Select a PDF file
- [ ] File name displays in input
- [ ] Non-PDF files rejected (optional)

### Cover Letter Checkbox
- [ ] Checkbox is clickable
- [ ] Can check and uncheck
- [ ] State persists while form is open

### Buttons
- [ ] "🔄 Refresh" button works
  - [ ] Reloads page data
  - [ ] Shows loading state
  - [ ] Re-renders form
- [ ] "💾 Save Application" button works
  - [ ] Changes to "Saving..." during request
  - [ ] Button disabled during save

---

## 💾 Save Functionality

### Successful Save
- [ ] Fill out all fields
- [ ] Upload resume (optional but recommended)
- [ ] Check/uncheck cover letter
- [ ] Click "Save Application"
- [ ] Loading indicator shows
- [ ] Success message displays: "✓ Application saved successfully!"
- [ ] Popup closes after 2 seconds

### Verify in AWS
- [ ] Check DynamoDB table
  - [ ] New entry exists
  - [ ] ApplicationID is a UUID
  - [ ] All fields populated correctly
  - [ ] DidCL is boolean true/false
  - [ ] CreatedAt timestamp present
- [ ] Check S3 bucket
  - [ ] Folder with ApplicationID exists
  - [ ] Resume file inside folder
  - [ ] File is downloadable
  - [ ] File opens correctly

### Error Handling
- [ ] Stop backend server
- [ ] Try to save application
- [ ] Error message displays
- [ ] Error is user-friendly
- [ ] Button re-enables

---

## 🤖 AI Features

### Skill Vetting
- [ ] Go to a tech job posting
- [ ] Click extension icon
- [ ] Wait for AI processing
- [ ] Top 3 skills are relevant
- [ ] Skills match job description
- [ ] Skills are properly formatted

### AI Fallback
- [ ] Remove or invalidate Gemini API key in settings
- [ ] Go to job page
- [ ] Click extension icon
- [ ] Still shows skills (fallback to basic extraction)
- [ ] No crashes or errors

---

## 🎨 UI/UX Testing

### Visual Design
- [ ] Colors match spec (#F9C6D7, #10559A)
- [ ] Header gradient looks good
- [ ] Form fields aligned properly
- [ ] Buttons styled correctly
- [ ] Skill tags are pink with proper styling
- [ ] No visual glitches
- [ ] Responsive layout (resize popup)

### Loading States
- [ ] Initial page scan shows loader
- [ ] Loader animation is smooth
- [ ] "Scanning page..." text visible
- [ ] Save button shows "Saving..."

### Messages
- [ ] Success messages are green
- [ ] Error messages are red
- [ ] Warning banners are orange
- [ ] Messages disappear appropriately

---

## 🔄 Edge Cases

### Empty/Missing Data
- [ ] Job page with no company name
  - [ ] Shows "Unknown Company" or similar
- [ ] Job page with no location
  - [ ] Shows "Not specified"
- [ ] Page with no detectable skills
  - [ ] Shows placeholder or empty
  - [ ] No crashes

### Network Issues
- [ ] Disconnect internet
- [ ] Try to save application
- [ ] Shows appropriate error message
- [ ] Reconnect internet
- [ ] Can retry successfully

### Large Resume Files
- [ ] Upload 5MB+ PDF
- [ ] Upload succeeds (or fails gracefully with message)

### Special Characters
- [ ] Job with emoji in title 🚀
- [ ] Company name with & or special chars
- [ ] Saves correctly without encoding issues

---

## 🔒 Security Testing

### API Key Storage
- [ ] Open Chrome DevTools (F12)
- [ ] Go to Application → Storage → Chrome Storage
- [ ] Verify API key is stored
- [ ] Key is encrypted/not in plain text in code

### Network Requests
- [ ] Open DevTools → Network tab
- [ ] Save an application
- [ ] Verify POST to http://localhost:3000/upload-job
- [ ] Check request payload (FormData)
- [ ] API key not in URL or visible in network logs

---

## 📱 Cross-Browser Testing (Optional)

### Chrome
- [ ] All features work

### Edge (Chromium)
- [ ] Extension loads
- [ ] All features work

---

## 🐛 Known Issues / Notes

Document any issues found:

1. ______________________________________
2. ______________________________________
3. ______________________________________

---

## ✅ Final Checklist

- [ ] All core functionality works
- [ ] Data saves to AWS correctly
- [ ] UI looks professional
- [ ] No console errors
- [ ] No crashes or freezes
- [ ] Error handling is graceful
- [ ] AI features work or fallback properly
- [ ] Documentation is accurate

---

## 🎉 Testing Complete!

If all items are checked, the extension is ready for use!

**Date Tested**: _______________  
**Tested By**: _______________  
**Chrome Version**: _______________  
**Extension Version**: 2.0

---

## 📝 Test Automation (Future)

Consider adding:
- [ ] Unit tests for content.js functions
- [ ] Integration tests for popup.js
- [ ] E2E tests with Puppeteer
- [ ] Backend API tests with Jest
- [ ] CI/CD pipeline with GitHub Actions
