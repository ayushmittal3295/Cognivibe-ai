// backend/find-models.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function findModels() {
  console.log('🔍 Searching for available Gemini models...\n');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // List of possible model names to try
  const modelsToTry = [
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash-latest",
    "gemini-1.0-pro",
    "gemini-1.0-pro-latest",
    "gemini-pro",
    "gemini-pro-latest",
    "gemini-1.0-pro-vision-latest",
    "gemini-pro-vision",
    "models/gemini-1.5-pro",
    "models/gemini-1.0-pro"
  ];
  
  let workingModel = null;
  
  for (const modelName of modelsToTry) {
    try {
      process.stdout.write(`Testing ${modelName}... `);
      
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'hello' in one word");
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ WORKING! Response: "${text}"`);
      workingModel = modelName;
      break;
    } catch (error) {
      console.log(`❌ Failed: ${error.message.substring(0, 50)}...`);
    }
  }
  
  if (workingModel) {
    console.log(`\n🎉 SUCCESS! Working model: ${workingModel}`);
    console.log(`\nAdd this to your .env file:`);
    console.log(`GEMINI_MODEL=${workingModel}`);
  } else {
    console.log('\n❌ No working model found. Your API key might be invalid or not activated.');
    console.log('Please check:');
    console.log('1. Go to https://aistudio.google.com/');
    console.log('2. Make sure you have accepted the terms of service');
    console.log('3. Verify your API key is active');
  }
}

findModels();