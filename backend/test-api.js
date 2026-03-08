// backend/test-api.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAPI() {
  console.log('🔑 API Key present:', !!process.env.GEMINI_API_KEY);
  console.log('🔑 API Key (first 10 chars):', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try different model names
    const models = [
      "gemini-2.5-pro",
      "gemini-2.5-flash", 
      "gemini-3-flash-preview"
    ];
    
    for (const modelName of models) {
      try {
        console.log(`\n🤖 Testing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say hello in one word");
        const response = await result.response;
        console.log(`✅ SUCCESS with ${modelName}:`, response.text());
        console.log(`\n🎉 USE THIS MODEL: ${modelName}`);
        return;
      } catch (e) {
        console.log(`❌ ${modelName} failed:`, e.message);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();