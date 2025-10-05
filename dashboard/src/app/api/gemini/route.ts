import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { message, fileData, mimeType } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    let result;
    if (fileData && mimeType) {
      // Generate content with file upload
      result = await model.generateContent([
        {
          inlineData: {
            data: fileData,
            mimeType: mimeType,
          },
        },
        message,
      ]);
    } else {
      // Generate content with text only
      result = await model.generateContent(message);
    }

    const response = result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
