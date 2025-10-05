import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import {pdf} from 'pdf-parse';

// AWS S3 Config
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

// GET - fetch PDF from S3 and extract text
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const s3Url = searchParams.get('s3Url');

        if (!s3Url) {
            return NextResponse.json({
                success: false,
                message: 's3Url parameter is required'
            }, { status: 400 });
        }

        // Parse s3:// URL format: s3://bucket/key
        const s3UrlPattern = /^s3:\/\/([^\/]+)\/(.+)$/;
        const match = s3Url.match(s3UrlPattern);

        if (!match) {
            return NextResponse.json({
                success: false,
                message: 'Invalid S3 URL format. Expected: s3://bucket/key'
            }, { status: 400 });
        }

        const bucket = match[1];
        const key = match[2];

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });

        // Fetch the PDF file from S3
        const response = await s3Client.send(command);

        // Convert the stream to buffer
        const chunks = [];
        for await (const chunk of response.Body as any) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Extract text from PDF
        const pdfData = await pdf(buffer);

        return NextResponse.json({
            success: true,
            text: pdfData.text,
            pages: pdfData.numpages,
            info: pdfData.info,
            bucket: bucket,
            key: key
        });

    } catch (err: any) {
        console.error('Error extracting PDF text:', err);
        return NextResponse.json({
            success: false,
            message: err.message
        }, { status: 500 });
    }
}
