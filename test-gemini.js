// Quick test script to debug Gemini API connectivity
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key (first 10 chars):', apiKey?.substring(0, 10) + '...');
  console.log('API Key length:', apiKey?.length);
  
  const ai = new GoogleGenAI({ apiKey });

  // Try multiple model names to find which one works
  const modelsToTry = [
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`\nTesting model: ${modelName}...`);
      const result = await ai.models.generateContent({
        model: modelName,
        contents: 'Say hello in one sentence.',
      });
      console.log(`SUCCESS with ${modelName}:`, result.text?.substring(0, 100));
      return; // Stop on first success
    } catch (err) {
      console.log(`FAILED with ${modelName}:`, err.message?.substring(0, 150));
    }
  }
  console.log('\nAll models failed. Please check your API key.');
}

test();
