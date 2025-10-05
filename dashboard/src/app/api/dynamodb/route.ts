import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// AWS DynamoDB Config
const ddbClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});
const docClient = DynamoDBDocumentClient.from(ddbClient);


// GET - fetch all DynamoDB records
export async function GET(req: NextRequest) {
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME || 'JobApplications'
        };

        const result = await docClient.send(new ScanCommand(params));

        return NextResponse.json({
            success: true,
            data: result.Items || [],
            count: result.Count || 0
        });

    } catch (err: any) {
        console.error('Error fetching data:', err);
        return NextResponse.json({
            success: false,
            message: err.message
        }, { status: 500 });
    }
}
