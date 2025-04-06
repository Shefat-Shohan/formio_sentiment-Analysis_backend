import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "./db.js";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export async function sentimentAnalysis(prompt) {
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });
  const result = await chatSession.sendMessage(prompt);
  const aiResponse = JSON.parse(result.response.text());
  return aiResponse;
}
