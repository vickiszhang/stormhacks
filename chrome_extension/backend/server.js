require('dotenv').config();

const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

// AWS Config
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const ddbClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});
const docClient = DynamoDBDocumentClient.from(ddbClient);

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Endpoint to upload job application
app.post('/upload-job', upload.single('resume'), async (req, res) => {
    try {
        console.log('Job application upload started');
        
        const { role, company, jobURL, dateApplied, didCL, notes } = req.body;
        const applicationID = uuidv4();

        let resumeKey = null;
        let resumeURL = null;

        // Upload Resume to S3 if provided
        if (req.file) {
            console.log('Uploading resume to S3...');
            resumeKey = `${applicationID}/resume-${req.file.originalname}`;
            
            await s3Client.send(new PutObjectCommand({
                Bucket: 'job-applications-storage',
                Key: resumeKey,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            }));
            
            resumeURL = `s3://job-applications-storage/${resumeKey}`;
            console.log('Resume uploaded successfully');
        }

        // Save metadata to DynamoDB
        console.log('Saving to DynamoDB...');
        const item = {
            ApplicationID: applicationID,
            Role: role || 'Unknown',
            Company: company || 'Unknown',
            JobURL: jobURL || '',
            DidCL: didCL === 'true' || didCL === true
        };

        // Only add optional fields if they exist
        if (dateApplied) item.DateApplied = dateApplied;
        if (resumeURL) item.ResumeURL = resumeURL;
        if (notes) item.Notes = notes;
        
        // Initialize other date fields as null (can be updated later)
        item.DateScreening = null;
        item.DateInterview = null;
        item.DateAccepted = null;
        item.DateRejected = null;

        const params = {
            TableName: 'JobApplications',
            Item: item
        };
        
        await docClient.send(new PutCommand(params));

        console.log('Job application saved successfully');
        res.json({ 
            success: true, 
            message: 'Job application tracked successfully!',
            applicationID: applicationID
        });
    } catch (err) {
        console.error('Error saving job application:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message || 'Failed to save job application'
        });
    }
});

// Endpoint to check for duplicate applications
app.post('/check-duplicate', async (req, res) => {
    try {
        const { jobURL, role, company } = req.body;
        
        if (!jobURL) {
            return res.json({ 
                isDuplicate: false,
                message: 'No job URL provided'
            });
        }

        // STEP 1: Check for exact URL match
        console.log('🔍 Checking for duplicate - URL:', jobURL);
        const urlParams = {
            TableName: 'JobApplications',
            FilterExpression: 'JobURL = :url',
            ExpressionAttributeValues: {
                ':url': jobURL
            }
        };

        const urlResult = await docClient.send(new ScanCommand(urlParams));
        
        if (urlResult.Items && urlResult.Items.length > 0) {
            const existingApp = urlResult.Items[0];
            console.log('✅ Found duplicate by URL:', existingApp.ApplicationID);
            return res.json({
                isDuplicate: true,
                matchType: 'url',
                existingApplication: {
                    role: existingApp.Role,
                    company: existingApp.Company,
                    dateApplied: existingApp.DateApplied,
                    applicationID: existingApp.ApplicationID
                },
                message: `You already tracked this exact job posting for ${existingApp.Role} at ${existingApp.Company} on ${existingApp.DateApplied || 'an earlier date'}.`
            });
        }

        // STEP 2: If no URL match and role/company provided, check for same role within same month
        if (role && company) {
            console.log('🔍 No URL match. Checking for same role in same month:', { role, company });
            
            // Get current month range
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
            
            console.log('📅 Current month range:', firstDayOfMonth, 'to', lastDayOfMonth);
            
            // Scan for matching role and company within current month
            const roleParams = {
                TableName: 'JobApplications',
                FilterExpression: 'Role = :role AND Company = :company AND DateApplied BETWEEN :startDate AND :endDate',
                ExpressionAttributeValues: {
                    ':role': role,
                    ':company': company,
                    ':startDate': firstDayOfMonth,
                    ':endDate': lastDayOfMonth
                }
            };

            const roleResult = await docClient.send(new ScanCommand(roleParams));
            
            if (roleResult.Items && roleResult.Items.length > 0) {
                const existingApp = roleResult.Items[0];
                console.log('✅ Found duplicate by role/company in same month:', existingApp.ApplicationID);
                return res.json({
                    isDuplicate: true,
                    matchType: 'role_month',
                    existingApplication: {
                        role: existingApp.Role,
                        company: existingApp.Company,
                        dateApplied: existingApp.DateApplied,
                        applicationID: existingApp.ApplicationID,
                        jobURL: existingApp.JobURL
                    },
                    message: `You already applied to ${existingApp.Role} at ${existingApp.Company} this month on ${existingApp.DateApplied}. This might be the same position.`
                });
            }
            
            console.log('✅ No duplicates found by role/company in same month');
        }

        console.log('✅ No duplicates found');
        res.json({ 
            isDuplicate: false,
            message: 'No duplicate found'
        });
    } catch (err) {
        console.error('❌ Error checking for duplicate:', err);
        res.status(500).json({ 
            isDuplicate: false,
            message: 'Error checking for duplicates',
            error: err.message
        });
    }
});

// AI verification endpoint using Gemini to verify if page is a job posting
app.post('/ai-verify-job', async (req, res) => {
    try {
        const { pageContent, url, title } = req.body;
        
        if (!pageContent || !url) {
            return res.status(400).json({ 
                success: false,
                message: 'Page content and URL are required'
            });
        }

        // Check if Gemini API key is configured
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return res.status(503).json({
                success: false,
                message: 'AI verification not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your .env file.'
            });
        }

        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        // Truncate content if too long (Gemini has token limits)
        const truncatedContent = pageContent.substring(0, 8000);

        const prompt = `Analyze this webpage and determine if it's a job application/posting page.

URL: ${url}
Page Title: ${title || 'N/A'}
Page Content (truncated):
${truncatedContent}

Task: Determine if this is a SPECIFIC job posting page (not a job search/listings page) and extract information.

Respond ONLY with valid JSON in this exact format:
{
    "isJobPage": true/false,
    "confidence": 0-100,
    "role": "extracted job title or null",
    "company": "extracted company name or null",
    "reasoning": "brief explanation of why this is or isn't a job page"
}

Rules:
- isJobPage should be TRUE only if this is a SPECIFIC job posting with a single role/position
- isJobPage should be FALSE for job search pages, listings, career home pages, or non-job pages
- Extract the exact job title/role if present (without company name)
- Extract the company name if present
- confidence: your certainty level (0-100)
- Keep reasoning brief (max 1 sentence)`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Parse JSON from response (handle potential markdown formatting)
        let jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not parse AI response');
        }
        
        const aiAnalysis = JSON.parse(jsonMatch[0]);
        
        console.log('AI Analysis:', aiAnalysis);
        
        res.json({
            success: true,
            ...aiAnalysis,
            url: url
        });

    } catch (err) {
        console.error('Error in AI verification:', err);
        res.status(500).json({ 
            success: false,
            message: err.message || 'AI verification failed'
        });
    }
});

// Legacy endpoint (keep for backward compatibility)
app.post('/upload', upload.fields([{ name: 'resume' }, { name: 'coverLetter' }]), async (req, res) => {
    try {
        console.log('Request started');
        
        const { company, role, jobURL, notes, didCL } = req.body;
        const applicationID = uuidv4();
        const dateApplied = new Date().toISOString();

        // Upload Resume
        console.log('Uploading resume...');
        const resumePath = path.join(__dirname, 'DavidLim_SDE_Resume.pdf');
        const resumeBuffer = fs.readFileSync(resumePath);
        const resumeKey = `${applicationID}/resume-DavidLim_SDE_Resume.pdf`;

        await s3Client.send(new PutObjectCommand({
            Bucket: 'job-applications-storage',
            Key: resumeKey,
            Body: resumeBuffer
        }));

        // Save metadata to DynamoDB
        console.log('Saving to DynamoDB...');
        const params = {
            TableName: 'JobApplications',
            Item: {
                ApplicationID: applicationID,
                Company: company,
                Role: role,
                JobURL: jobURL,
                ResumeURL: `s3://job-applications-storage/${resumeKey}`,
                DidCL: Boolean(didCL),
                Notes: notes,
                DateApplied: dateApplied
            }
        };
        await docClient.send(new PutCommand(params));

        console.log("Request completed")
        res.json({ success: true, message: 'Application uploaded!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));