import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { message, fileData, mimeType, files, url } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    let result;

    // Handle URL with files
    if (url && files && Array.isArray(files) && files.length > 0) {
      const parts = files.map((file: any) => ({
        inlineData: {
          data: file.fileData,
          mimeType: file.mimeType,
        },
      }));
      parts.push({ text: `Job Posting URL: ${url}\n\n${message}` });

      result = await model.generateContent(parts);
    }
    // Handle multiple files only
    else if (files && Array.isArray(files) && files.length > 0) {
      const parts = files.map((file: any) => ({
        inlineData: {
          data: file.fileData,
          mimeType: file.mimeType,
        },
      }));
      parts.push(message);

      result = await model.generateContent(parts);
    }
    // Handle single file (backward compatibility)
    else if (fileData && mimeType) {
      result = await model.generateContent([
        {
          inlineData: {
            data: fileData,
            mimeType: mimeType,
          },
        },
        message,
      ]);
    }
    // Handle URL only
    else if (url) {
      result = await model.generateContent(`Job Posting URL: ${url}\n\n${message}`);
    }
    // Text only
    else {
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
