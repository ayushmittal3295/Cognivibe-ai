const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ USE THIS WORKING MODEL (from your test)
const MODEL_NAME = "gemini-2.5-flash";

router.post('/', authenticate, async (req, res) => {
  try {
    const { message, mood, conversationHistory = [] } = req.body;
    const user = req.user;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('📨 Message received:', message);

    // Get the model - using the confirmed working model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const moodEmotion = mood?.emotion || 'neutral';
    const userName = user?.name || 'learner';
    
    // Build conversation history for context
    let historyText = '';
    if (conversationHistory && conversationHistory.length > 0) {
      historyText = 'Previous conversation:\n' + 
        conversationHistory.slice(-5).map(msg => 
          `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
        ).join('\n') + '\n\n';
    }
    
    // Create prompt with better context
    const prompt = `You are Cogni, a friendly AI learning assistant for Cognivibe AI platform. 
Current user: ${userName}
Their detected mood: ${moodEmotion}

${historyText}User: ${message}

Instructions:
- Provide helpful, accurate, and conversational responses
- If they ask about programming, give clear explanations with examples
- If they ask about themselves (like their name), use "${userName}" as their name
- Keep responses natural and engaging
- Match your tone to their mood (${moodEmotion})
- Be concise but informative

Assistant:`;

    console.log('🤖 Sending to Gemini...');

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Response received from Gemini');

    res.json({
      response: text,
      suggestions: ['Tell me more', 'Give an example', 'Next topic', 'Another question']
    });
    
  } catch (error) {
    console.error('❌ Gemini Error:', error);
    
    // Fallback response with personality
    res.json({
      response: `Hi ${user?.name || 'there'}! 😊 I'm Cogni, your AI learning assistant. I'd love to help you learn something today. What topic interests you?`,
      suggestions: ['JavaScript', 'Python', 'React', 'Project ideas']
    });
  }
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