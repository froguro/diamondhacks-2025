const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://admin:WEiQqFlpp1DkgVxw@solz.3mnoret.mongodb.net/?retryWrites=true&w=majority&appName=solz';
const client = new MongoClient(mongoUri);
const dbName = 'test';
const collectionName = 'dailylogs';

async function generateAIResponse(userId) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const userEntries = await collection.find(
      { userId: new ObjectId(userId) },
      { sort: { date: -1 } }
    ).toArray();

    if (userEntries.length === 0) {
      throw new Error(`No entries found for user ${userId}`);
    }

    const prompt = `
You are a health assistant AI. Summarize the following user health data into a clear, readable summary.
Include: activity, sleep, heart rate, medical history, recent test results, and AI recommendations.
Set a goal for tomorrow based on the data.
Only mention information that is not within normal ranges. Praise the exceptional and point out what is concerning.

JSON:
${JSON.stringify(userEntries, null, 2)}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return summary;

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.close();
  }
}

module.exports = { generateAIResponse };
