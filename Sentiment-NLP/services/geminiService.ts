
import { GoogleGenAI, Type } from "@google/genai";
import { SentimentResult, SentimentType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the sentiment of the following text and provide a detailed breakdown: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: {
              type: Type.STRING,
              enum: [SentimentType.POSITIVE, SentimentType.NEGATIVE, SentimentType.NEUTRAL],
              description: "The primary sentiment of the text."
            },
            confidence: {
              type: Type.NUMBER,
              description: "A score between 0 and 1 representing the confidence level."
            },
            explanation: {
              type: Type.STRING,
              description: "A brief sentence explaining why this sentiment was chosen."
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key phrases or words that strongly influenced the sentiment."
            }
          },
          required: ["sentiment", "confidence", "explanation", "keywords"]
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    return result;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze sentiment. Please try again.");
  }
}
