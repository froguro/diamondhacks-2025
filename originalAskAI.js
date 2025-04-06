import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://admin:WEiQqFlpp1DkgVxw@solz.3mnoret.mongodb.net/?retryWrites=true&w=majority&appName=solz';
const client = new MongoClient(mongoUri);
const dbName = 'test';
const collectionName = 'dailylogs';

// const currentUserId = '67f23180703fd58151e01013';

const main = async () => {
  try {
    // Connect to MongoDB
    await client.connect();
    // console.log('✅ MongoDB connected successfully');

    const db = client.db(dbName);
    const collection = db.collection(collectionName); // Access the 'dailylogs' collection

    // Fetch all entries for the current user based on userId
    const userEntries = await collection.find(
      { userId: new ObjectId(currentUserId) },  // Filter by userId
      { sort: { date: -1 } }  // Sort by date in descending order
    ).toArray();

    if (userEntries.length === 0) {
      console.log(`No entries found for user ${currentUserId}`);
    } else {
      // Print only the entries for the current user
      // console.log('📄 Entries for User:', JSON.stringify(userEntries, null, 2));
    }

    // Prepare the prompt for Gemini model if needed
    const parsedData = userEntries;

    const prompt = `
You are a health assistant AI. Summarize the following user health data into a clear, readable summary.
Include: activity, sleep, heart rate, medical history, recent test results, and AI recommendations.
Set a goal for tomorrow based on the data.
Only mention information that is not within normal ranges. Praise the exceptional and point out what is concerning.

JSON:
${JSON.stringify(parsedData, null, 2)}
    `;

    // Send data to Gemini model for summary
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    // Extract summary from the model response
    const summary = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary) {
      throw new Error('No summary found in the model response.');
    }

    // Print the health summary
    console.log('📋 Health Summary:\n');
    console.log(summary);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close(); // Close MongoDB connection when done
  }
};

main(); // Call the main function
