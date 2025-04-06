// Make sure to include the following import:
import {GoogleGenAI} from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "Write a story about a magic backpack.",
});
console.log(response.text);