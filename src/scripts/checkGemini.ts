import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import path from "path";
import axios from "axios";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("Error: GEMINI_API_KEY is not defined in .env file");
        return;
    }

    console.log("Attempting to list models using API key...");

    try {
        // Direct REST call to list models, bypassing SDK version potential issues
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        if (response.data && response.data.models) {
            console.log("✅ Available Models:");
            response.data.models.forEach((m: any) => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(", ")})`);
            });
        } else {
            console.log("No models found in response.");
        }

    } catch (error: any) {
        console.error("Error listing models:", error.response?.data || error.message);
    }
}

listModels();
