import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for insights (mock data)
let insights: Array<{
    InsightID: string;
    Company: string;
    Role: string;
    Summary: string;
    CreatedAt: string;
}> = [];

// POST - save insight
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { company, role, summary } = body;

        if (!company || !role || !summary) {
            return NextResponse.json({
                success: false,
                message: 'company, role, and summary are required'
            }, { status: 400 });
        }

        const insightId = `insight-${Date.now()}`;
        const timestamp = new Date().toISOString();

        const newInsight = {
            InsightID: insightId,
            Company: company,
            Role: role,
            Summary: summary,
            CreatedAt: timestamp
        };

        insights.push(newInsight);

        return NextResponse.json({
            success: true,
            data: newInsight
        });

    } catch (err: any) {
        console.error('Error saving insight:', err);
        return NextResponse.json({
            success: false,
            message: err.message
        }, { status: 500 });
    }
}

// GET - fetch all insights
export async function GET(req: NextRequest) {
    try {
        return NextResponse.json({
            success: true,
            data: insights,
            count: insights.length
        });

    } catch (err: any) {
        console.error('Error fetching insights:', err);
        return NextResponse.json({
            success: false,
            message: err.message
        }, { status: 500 });
    }
}
