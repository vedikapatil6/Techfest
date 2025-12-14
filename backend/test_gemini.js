const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModels() {
  const models = [
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro', 
    'gemini-pro',
    'models/gemini-pro'
  ];

  for (const modelName of models) {
    try {
      console.log(`\nTesting: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hello');
      const response = await result.response;
      console.log(`✅ ${modelName} WORKS!`);
      console.log('Response:', response.text().substring(0, 50));
      break;
    } catch (error) {
      console.log(`❌ ${modelName} failed:`, error.message);
    }
  }
}

testModels();