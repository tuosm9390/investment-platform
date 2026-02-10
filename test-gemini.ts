import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

function getApiKey() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return null;
    const contents = fs.readFileSync(envPath, 'utf8');
    const match = contents.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
    return match ? match[1].trim() : null;
  } catch (e) {
    return null;
  }
}

async function listModels() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('API key not found in .env.local');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const modelsToTest = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-001', 'gemini-1.5-pro'];

  for (const modelName of modelsToTest) {
    try {
      console.log(`--- Testing ${modelName} ---`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hello');
      console.log(`SUCCESS: ${modelName}`);
      console.log(`Response: ${result.response.text().substring(0, 50)}...`);
    } catch (error: any) {
      console.error(`FAILURE: ${modelName}`);
      console.error(`Error: ${error.message}`);
    }
  }
}

listModels();
