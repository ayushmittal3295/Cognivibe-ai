class TeacherAI {
  constructor() {
    this.learningPaths = new Map();
    this.userProgress = new Map();
  }

  // Generate personalized learning path based on user profile and emotional state
  generateLearningPath(user, currentMood, topic) {
    const basePath = this.getTopicStructure(topic);
    const adaptedPath = this.adaptToUser(basePath, user, currentMood);
    
    return {
      topic,
      difficulty: this.calculateDifficulty(user, currentMood),
      modules: adaptedPath,
      estimatedTime: this.calculateEstimatedTime(adaptedPath),
      recommendations: this.generateRecommendations(user, currentMood)
    };
  }

  // Adapt content difficulty and style based on emotional state
  adaptToUser(path, user, mood) {
    const moodMultipliers = {
      stressed: { difficulty: 0.7, pace: 0.6, interactivity: 0.3 },
      bored: { difficulty: 0.8, pace: 1.3, interactivity: 1.5 },
      focused: { difficulty: 1.2, pace: 1.1, interactivity: 0.8 },
      happy: { difficulty: 1.0, pace: 1.0, interactivity: 1.2 },
      sad: { difficulty: 0.8, pace: 0.7, interactivity: 0.9 },
      neutral: { difficulty: 1.0, pace: 1.0, interactivity: 1.0 }
    };

    const multiplier = moodMultipliers[mood] || moodMultipliers.neutral;
    
    return path.map(module => ({
      ...module,
      difficulty: module.difficulty * multiplier.difficulty,
      duration: module.duration * multiplier.pace,
      interactive: module.interactive ? module.interactive * multiplier.interactivity : false
    }));
  }

  // Calculate appropriate difficulty level
  calculateDifficulty(user, mood) {
    const baseLevel = {
      beginner: 1,
      intermediate: 2,
      advanced: 3
    }[user.learningLevel] || 1;

    const moodAdjustment = {
      stressed: -0.5,
      bored: 0,
      focused: 1,
      happy: 0.5,
      sad: -0.3
    }[mood] || 0;

    return Math.max(1, Math.min(5, baseLevel + moodAdjustment));
  }

  // Generate smart recommendations based on user's history and current state
  generateRecommendations(user, currentMood) {
    const recommendations = [];

    // Based on learning level
    if (user.learningLevel === 'beginner') {
      recommendations.push({
        type: 'foundation',
        title: 'Master the Basics',
        reason: 'Building a strong foundation will help you learn faster'
      });
    }

    // Based on mood
    switch (currentMood) {
      case 'stressed':
        recommendations.push({
          type: 'break',
          title: 'Take a 5-minute break',
          reason: 'A short break can help reduce stress and improve focus'
        });
        break;
      case 'bored':
        recommendations.push({
          type: 'challenge',
          title: 'Try a quiz challenge',
          reason: 'Interactive challenges can make learning more engaging'
        });
        break;
      case 'focused':
        recommendations.push({
          type: 'advanced',
          title: 'Explore advanced topics',
          reason: "You're in a great state to tackle complex concepts"
        });
        break;
    }

    return recommendations;
  }

  // Get structure for a specific topic
  getTopicStructure(topic) {
    // This would normally come from a database
    const topics = {
      'javascript': [
        { id: 1, title: 'Variables and Data Types', difficulty: 1, duration: 10, interactive: true },
        { id: 2, title: 'Functions and Scope', difficulty: 2, duration: 15, interactive: true },
        { id: 3, title: 'Objects and Arrays', difficulty: 2, duration: 20, interactive: true },
        { id: 4, title: 'Asynchronous JavaScript', difficulty: 3, duration: 25, interactive: false },
        { id: 5, title: 'ES6+ Features', difficulty: 3, duration: 20, interactive: true }
      ],
      'react': [
        { id: 1, title: 'Components and Props', difficulty: 1, duration: 15, interactive: true },
        { id: 2, title: 'State and Lifecycle', difficulty: 2, duration: 20, interactive: true },
        { id: 3, title: 'Hooks', difficulty: 3, duration: 25, interactive: true },
        { id: 4, title: 'Context API', difficulty: 3, duration: 20, interactive: false }
      ],
      'python': [
        { id: 1, title: 'Python Basics', difficulty: 1, duration: 15, interactive: true },
        { id: 2, title: 'Data Structures', difficulty: 2, duration: 20, interactive: true },
        { id: 3, title: 'Functions and Modules', difficulty: 2, duration: 20, interactive: true },
        { id: 4, title: 'Object-Oriented Programming', difficulty: 3, duration: 25, interactive: false }
      ]
    };

    return topics[topic] || topics['javascript'];
  }

  // Calculate estimated time to complete the learning path
  calculateEstimatedTime(modules) {
    const totalMinutes = modules.reduce((sum, module) => sum + module.duration, 0);
    return {
      minutes: totalMinutes,
      hours: Math.round(totalMinutes / 60 * 10) / 10
    };
  }

  // Track user progress and adjust future recommendations
  trackProgress(userId, moduleId, score, timeSpent, emotion) {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, []);
    }

    const progress = this.userProgress.get(userId);
    progress.push({
      moduleId,
      score,
      timeSpent,
      emotion,
      timestamp: new Date().toISOString()
    });

    // Analyze performance patterns
    this.analyzePerformance(userId);
  }

  // Analyze user performance to improve recommendations
  analyzePerformance(userId) {
    const progress = this.userProgress.get(userId) || [];
    if (progress.length < 5) return null;

    // Calculate average scores
    const recentScores = progress.slice(-5).map(p => p.score);
    const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    // Identify patterns
    const patterns = {
      strugglingTopics: this.findStrugglingTopics(progress),
      strongTopics: this.findStrongTopics(progress),
      optimalTimeOfDay: this.findOptimalTime(progress),
      emotionalPatterns: this.findEmotionalPatterns(progress)
    };

    return {
      averageScore: avgScore,
      patterns,
      nextRecommendedDifficulty: avgScore > 85 ? 'hard' : avgScore > 70 ? 'medium' : 'easy'
    };
  }

  findStrugglingTopics(progress) {
    const topicScores = {};
    progress.forEach(p => {
      if (!topicScores[p.moduleId]) {
        topicScores[p.moduleId] = { total: 0, count: 0 };
      }
      topicScores[p.moduleId].total += p.score;
      topicScores[p.moduleId].count += 1;
    });

    return Object.entries(topicScores)
      .filter(([_, data]) => data.count >= 2)
      .map(([topic, data]) => ({
        topic,
        avgScore: data.total / data.count
      }))
      .filter(t => t.avgScore < 60)
      .map(t => t.topic);
  }

  findStrongTopics(progress) {
    const topicScores = {};
    progress.forEach(p => {
      if (!topicScores[p.moduleId]) {
        topicScores[p.moduleId] = { total: 0, count: 0 };
      }
      topicScores[p.moduleId].total += p.score;
      topicScores[p.moduleId].count += 1;
    });

    return Object.entries(topicScores)
      .filter(([_, data]) => data.count >= 2)
      .map(([topic, data]) => ({
        topic,
        avgScore: data.total / data.count
      }))
      .filter(t => t.avgScore > 85)
      .map(t => t.topic);
  }

  findOptimalTime(progress) {
    const hourPerformance = {};
    
    progress.forEach(p => {
      const hour = new Date(p.timestamp).getHours();
      if (!hourPerformance[hour]) {
        hourPerformance[hour] = { total: 0, count: 0 };
      }
      hourPerformance[hour].total += p.score;
      hourPerformance[hour].count += 1;
    });

    let bestHour = null;
    let bestAvg = 0;

    Object.entries(hourPerformance).forEach(([hour, data]) => {
      const avg = data.total / data.count;
      if (avg > bestAvg && data.count >= 3) {
        bestAvg = avg;
        bestHour = hour;
      }
    });

    return bestHour ? parseInt(bestHour) : null;
  }

  findEmotionalPatterns(progress) {
    const emotionPerformance = {};

    progress.forEach(p => {
      if (p.emotion) {
        if (!emotionPerformance[p.emotion]) {
          emotionPerformance[p.emotion] = { total: 0, count: 0 };
        }
        emotionPerformance[p.emotion].total += p.score;
        emotionPerformance[p.emotion].count += 1;
      }
    });

    return Object.entries(emotionPerformance).map(([emotion, data]) => ({
      emotion,
      avgScore: data.total / data.count,
      frequency: data.count
    }));
  }
}

export default new TeacherAI();