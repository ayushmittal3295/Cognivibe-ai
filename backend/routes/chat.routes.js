const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');

// Chat endpoint with ChatGPT-like responses
router.post('/', authenticate, async (req, res) => {
  try {
    const { message, mood, conversationHistory = [] } = req.body;
    const user = req.user;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate intelligent ChatGPT-like response
    const response = generateChatGPTResponse(message, mood, user, conversationHistory);
    res.json(response);
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Main response generator - acts like ChatGPT
const generateChatGPTResponse = (message, mood, user, conversationHistory = []) => {
  const moodEmotion = mood?.emotion || 'neutral';
  const userName = user?.name || 'there';
  const lowerMessage = message.toLowerCase().trim();
  
  // Get conversation context
  const context = analyzeContext(conversationHistory, message);
  const lastTopic = context.lastTopic;
  const isFollowUp = context.isFollowUp;
  const userLevel = detectUserLevel(conversationHistory);
  
  // Generate response based on message type
  if (isGreeting(lowerMessage)) {
    return generateGreetingResponse(userName, moodEmotion, lastTopic);
  }
  
  if (isAboutIdentity(lowerMessage)) {
    return generateIdentityResponse(userName, moodEmotion);
  }
  
  if (isAboutCapabilities(lowerMessage)) {
    return generateCapabilitiesResponse(userName, moodEmotion);
  }
  
  if (isProgrammingQuestion(lowerMessage)) {
    return generateProgrammingResponse(message, lowerMessage, userName, moodEmotion, lastTopic, userLevel);
  }
  
  if (isLearningAdvice(lowerMessage)) {
    return generateLearningAdvice(userName, moodEmotion, lastTopic, userLevel);
  }
  
  if (isProjectQuestion(lowerMessage)) {
    return generateProjectResponse(userName, moodEmotion, lastTopic, userLevel);
  }
  
  if (isCodeHelpRequest(lowerMessage)) {
    return generateCodeHelpResponse(userName, moodEmotion);
  }
  
  if (isQuizRequest(lowerMessage)) {
    return generateQuizResponse(userName, moodEmotion, lastTopic);
  }
  
  if (isEmotionalExpression(lowerMessage)) {
    return generateEmotionalResponse(message, userName, moodEmotion);
  }
  
  if (isBreakRequest(lowerMessage)) {
    return generateBreakResponse(userName, moodEmotion);
  }
  
  if (isThanks(lowerMessage)) {
    return generateThanksResponse(userName);
  }
  
  if (isGoodbye(lowerMessage)) {
    return generateGoodbyeResponse(userName);
  }
  
  // For anything else, generate a natural conversation response
  return generateNaturalResponse(message, userName, moodEmotion, lastTopic, context);
};

// Context analysis
const analyzeContext = (history, currentMessage) => {
  const context = {
    lastTopic: null,
    isFollowUp: false,
    conversationLength: history.length,
    recentTopics: []
  };
  
  if (history && history.length > 0) {
    const lastMessages = history.slice(-3);
    const topics = [];
    
    lastMessages.forEach(msg => {
      const text = msg.text.toLowerCase();
      if (text.includes('javascript') || text.includes('js')) topics.push('javascript');
      if (text.includes('python')) topics.push('python');
      if (text.includes('react')) topics.push('react');
      if (text.includes('java') && !text.includes('javascript')) topics.push('java');
      if (text.includes('html')) topics.push('html');
      if (text.includes('css')) topics.push('css');
    });
    
    context.recentTopics = [...new Set(topics)];
    context.lastTopic = context.recentTopics[0] || null;
    
    // Check if current message is a follow-up (short, no new topic)
    const currentLower = currentMessage.toLowerCase();
    const hasNewTopic = ['javascript','python','react','java','html','css'].some(t => currentLower.includes(t));
    context.isFollowUp = !hasNewTopic && currentLower.split(' ').length < 5;
  }
  
  return context;
};

// Detect user's experience level from conversation
const detectUserLevel = (history) => {
  if (!history || history.length < 3) return 'beginner';
  
  const allText = history.map(h => h.text.toLowerCase()).join(' ');
  const advancedTerms = ['closure', 'prototype', 'async', 'promise', 'decorator', 'generator', 'webpack', 'typescript'];
  const beginnerTerms = ['what is', 'how to start', 'beginner', 'simple', 'easy', 'basic'];
  
  const advancedCount = advancedTerms.filter(t => allText.includes(t)).length;
  const beginnerCount = beginnerTerms.filter(t => allText.includes(t)).length;
  
  if (advancedCount > beginnerCount + 2) return 'advanced';
  if (beginnerCount > advancedCount) return 'beginner';
  return 'intermediate';
};

// Message type detectors
const isGreeting = (msg) => {
  return /^(hi|hello|hey|hola|greetings|sup|howdy|good morning|good afternoon|good evening)$/i.test(msg) ||
         msg.includes('hi ') || msg.includes('hello ') || msg === 'hi' || msg === 'hello';
};

const isAboutIdentity = (msg) => {
  return msg.includes('who are you') || msg.includes('what are you') || msg.includes('your name');
};

const isAboutCapabilities = (msg) => {
  return msg.includes('what can you do') || msg.includes('help me') || msg.includes('capabilities') ||
         msg.includes('what do you do') || msg.includes('how can you help');
};

const isProgrammingQuestion = (msg) => {
  const programmingTerms = ['javascript', 'python', 'react', 'java', 'html', 'css', 'node', 'express', 
                           'function', 'variable', 'array', 'object', 'class', 'code', 'programming', 
                           'coding', 'develop', 'software', 'app', 'web', 'website'];
  return programmingTerms.some(term => msg.includes(term));
};

const isLearningAdvice = (msg) => {
  return msg.includes('learn') || msg.includes('study') || msg.includes('course') || 
         msg.includes('tutorial') || msg.includes('what should i learn') || msg.includes('recommend');
};

const isProjectQuestion = (msg) => {
  return (msg.includes('project') || msg.includes('build') || msg.includes('create') || 
          msg.includes('make')) && (msg.includes('idea') || msg.includes('suggest') || 
          msg.includes('what') || msg.includes('can i'));
};

const isCodeHelpRequest = (msg) => {
  return msg.includes('code') || msg.includes('debug') || msg.includes('error') || 
         msg.includes('bug') || msg.includes('not working') || msg.includes('help with');
};

const isQuizRequest = (msg) => {
  return msg.includes('quiz') || msg.includes('test') || msg.includes('exam') || 
         msg.includes('challenge') || msg.includes('practice question');
};

const isEmotionalExpression = (msg) => {
  return msg.includes('feel') || msg.includes('emotion') || msg.includes('mood') || 
         msg.includes('sad') || msg.includes('happy') || msg.includes('angry') || 
         msg.includes('frustrated') || msg.includes('confused') || msg.includes('stuck');
};

const isBreakRequest = (msg) => {
  return msg.includes('tired') || msg.includes('break') || msg.includes('rest') || 
         msg.includes('burnout') || msg.includes('exhausted') || msg.includes('fatigue');
};

const isThanks = (msg) => {
  return msg.includes('thank') || msg.includes('thanks') || msg.includes('appreciate');
};

const isGoodbye = (msg) => {
  return msg.includes('bye') || msg.includes('goodbye') || msg.includes('see you') || 
         msg.includes('later') || msg.includes('cya');
};

// Response generators
const generateGreetingResponse = (userName, mood, lastTopic) => {
  const greetings = [
    `Hey ${userName}! 👋 Great to see you! How can I help with your learning today?`,
    `Hello ${userName}! 😊 Ready to learn something new? I'm here to help!`,
    `Hi ${userName}! 💡 What would you like to explore today?`,
    `Hey there, ${userName}! 🌟 How's your learning journey going?`,
    `Hello! 👋 I'm Cogni, your AI learning assistant. What can I teach you today, ${userName}?`
  ];
  
  const moodBased = mood === 'happy' ? ' You seem in a great mood for learning!' :
                    mood === 'sad' ? ' I hope I can help brighten your day with some learning.' :
                    mood === 'angry' ? ' Let\'s channel that energy into something productive!' :
                    mood === 'calm' ? ' Perfect mindset for deep learning.' : '';
  
  const topicFollowup = lastTopic ? ` Shall we continue with ${lastTopic} or explore something new?` : '';
  
  const response = greetings[Math.floor(Math.random() * greetings.length)] + moodBased + topicFollowup;
  
  return {
    response,
    suggestions: ['Learn JavaScript', 'Get project ideas', 'Ask about Python', 'Take a quiz']
  };
};

const generateIdentityResponse = (userName, mood) => {
  const responses = [
    `I'm Cogni, your personal AI learning assistant! 🤖 Think of me as your friendly tutor who's always here to help you master programming and technology. I can explain concepts, suggest projects, answer questions, and even adapt to your mood! Right now I can see you're feeling ${mood}. What would you like to learn today?`,
    
    `I'm Cogni! 🧠 Your intelligent learning companion. I specialize in programming, web development, and tech education. I'm like having a 24/7 tutor who knows your learning style and adapts to your emotional state. Since you're feeling ${mood}, I'll adjust my teaching approach accordingly. Ready to learn something amazing?`,
    
    `Great question! I'm Cogni, an AI assistant designed specifically for learning programming and technology. 🌟 I can help you understand concepts, debug code, suggest projects, and keep you motivated. Based on your ${mood} mood, I'll tailor my responses to match your energy. What would you like to dive into?`
  ];
  
  return {
    response: responses[Math.floor(Math.random() * responses.length)],
    suggestions: ['What can you do?', 'Teach me JavaScript', 'Give me a challenge', 'I need help']
  };
};

const generateCapabilitiesResponse = (userName, mood) => {
  const response = `I can help you with so many things! 🚀\n\n` +
    `**📚 Learn Programming** - JavaScript, Python, React, Node.js, HTML/CSS, Java, and more\n` +
    `**🔍 Explain Concepts** - Break down complex topics into simple, digestible pieces\n` +
    `**💡 Project Ideas** - Personalized suggestions based on your skill level and interests\n` +
    `**🐛 Code Help** - Debug issues, improve code quality, and understand errors\n` +
    `**📝 Quizzes & Challenges** - Test your knowledge and track progress\n` +
    `**🧘 Learning Support** - I adapt to your mood (right now you're feeling ${mood})\n` +
    `**🎯 Career Guidance** - Advice on learning paths and tech careers\n\n` +
    `What would you like to explore first, ${userName}?`;
  
  return {
    response,
    suggestions: ['Teach me JavaScript', 'Project ideas', 'Take a quiz', 'Career advice']
  };
};

const generateProgrammingResponse = (originalMsg, lowerMsg, userName, mood, lastTopic, userLevel) => {
  
  // JavaScript responses
  if (lowerMsg.includes('javascript') || lowerMsg.includes('js')) {
    if (lowerMsg.includes('function')) {
      return {
        response: `Functions are one of the most important concepts in JavaScript! They're reusable blocks of code that perform specific tasks. Here's a simple example:\n\n` +
          `\`\`\`javascript\n// Function declaration\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\n// Arrow function (modern syntax)\nconst greet = (name) => \`Hello, \${name}!\`;\n\n// Using the function\nconsole.log(greet('${userName}')); // Output: Hello, ${userName}!\n\`\`\`\n\n` +
          `Functions can accept parameters, return values, and even be passed as arguments to other functions (callbacks). Would you like to learn about arrow functions, parameters, scope, or maybe practice writing some functions?`,
        suggestions: ['Arrow functions', 'Parameters', 'Scope', 'Practice']
      };
    }
    
    if (lowerMsg.includes('array')) {
      return {
        response: `Arrays in JavaScript are like ordered lists that can hold multiple values. They're incredibly versatile! Here are some common array operations:\n\n` +
          `\`\`\`javascript\nconst fruits = ['apple', 'banana', 'orange'];\n\n// Add to end\nfruits.push('grape');\n\n// Remove from end\nconst last = fruits.pop();\n\n// Loop through array\nfruits.forEach(fruit => console.log(fruit));\n\n// Transform array\nconst uppercased = fruits.map(f => f.toUpperCase());\n\`\`\`\n\n` +
          `Arrays have powerful methods like map, filter, reduce, and more. Which would you like to explore?`,
        suggestions: ['map method', 'filter method', 'reduce', 'array exercises']
      };
    }
    
    if (lowerMsg.includes('promise') || lowerMsg.includes('async')) {
      return {
        response: `Promises and async/await are how JavaScript handles asynchronous operations! They're essential for API calls, file operations, and any task that takes time.\n\n` +
          `\`\`\`javascript\n// Using Promises\nfetch('https://api.example.com/data')\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error(error));\n\n// Using async/await (cleaner syntax)\nasync function getData() {\n  try {\n    const response = await fetch('https://api.example.com/data');\n    const data = await response.json();\n    console.log(data);\n  } catch (error) {\n    console.error(error);\n  }\n}\n\`\`\`\n\n` +
          `This is intermediate/advanced stuff. Would you like me to explain promises in more detail, or show more async/await examples?`,
        suggestions: ['Promises explained', 'Async/await', 'Error handling', 'Practice']
      };
    }
    
    // Default JavaScript response
    const levelBased = userLevel === 'beginner' ? 
      'start with the fundamentals like variables, data types, and functions' :
      userLevel === 'intermediate' ?
      'explore DOM manipulation, events, and async programming' :
      'dive into advanced concepts like closures, prototypes, and design patterns';
    
    return {
      response: `JavaScript is the language of the web! 🌐 It's essential for frontend development and increasingly popular on the backend with Node.js. Based on your level, I'd suggest you ${levelBased}.\n\n` +
        `Here's a quick example to get started:\n\n` +
        `\`\`\`javascript\n// Variables\nlet name = "${userName}";\nconst age = 25;\n\n// Function\nfunction sayHello() {\n  console.log(\`Hello, \${name}!\`);\n}\n\n// Call it\nsayHello();\n\`\`\`\n\n` +
        `What specific aspect of JavaScript would you like to learn about?`,
      suggestions: ['Variables', 'Functions', 'Arrays', 'DOM', 'Projects']
    };
  }
  
  // Python responses
  if (lowerMsg.includes('python')) {
    return {
      response: `Python is an elegant and powerful language! 🐍 It's great for beginners and used extensively in data science, AI, web development, and automation.\n\n` +
        `Here's a simple Python example:\n\n` +
        `\`\`\`python\n# Variables\nname = "${userName}"\nage = 25\n\n# Function\ndef greet(name):\n    return f"Hello, {name}!"\n\n# List (like array)\nfruits = ["apple", "banana", "orange"]\n\n# Loop\nfor fruit in fruits:\n    print(fruit)\n\n# Dictionary (like object)\nperson = {"name": "${userName}", "age": 25}\n\`\`\`\n\n` +
        `Python emphasizes readability and has a gentle learning curve. What would you like to explore - basics, data structures, web frameworks like Django/Flask, or something else?`,
      suggestions: ['Python basics', 'Data structures', 'Django', 'Projects']
    };
  }
  
  // Java responses
  if (lowerMsg.includes('java') && !lowerMsg.includes('javascript')) {
    return {
      response: `Java is a robust, object-oriented programming language ☕ that's used for Android apps, enterprise software, and large-scale systems. It's known for its "write once, run anywhere" philosophy.\n\n` +
        `Here's a simple Java class:\n\n` +
        `\`\`\`java\npublic class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, ${userName}!");\n    }\n}\n\`\`\`\n\n` +
        `Java is strongly-typed and follows OOP principles. Would you like to learn about classes, inheritance, or maybe compare it with other languages?`,
      suggestions: ['Classes & Objects', 'Inheritance', 'Java vs Python', 'Simple program']
    };
  }
  
  // React responses
  if (lowerMsg.includes('react')) {
    return {
      response: `React is a powerful library for building user interfaces! ⚛️ It's component-based, which means you build encapsulated pieces that manage their own state.\n\n` +
        `Here's a simple React component:\n\n` +
        `\`\`\`jsx\nfunction Welcome({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n\n// Usage\n<Welcome name="${userName}" />\n\`\`\`\n\n` +
        `React uses JSX (JavaScript + HTML), hooks for state management, and a virtual DOM for performance. Would you like to learn about components, hooks, props, or maybe build a small app?`,
      suggestions: ['Components', 'useState hook', 'Props', 'Build an app']
    };
  }
  
  // HTML/CSS responses
  if (lowerMsg.includes('html') || lowerMsg.includes('css')) {
    return {
      response: `HTML and CSS are the foundation of the web! 🏗️ HTML provides structure, while CSS adds styling and layout.\n\n` +
        `**HTML Example:**\n\`\`\`html\n<div class="card">\n  <h1>Hello, ${userName}!</h1>\n  <p>Welcome to web development.</p>\n</div>\n\`\`\`\n\n` +
        `**CSS Example:**\n\`\`\`css\n.card {\n  background: white;\n  border-radius: 8px;\n  padding: 20px;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n}\n\`\`\`\n\n` +
        `What would you like to learn - HTML tags, CSS selectors, Flexbox, Grid, or maybe build a page?`,
      suggestions: ['HTML basics', 'CSS selectors', 'Flexbox', 'Build a page']
    };
  }
  
  // Default fallback for programming questions
  return {
    response: `That's a great programming topic! 💻 To give you the best explanation, could you be a bit more specific? For example:\n\n` +
      `- "Explain JavaScript functions"\n` +
      `- "How do I use arrays in Python?"\n` +
      `- "What is React useState?"\n` +
      `- "Show me HTML examples"\n\n` +
      `I'm here to help with whatever you need!`,
    suggestions: ['JavaScript functions', 'Python arrays', 'React hooks', 'HTML basics']
  };
};

const generateLearningAdvice = (userName, mood, lastTopic, userLevel) => {
  const advice = {
    beginner: [
      `For a beginner, I'd recommend starting with HTML/CSS to understand web basics, then JavaScript for interactivity. Python is also an excellent first language.`,
      `Start with the fundamentals: HTML for structure, CSS for styling, and JavaScript for behavior. Take it step by step!`,
      `The best way to start is with a beginner-friendly language like Python or JavaScript. Focus on understanding variables, loops, and functions first.`
    ],
    intermediate: [
      `Since you have some experience, you might want to explore frameworks like React for frontend or Node.js/Express for backend. Building projects is key at this stage!`,
      `Consider diving deeper into a language - maybe learn advanced JavaScript concepts, or explore Python for data science.`,
      `This is a great time to start building real projects. A todo app, weather app, or portfolio site would be perfect practice.`
    ],
    advanced: [
      `At your level, you might enjoy exploring system design, algorithms, or diving into specialized areas like machine learning, cloud computing, or mobile development.`,
      `Consider contributing to open source, learning about software architecture, or mastering a framework like React or Django.`,
      `You could explore advanced topics like design patterns, performance optimization, or even learn a new paradigm like functional programming.`
    ]
  };
  
  const level = userLevel || 'beginner';
  const randomAdvice = advice[level][Math.floor(Math.random() * advice[level].length)];
  
  const moodNote = mood === 'happy' ? ' Your enthusiasm will make learning even more effective!' :
                   mood === 'sad' ? ' Take it easy - even small steps count.' :
                   mood === 'angry' ? ' Channel that energy into problem-solving!' : '';
  
  return {
    response: `Great question about learning! 🎓 ${randomAdvice}${moodNote}\n\nWhat specific area interests you most?`,
    suggestions: ['Web development', 'Python', 'JavaScript', 'Project ideas']
  };
};

const generateProjectResponse = (userName, mood, lastTopic, userLevel) => {
  const projects = {
    beginner: [
      '**Personal Portfolio** - A simple website showcasing your skills',
      '**Todo List App** - Classic project to learn CRUD operations',
      '**Weather App** - Fetch and display weather data from an API',
      '**Calculator** - Build a functional calculator with HTML/CSS/JS',
      '**Blog Website** - Simple blog with HTML/CSS and maybe a CMS'
    ],
    intermediate: [
      '**E-commerce Site** - Product listings, cart, checkout flow',
      '**Social Media Dashboard** - Display analytics with charts',
      '**Chat Application** - Real-time messaging with Socket.io',
      '**Recipe Finder** - Search and filter recipes from an API',
      '**Task Manager** - Full-stack app with user authentication'
    ],
    advanced: [
      '**Netflix Clone** - Video streaming platform with React',
      '**Project Management Tool** - Like Trello with drag-and-drop',
      '**Real-time Collaboration App** - Google Docs clone',
      '**E-learning Platform** - Courses, quizzes, progress tracking',
      '**AI Image Generator** - Integrate with DALL-E or similar API'
    ]
  };
  
  const level = userLevel || 'beginner';
  const projectList = projects[level];
  const randomProjects = projectList.sort(() => 0.5 - Math.random()).slice(0, 3);
  
  const topicSuggestion = lastTopic ? ` Since you're interested in ${lastTopic}, ` : ' ';
  
  return {
    response: `Great idea, ${userName}! 🚀 Based on your ${level} level,${topicSuggestion}here are some project suggestions:\n\n` +
      randomProjects.map((p, i) => `${i+1}. ${p}`).join('\n') +
      `\n\nWhich one sounds interesting? I can help you plan it out step by step!`,
    suggestions: randomProjects.map(p => p.split('**')[1] || p.split(' ')[0])
  };
};

const generateCodeHelpResponse = (userName, mood) => {
  return {
    response: `I'd be happy to help with your code! 💻 To give you the best assistance, could you share:\n\n` +
      `1. **What language/framework** you're using (JavaScript, Python, React, etc.)\n` +
      `2. **What you're trying to accomplish**\n` +
      `3. **What's happening vs what you expect**\n` +
      `4. **Any error messages** you're seeing (if applicable)\n\n` +
      `The more details you provide, the better I can help! 🎯`,
    suggestions: ['JavaScript help', 'Python help', 'Debug error', 'Share my code']
  };
};

const generateQuizResponse = (userName, mood, lastTopic) => {
  const topic = lastTopic || 'JavaScript';
  
  const quizzes = {
    javascript: {
      question: 'What will `console.log(typeof [])` output in JavaScript?',
      options: ['"array"', '"object"', '"undefined"', '"function"'],
      answer: 'b'
    },
    python: {
      question: 'What is the output of `print(type([]))` in Python?',
      options: ['<class \'list\'>', '<class \'array\'>', '<class \'dict\'>', '<class \'tuple\'>'],
      answer: 'a'
    },
    react: {
      question: 'Which hook is used for side effects in React?',
      options: ['useState', 'useEffect', 'useContext', 'useReducer'],
      answer: 'b'
    }
  };
  
  const quiz = quizzes[topic.toLowerCase()] || quizzes.javascript;
  
  return {
    response: `Ready for a quick ${topic} quiz? 🧠 Here you go:\n\n` +
      `**Question:** ${quiz.question}\n\n` +
      `a) ${quiz.options[0]}\n` +
      `b) ${quiz.options[1]}\n` +
      `c) ${quiz.options[2]}\n` +
      `d) ${quiz.options[3]}\n\n` +
      `What's your answer? (Type a, b, c, or d)`,
    suggestions: ['a', 'b', 'c', 'd', 'Another question']
  };
};

const generateEmotionalResponse = (message, userName, mood) => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('sad') || lowerMsg.includes('down') || lowerMsg.includes('depressed')) {
    return {
      response: `I'm sorry you're feeling this way, ${userName}. 💙 It's completely normal to have ups and downs. Sometimes learning something new can be a gentle distraction, but only if you're up for it. Would you like some uplifting content, a simple coding exercise, or would you prefer to talk about what's bothering you?`,
      suggestions: ['Uplifting content', 'Easy coding', 'Tell me more', 'Take a break']
    };
  }
  
  if (lowerMsg.includes('angry') || lowerMsg.includes('frustrated') || lowerMsg.includes('annoyed')) {
    return {
      response: `I hear your frustration, ${userName}. 😤 When coding gets frustrating, it's often a sign you're about to learn something important! Want to channel that energy into solving a challenging problem together, or would a short break help clear your mind?`,
      suggestions: ['Solve a problem', 'Take a break', 'Debug help', 'Calming exercise']
    };
  }
  
  if (lowerMsg.includes('confused') || lowerMsg.includes('lost') || lowerMsg.includes('understand')) {
    return {
      response: `Feeling confused is actually a sign of learning, ${userName}! 🧠 It means you're pushing beyond what you already know. Let's break things down together. What concept is causing trouble? I can explain it differently or with simpler examples.`,
      suggestions: ['Explain simply', 'Show examples', 'Different approach', 'Take a break']
    };
  }
  
  if (lowerMsg.includes('happy') || lowerMsg.includes('excited') || lowerMsg.includes('great')) {
    return {
      response: `That's wonderful, ${userName}! 😊 Your positive energy is perfect for learning. This is a great time to tackle something challenging or creative. What exciting topic shall we explore together?`,
      suggestions: ['Creative project', 'Advanced topic', 'Fun challenge', 'Share success']
    };
  }
  
  // Default emotional response
  return {
    response: `Thanks for sharing how you feel, ${userName}. Your emotional state matters, and I'm here to support your learning journey whatever mood you're in. How can I best help you right now?`,
    suggestions: ['Learn something', 'Take a break', 'Get motivated', 'Just chat']
  };
};

const generateBreakResponse = (userName, mood) => {
  const breaks = [
    `Taking breaks is essential for effective learning, ${userName}! ⏰ Why not take 5-10 minutes to:\n\n• Stand up and stretch\n• Grab some water\n• Look out the window (rest your eyes)\n• Take a few deep breaths\n\nI'll be right here when you return!`,
    
    `Good idea to take a break, ${userName}! 🧘 Here's a quick reset:\n\n1. Close your eyes for 60 seconds\n2. Take 5 deep breaths (in through nose, out through mouth)\n3. Roll your shoulders and neck\n4. Stretch your arms and hands\n\nFeel better? Ready to continue when you are!`,
    
    `Your brain will thank you for this break, ${userName}! 🌟 Even 5 minutes away from the screen helps consolidate learning and prevent burnout. Take the time you need - I'm not going anywhere!`
  ];
  
  return {
    response: breaks[Math.floor(Math.random() * breaks.length)],
    suggestions: ['Back from break', 'Continue learning', 'Short break done', 'Feel better']
  };
};

const generateThanksResponse = (userName) => {
  const thanks = [
    `You're very welcome, ${userName}! 😊 I'm always happy to help. What would you like to learn next?`,
    `My pleasure, ${userName}! 🌟 That's what I'm here for. Any other questions?`,
    `Glad I could help, ${userName}! 🚀 Keep the questions coming!`,
    `Anytime, ${userName}! 💡 Learning together is what makes this fun. What's next on your mind?`
  ];
  
  return {
    response: thanks[Math.floor(Math.random() * thanks.length)],
    suggestions: ['Another question', 'New topic', 'That\'s all', 'Keep going']
  };
};

const generateGoodbyeResponse = (userName) => {
  return {
    response: `Goodbye, ${userName}! 👋 Remember, I'm always here when you need help with your learning journey. Keep coding, stay curious, and come back anytime! 🚀`,
    suggestions: ['Thanks!', 'See you later', 'Back to learning']
  };
};

const generateNaturalResponse = (message, userName, mood, lastTopic, context) => {
  // For follow-up questions
  if (context.isFollowUp && lastTopic) {
    return {
      response: `Could you tell me more about what you'd like to know regarding ${lastTopic}? I'm happy to dive deeper or explain it differently.`,
      suggestions: ['Explain more', 'Give examples', 'Different approach', 'Related topic']
    };
  }
  
  // For longer messages (user is explaining something)
  if (message.length > 100) {
    return {
      response: `Thanks for sharing all that, ${userName}! 📝 Let me make sure I understand correctly. Are you asking about ${lastTopic || 'programming'}, or is there something specific you'd like help with?`,
      suggestions: ['Yes, help with that', 'No, something else', 'Just sharing', 'Ask question']
    };
  }
  
  // Default natural conversation
  const naturalResponses = [
    `That's interesting, ${userName}! Tell me more about what you're thinking.`,
    `I'd love to help with that! Could you elaborate a bit?`,
    `Great question! To give you the best answer, could you provide a bit more context?`,
    `I'm here to help! What specifically would you like to know about ${lastTopic || 'programming'}?`,
    `Thanks for asking! What aspect of this are you most curious about?`
  ];
  
  return {
    response: naturalResponses[Math.floor(Math.random() * naturalResponses.length)],
    suggestions: ['Explain more', 'Give example', 'Related topic', 'Something else']
  };
};

// Suggestions endpoint
router.post('/suggestions', authenticate, (req, res) => {
  const { mood } = req.body;
  const moodEmotion = mood?.emotion || 'neutral';
  
  const suggestions = {
    happy: [
      { text: "Creative project", icon: "🎨" },
      { text: "Learn something new", icon: "🚀" },
      { text: "Build a game", icon: "🎮" },
      { text: "Challenge me", icon: "⚡" }
    ],
    sad: [
      { text: "Uplifting content", icon: "💙" },
      { text: "Easy exercises", icon: "✏️" },
      { text: "Success stories", icon: "🌟" },
      { text: "Take a break", icon: "☕" }
    ],
    angry: [
      { text: "Problem solving", icon: "⚡" },
      { text: "Code challenges", icon: "💻" },
      { text: "Logic puzzles", icon: "🧩" },
      { text: "Meditation", icon: "🧘" }
    ],
    fearful: [
      { text: "Beginner guides", icon: "📘" },
      { text: "Practice mode", icon: "🎯" },
      { text: "Encouraging tips", icon: "💪" },
      { text: "Start simple", icon: "🐢" }
    ],
    surprised: [
      { text: "New technologies", icon: "✨" },
      { text: "Trending topics", icon: "📈" },
      { text: "AI/ML intro", icon: "🤖" },
      { text: "Cool projects", icon: "🚀" }
    ],
    neutral: [
      { text: "Learning paths", icon: "📚" },
      { text: "Take a quiz", icon: "📝" },
      { text: "Watch tutorial", icon: "🎥" },
      { text: "Read docs", icon: "📄" }
    ],
    calm: [
      { text: "Deep dive", icon: "🤿" },
      { text: "System design", icon: "🏗️" },
      { text: "Algorithms", icon: "🧮" },
      { text: "Architecture", icon: "🏛️" }
    ]
  };
  
  res.json({ suggestions: suggestions[moodEmotion] || suggestions.neutral });
});

module.exports = router;