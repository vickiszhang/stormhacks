require('dotenv').config();

const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
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