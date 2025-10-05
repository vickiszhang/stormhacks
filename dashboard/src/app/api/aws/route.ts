import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// AWS Config
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

const ddbClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});
const docClient = DynamoDBDocumentClient.from(ddbClient);


// GET - fetch DynamoDB record
export async function GET(req: NextRequest) {
            console.log("SDADSAD")

    try {
        const { searchParams } = new URL(req.url);
        const applicationID = "08acf876-1dba-4765-9723-b750a417bb0d";

        console.log(searchParams)
        console.log(searchParams)
        console.log(searchParams)

        if (applicationID) {
            const params = {
                TableName: process.env.DYNAMODB_TABLE_NAME || 'JobApplications',
                Key: {
                    ApplicationID: applicationID
                }
            };

            const result = await docClient.send(new GetCommand(params));

            if (!result.Item) {
                return NextResponse.json({
                    success: false,
                    message: 'Application not found'
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                data: result.Item
            });
        }

        return NextResponse.json({
            success: false,
            message: 'applicationID is required'
        }, { status: 400 });

    } catch (err: any) {
        console.error('Error fetching data:', err);
        return NextResponse.json({
            success: false,
            message: err.message
        }, { status: 500 });
    }
}
