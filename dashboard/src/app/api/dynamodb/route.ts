import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand, GetCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

// AWS DynamoDB Config
const ddbClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});
const docClient = DynamoDBDocumentClient.from(ddbClient);


// GET - fetch DynamoDB records (all or single by ApplicationID)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const applicationId = searchParams.get('applicationId');

        // If applicationId is provided, get single record
        if (applicationId) {
            const params = {
                TableName: process.env.DYNAMODB_TABLE_NAME || 'JobApplications',
                Key: {
                    ApplicationID: applicationId
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

        // Otherwise, fetch all records
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

// POST - create a new DynamoDB record
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { ApplicationID, ...applicationData } = body;

        if (!ApplicationID) {
            return NextResponse.json({
                success: false,
                message: 'ApplicationID is required'
            }, { status: 400 });
        }

        // Create the item with all provided data
        const item = {
            ApplicationID,
            ...applicationData
        };

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME || 'JobApplications',
            Item: item
        };

        await docClient.send(new PutCommand(params));

        return NextResponse.json({
            success: true,
            data: item,
            message: 'Application created successfully'
        });

    } catch (err: any) {
        console.error('Error creating DynamoDB record:', err);
        return NextResponse.json({
            success: false,
            message: err.message
        }, { status: 500 });
    }
}

// DELETE - delete a DynamoDB record
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const applicationId = searchParams.get('applicationId');

        if (!applicationId) {
            return NextResponse.json({
                success: false,
                message: 'applicationId parameter is required'
            }, { status: 400 });
        }

        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME || 'JobApplications',
            Key: {
                ApplicationID: applicationId
            }
        };

        await docClient.send(new DeleteCommand(params));

        return NextResponse.json({
            success: true,
            message: 'Application deleted successfully'
        });

    } catch (err: any) {
        console.error('Error deleting DynamoDB record:', err);
        return NextResponse.json({
            success: false,
            message: err.message
        }, { status: 500 });
    }
}
