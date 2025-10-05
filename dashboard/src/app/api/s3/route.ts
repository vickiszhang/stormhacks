import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// AWS S3 Config
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

// GET - fetch S3 object presigned URL
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

        // Generate a presigned URL that expires in 1 hour
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return NextResponse.json({
            success: true,
            url: signedUrl,
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
