const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Multiple models for rotation
const MODELS = [
  { name: "gemini-2.5-flash", usage: 0, limit: 20 },
  { name: "gemini-2.5-flash-lite", usage: 0, limit: 20 },
  { name: "gemini-2.5-pro", usage: 0, limit: 20 }
];

let currentModelIndex = 0;
let lastModelReset = Date.now();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getNextAvailableModel = () => {
  const now = Date.now();
  if (now - lastModelReset > 24 * 60 * 60 * 1000) {
    MODELS.forEach(m => m.usage = 0);
    lastModelReset = now;
    currentModelIndex = 0;
  }
  
  const startIndex = currentModelIndex;
  for (let i = 0; i < MODELS.length; i++) {
    const index = (startIndex + i) % MODELS.length;
    if (MODELS[index].usage < MODELS[index].limit) {
      currentModelIndex = (index + 1) % MODELS.length;
      MODELS[index].usage++;
      console.log(`✅ Using model: ${MODELS[index].name} (${MODELS[index].usage}/${MODELS[index].limit})`);
      return MODELS[index].name;
    }
  }
  return null;
};

router.post('/', authenticate, async (req, res) => {
  const MAX_RETRIES = 3;
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      const { message, mood, conversationHistory = [] } = req.body;
      const user = req.user;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      console.log('📨 Message received:', message);

      let modelName = getNextAvailableModel();
      
      if (!modelName) {
        modelName = MODELS[0].name;
      }

      const model = genAI.getGenerativeModel({ model: modelName });
      
      const moodEmotion = mood?.emotion || 'neutral';
      const userName = user?.name || 'learner';
      
      // Build FULL conversation history for context
      let historyText = '';
      if (conversationHistory && conversationHistory.length > 0) {
        historyText = 'Previous conversation:\n' + 
          conversationHistory.map(msg => 
            `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
          ).join('\n') + '\n\n';
      }
      
      // Enhanced prompt with better context retention
      const prompt = `You are Cogni, a friendly AI learning assistant for Cognivibe AI platform. 
Current user: ${userName}
Their detected mood: ${moodEmotion}

${historyText}User: ${message}

IMPORTANT INSTRUCTIONS:
1. Pay attention to the conversation history above - this is crucial for context
2. If the user says "yes" or "no", respond based on your last question
3. Be empathetic and helpful
4. If they ask for personal information (phone numbers, etc.), politely explain you can't share that
5. Keep responses natural and engaging

Assistant:`;

      console.log(`🤖 Attempt ${retryCount + 1} with ${modelName}...`);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Response received');

      return res.json({
        response: text,
        suggestions: ['Tell me more', 'Give an example', 'Next topic', 'Another question']
      });
      
    } catch (error) {
      console.error(`❌ Attempt ${retryCount + 1} failed:`, error.message);
      
      if (error.status === 429) {
        const modelIndex = MODELS.findIndex(m => m.name === error.model);
        if (modelIndex !== -1) {
          MODELS[modelIndex].usage = MODELS[modelIndex].limit;
        }
        retryCount++;
        await delay(1000 * retryCount);
        continue;
      } else if (error.status === 503) {
        // Service unavailable - just retry with next model immediately
        retryCount++;
        continue;
      } else {
        break;
      }
    }
  }
  
  // Fallback with better context awareness
  const userName = req.user?.name || 'there';
  const lastMessage = req.body.message?.toLowerCase() || '';
  
  // More intelligent fallback based on context
  let fallbackResponse = `Hi ${userName}! 😊 I'm Cogni, your AI learning assistant. `;
  
  if (lastMessage.includes('sad') || lastMessage.includes('depressed')) {
    fallbackResponse = `I hear you're feeling sad, ${userName}. 💙 Would you like to talk about it, or shall we do something to lift your mood?`;
  } else if (lastMessage.includes('phone') || lastMessage.includes('number')) {
    fallbackResponse = `I understand you're looking for contact information, ${userName}, but I don't have access to personal phone numbers. Is there something about technology or learning I can help you with instead?`;
  } else if (lastMessage === 'yes' || lastMessage === 'no') {
    fallbackResponse = `Thanks for your response, ${userName}! I want to make sure I understand correctly. Could you tell me more about what you'd like help with?`;
  } else {
    fallbackResponse = `Hi ${userName}! 😊 I'm Cogni, your AI learning assistant. I'd love to help you learn something today. What topic interests you?`;
  }
  
  res.json({
    response: fallbackResponse,
    suggestions: ['JavaScript', 'Python', 'React', 'Project ideas']
  });
});

router.post('/suggestions', authenticate, (req, res) => {
  res.json({
    suggestions: [
      { text: "Teach me JavaScript", icon: "📚" },
      { text: "Give me a quiz", icon: "🧠" },
      { text: "Project ideas", icon: "🚀" },
      { text: "Help with code", icon: "💻" }
    ]
  });
});

module.exports = router;