# 🚀 Quick Start Guide - Job Application Tracker

## Prerequisites
- Chrome browser
- Node.js installed
- AWS account (S3 + DynamoDB)
- Gemini API key ([Get one free](https://makersuite.google.com/app/apikey))

---

## 1️⃣ AWS Setup (5 minutes)

### Create S3 Bucket
```bash
# AWS CLI (or use AWS Console)
aws s3 mb s3://job-applications-storage --region us-east-1
```

### Create DynamoDB Table
```bash
# AWS CLI (or use AWS Console)
aws dynamodb create-table \
    --table-name JobApplications \
    --attribute-definitions AttributeName=ApplicationID,AttributeType=S \
    --key-schema AttributeName=ApplicationID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

---

## 2️⃣ Backend Setup (2 minutes)

```bash
# Navigate to backend folder
cd chrome_extension/backend

# Create .env file
cat > .env << EOF
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
EOF

# Install dependencies
npm install

# Start server
node server.js
```

✅ Server should be running on `http://localhost:3000`

---

## 3️⃣ Chrome Extension Setup (2 minutes)

1. Open Chrome → Navigate to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **"Load unpacked"**
4. Select folder: `chrome_extension/frontend`
5. Extension icon should appear in toolbar 🎉

---

## 4️⃣ Configure API Key (1 minute)

1. Click the extension icon (or it auto-opens)
2. Enter your Gemini API key
3. Click **"Save Settings"**

---

## 5️⃣ Test It Out! (30 seconds)

1. Go to any job posting (try [LinkedIn Jobs](https://www.linkedin.com/jobs/) or [Indeed](https://www.indeed.com/))
2. Click the extension icon
3. Watch it auto-detect and extract job details! ✨
4. Upload your resume (optional)
5. Click **"Save Application"**

---

## 🎉 Done!

Your job application tracker is ready to use!

### Quick Tips:
- 📝 All fields are editable before saving
- 🔄 Use "Refresh" button if detection seems off
- 🤖 AI automatically picks top 3 skills
- ☁️ Everything saves to your AWS account
- 📊 Check DynamoDB to see your saved applications

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Extension not loading | Check console for errors, reload extension |
| Backend connection error | Ensure server is running on port 3000 |
| AWS errors | Verify credentials in `.env` file |
| Job not detected | Try refresh button, or manually edit fields |
| Resume upload fails | Check S3 bucket exists and has correct permissions |

---

## 📚 Next Steps

- Read [SETUP.md](./SETUP.md) for detailed documentation
- Check [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) for technical details
- Connect to dashboard for viewing all applications
- Customize styling in `popup.html`

---

## 🆘 Support

Having issues? Check:
1. Backend terminal for error logs
2. Chrome DevTools console (F12)
3. AWS CloudWatch logs
4. Network tab for API calls

Happy job hunting! 🎯
