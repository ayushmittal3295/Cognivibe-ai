class ContentGenerator {
  constructor() {
    this.contentTemplates = this.initializeTemplates();
  }

  initializeTemplates() {
    return {
      javascript: {
        beginner: [
          {
            type: 'concept',
            title: 'Understanding Variables',
            content: 'Variables are like labeled boxes where we store information...',
            examples: [
              'let age = 25;',
              'const name = "John";',
              'var oldWay = "avoid this";'
            ],
            quiz: [
              { question: 'What keyword is used to declare a block-scoped variable?', options: ['var', 'let', 'const', 'both let and const'], correct: 3 },
              { question: 'Which variable can be reassigned?', options: ['const', 'let', 'var', 'all of them'], correct: 1 }
            ]
          },
          {
            type: 'concept',
            title: 'Functions Basics',
            content: 'Functions are reusable blocks of code that perform specific tasks...',
            examples: [
              'function greet(name) {',
              '  return `Hello, ${name}!`;',
              '}'
            ]
          }
        ],
        intermediate: [
          {
            type: 'concept',
            title: 'Closures',
            content: 'A closure is the combination of a function bundled with its lexical environment...',
            examples: [
              'function outer(x) {',
              '  return function inner(y) {',
              '    return x + y;',
              '  }',
              '}'
            ]
          }
        ],
        advanced: [
          {
            type: 'concept',
            title: 'Event Loop',
            content: 'The event loop is what allows JavaScript to perform non-blocking operations...'
          }
        ]
      },
      react: {
        beginner: [
          {
            type: 'concept',
            title: 'Components',
            content: 'Components are the building blocks of any React application...',
            examples: [
              'function Welcome() {',
              '  return <h1>Hello, React!</h1>;',
              '}'
            ]
          }
        ]
      },
      python: {
        beginner: [
          {
            type: 'concept',
            title: 'Python Lists',
            content: 'Lists are ordered, mutable collections in Python...',
            examples: [
              'fruits = ["apple", "banana", "orange"]',
              'fruits.append("grape")',
              'print(fruits[0])  # apple'
            ]
          }
        ]
      }
    };
  }

  generateContent(topic, level, emotion, userProgress) {
    // Get base template
    const topicTemplates = this.contentTemplates[topic] || this.contentTemplates.javascript;
    const levelTemplates = topicTemplates[level] || topicTemplates.beginner;
    
    // Adapt content based on emotion
    let adaptedContent = this.adaptToEmotion(levelTemplates, emotion);
    
    // Personalize based on user progress
    adaptedContent = this.personalizeContent(adaptedContent, userProgress);
    
    // Generate quiz questions
    const quiz = this.generateQuiz(topic, level, emotion);
    
    // Generate exercises
    const exercises = this.generateExercises(topic, level, adaptedContent.length);
    
    return {
      modules: adaptedContent,
      quiz,
      exercises,
      recommendations: this.generateNextSteps(userProgress, emotion)
    };
  }

  adaptToEmotion(templates, emotion) {
    const emotionStyles = {
      stressed: {
        explanationStyle: 'simple',
        examplesCount: 2,
        includeAnalogies: true,
        includeVisuals: true
      },
      bored: {
        explanationStyle: 'interactive',
        examplesCount: 5,
        includeAnalogies: false,
        includeVisuals: true,
        gamification: true
      },
      focused: {
        explanationStyle: 'detailed',
        examplesCount: 3,
        includeAnalogies: false,
        includeVisuals: true,
        includeChallenges: true
      },
      happy: {
        explanationStyle: 'balanced',
        examplesCount: 4,
        includeAnalogies: true,
        includeVisuals: true
      },
      sad: {
        explanationStyle: 'encouraging',
        examplesCount: 3,
        includeAnalogies: true,
        includeVisuals: true,
        includeMotivation: true
      },
      neutral: {
        explanationStyle: 'standard',
        examplesCount: 3,
        includeAnalogies: false,
        includeVisuals: true
      }
    };

    const style = emotionStyles[emotion] || emotionStyles.neutral;
    
    return templates.map(template => ({
      ...template,
      explanationStyle: style.explanationStyle,
      examples: template.examples.slice(0, style.examplesCount),
      ...(style.includeAnalogies && { analogy: this.generateAnalogy(template.title) }),
      ...(style.includeMotivation && { motivation: this.generateMotivation() }),
      ...(style.gamification && { points: 100, badge: 'Quick Learner' })
    }));
  }

  personalizeContent(content, userProgress) {
    if (!userProgress || userProgress.length === 0) return content;

    // Get topics user struggled with
    const strugglingTopics = userProgress
      .filter(p => p.score < 60)
      .map(p => p.topic);

    // Add extra explanations for struggling topics
    return content.map(module => {
      if (strugglingTopics.includes(module.title)) {
        return {
          ...module,
          extraHelp: true,
          simplifiedVersion: this.generateSimplifiedVersion(module),
          practiceExercises: 3
        };
      }
      return module;
    });
  }

  generateAnalogy(topic) {
    const analogies = {
      'Variables': 'Think of variables as labeled jars where you can store different items...',
      'Functions': 'Functions are like recipes - they take ingredients (inputs) and produce a dish (output)...',
      'Arrays': 'An array is like a numbered list in a notebook...',
      'Objects': 'Objects are like real-world objects with properties and behaviors...'
    };

    return analogies[topic] || `Let me explain ${topic} with a real-world example...`;
  }

  generateMotivation() {
    const messages = [
      "You're doing great! Every expert was once a beginner.",
      "Keep going! Practice makes perfect.",
      "You've got this! Learning is a journey, not a race.",
      "Great effort! Each attempt brings you closer to mastery."
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  generateQuiz(topic, level, emotion) {
    const difficulty = level === 'beginner' ? 'easy' : level === 'intermediate' ? 'medium' : 'hard';
    const questionCount = emotion === 'bored' ? 8 : emotion === 'focused' ? 12 : 5;

    // This would normally fetch from a database
    return {
      difficulty,
      totalQuestions: questionCount,
      timeLimit: questionCount * 60, // seconds
      questions: Array(questionCount).fill(null).map((_, i) => ({
        id: i + 1,
        text: `Sample question ${i + 1} about ${topic}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0
      }))
    };
  }

  generateExercises(topic, level, count) {
    const difficulties = {
      beginner: ['easy'],
      intermediate: ['easy', 'medium'],
      advanced: ['medium', 'hard']
    };

    const availableDifficulties = difficulties[level] || ['easy'];
    
    return Array(count).fill(null).map((_, i) => ({
      id: i + 1,
      title: `Exercise ${i + 1}: Practice ${topic}`,
      difficulty: availableDifficulties[Math.floor(Math.random() * availableDifficulties.length)],
      description: `Practice your ${topic} skills with this exercise...`,
      starterCode: '// Write your code here',
      solution: '// Solution here'
    }));
  }

 generateSimplifiedVersion(module) {
  return {
    title: `${module.title} (Simplified)`,
    content: module.content.split('.')[0] + ". Let's break this down simply...",
    examples: module.examples.slice(0, 1),
    keyPoints: [
      'Remember the main idea',
      'Practice with simple examples first',
      "Don't worry about complex cases yet"
    ]
  };
}

  generateNextSteps(userProgress, emotion) {
    const recommendations = [];

    if (userProgress && userProgress.length > 0) {
      const lastScore = userProgress[userProgress.length - 1]?.score || 0;
      
      if (lastScore < 70) {
        recommendations.push({
          type: 'review',
          title: 'Review Previous Topic',
          reason: 'A quick review can strengthen your understanding'
        });
      }
    }

    if (emotion === 'focused') {
      recommendations.push({
        type: 'challenge',
        title: 'Take on a Challenge',
        reason: "You're in the zone - perfect for tackling something new"
      });
    }

  if (emotion === 'bored') {
  recommendations.push({
    type: 'project',
    title: 'Build a Mini Project',
    reason: "Apply what you've learned in a real project" // Fixed: using double quotes
  });
}
    return recommendations;
  }
}

export default new ContentGenerator();