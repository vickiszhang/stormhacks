import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

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

// PUT - update DynamoDB record
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { ApplicationID, updates } = body;

        if (!ApplicationID) {
            return NextResponse.json({
                success: false,
                message: 'ApplicationID is required'
            }, { status: 400 });
        }

        if (!updates || typeof updates !== 'object') {
            return NextResponse.json({
                success: false,
                message: 'updates object is required'
            }, { status: 400 });
        }

        // Build update expression dynamically
        const updateExpressionParts: string[] = [];
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, any> = {};

        Object.keys(updates).forEach((key, index) => {
            const attrName = `#attr${index}`;
            const attrValue = `:val${index}`;
            updateExpressionParts.push(`${attrName} = ${attrValue}`);
            expressionAttributeNames[attrName] = key;
            expressionAttributeValues[attrValue] = updates[key];
        });

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME || 'JobApplications',
            Key: {
                ApplicationID: ApplicationID
            },
            UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW' as const
        };

        const result = await docClient.send(new UpdateCommand(params));

        return NextResponse.json({
            success: true,
            data: result.Attributes
        });

    } catch (err: any) {
        console.error('Error updating DynamoDB record:', err);
        return NextResponse.json({
            success: false,
            message: err.message
        }, { status: 500 });
    }
}
