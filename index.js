import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const main = async () => {
  try {
    const jsonData = await fs.readFile('./mock.json', 'utf-8');
    const parsedData = JSON.parse(jsonData);

    const prompt = `
You are a health assistant AI. Summarize the following user health data into a clear, readable summary.
Include: activity, sleep, heart rate, medical history, recent test results, and AI recommendations. Set a goal for tomorrow based on the data. Only mention information that is not within normal ranges. Praise the exceptional and point out what is concerning.

JSON:
${JSON.stringify(parsedData, null, 2)}
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const summary = result.candidates[0].content.parts[0].text;

    if (!summary) {
      throw new Error('No summary found in the model response.');
    }

    console.log('📋 Health Summary:\n');
    console.log(summary);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

main();
