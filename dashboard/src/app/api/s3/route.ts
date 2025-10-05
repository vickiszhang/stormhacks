import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

// AWS S3 Config
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

// GET - fetch S3 object content
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

        // Fetch the actual file from S3
        const response = await s3Client.send(command);

        // Convert the stream to buffer
        const chunks = [];
        for await (const chunk of response.Body as any) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Convert to base64 for JSON transport
        const base64Data = buffer.toString('base64');

        // Determine proper MIME type - default to PDF if octet-stream
        let mimeType = response.ContentType || 'application/octet-stream';
        if (mimeType === 'application/octet-stream') {
            // Infer from file extension
            if (key.toLowerCase().endsWith('.pdf')) {
                mimeType = 'application/pdf';
            } else if (key.toLowerCase().endsWith('.docx')) {
                mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            } else if (key.toLowerCase().endsWith('.doc')) {
                mimeType = 'application/msword';
            } else if (key.toLowerCase().endsWith('.txt')) {
                mimeType = 'text/plain';
            }
        }

        return NextResponse.json({
            success: true,
            data: base64Data,
            contentType: mimeType,
            contentLength: response.ContentLength,
            bucket: bucket,
            key: key
        });

    } catch (err: any) {
        console.error('Error fetching S3 object:', err);
        return NextResponse.json({
            success: false,
            message: err.message
        }, { status: 500 });
    }
}
