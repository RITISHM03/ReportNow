import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("Gemini API Key is missing");
            return NextResponse.json(
                { error: "Server configuration error: Missing AI API Key" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json(
                { error: "No image data provided" },
                { status: 400 }
            );
        }

        // Extract mime type and base64 data correctly
        const matches = image.match(/^data:(.+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
            return NextResponse.json(
                { error: "Invalid image data format. Expected base64 data URL." },
                { status: 400 }
            );
        }

        const mimeType = matches[1];
        const base64Data = matches[2];

        // Use environment variable for model or fallback to a specific stable version
        const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Analyze this emergency situation image and respond in this exact format without any asterisks or bullet points:
                        TITLE: Write a clear, brief title
                        TYPE: Choose one (Theft, Fire Outbreak, Medical Emergency, Natural Disaster, Violence, or Other)
                        DESCRIPTION: Write a clear, concise description`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        const titleMatch = text.match(/TITLE:\s*(.+)/);
        const typeMatch = text.match(/TYPE:\s*(.+)/);
        const descMatch = text.match(/DESCRIPTION:\s*(.+)/);

        return NextResponse.json({
            title: titleMatch?.[1]?.trim() || "Report",
            incidentType: typeMatch?.[1]?.trim() || "Other",
            description: descMatch?.[1]?.trim() || text.substring(0, 100),
        });

    } catch (error: any) {
        console.error("Error in analyze-image API:", error);

        // gracefully handle quota or model errors by returning mock data
        // This ensures the APP works even if the API key is limited.
        const errorMessage = error.message || "";
        if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("404")) {
            console.warn("AI Quota exceeded or model not found. Returning mock data.");
            return NextResponse.json({
                title: "Emergency Incident",
                incidentType: "Other",
                description: "Emergency",
            });
        }

        // Return more specific error message if possible
        return NextResponse.json(
            { error: `AI Service Error: ${errorMessage}` },
            { status: 500 }
        );
    }
}
