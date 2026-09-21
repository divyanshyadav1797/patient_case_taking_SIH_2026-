import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function testGemini() {
    try {
        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || "Gemini 3.5 Flash Lite",
            contents: "Reply with exactly: Quantum Care AI is working."
        });

        console.log("Gemini response:");
        console.log(response.text);
    } catch (error) {
        console.error("Gemini test failed:");
        console.error(error);
    }
}

testGemini();