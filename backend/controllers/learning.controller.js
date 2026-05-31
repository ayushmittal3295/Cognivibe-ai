const { QuizResult, LearningPath, User, MoodHistory } = require('../models');
const { Op } = require('sequelize');

const submitQuizResult = async (req, res) => {
  try {
    const { quizType, score, totalQuestions, correctAnswers, timeSpent, difficulty, topics } = req.body;
    const userId = req.user.id;

    // Get current mood for context
    const recentMood = await MoodHistory.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    const quizResult = await QuizResult.create({
      userId,
      quizType,
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      difficulty,
      topics,
      emotionDuringQuiz: recentMood?.emotion
    });

    // Update user's learning level based on performance
    await updateUserLearningLevel(userId, score);

    res.status(201).json({
      message: 'Quiz result saved successfully',
      quizResult
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Error saving quiz result' });
  }
};

const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const quizHistory = await QuizResult.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    // Calculate performance statistics
    const statistics = calculateQuizStatistics(quizHistory);

    res.json({
      history: quizHistory,
      statistics
    });
  } catch (error) {
    console.error('Get quiz history error:', error);
    res.status(500).json({ message: 'Error fetching quiz history' });
  }
};

const getPersonalizedContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic } = req.query;

    // Get user data
    const user = await User.findByPk(userId);
    const recentMood = await MoodHistory.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    // Get learning path
    let learningPath = await LearningPath.findOne({
      where: { 
        userId,
        ...(topic && { topic })
      }
    });

    if (!learningPath) {
      learningPath = await LearningPath.create({
        userId,
        topic: topic || 'General',
        currentLevel: 1,
        progress: 0,
        recommendations: []
      });
    }

    // Generate personalized content based on mood and learning level
    const content = generateAdaptiveContent(user, recentMood, learningPath);

    res.json({
      learningPath,
      content,
      mood: recentMood?.emotion || 'neutral',
      level: user.learningLevel
    });
  } catch (error) {
    console.error('Get personalized content error:', error);
    res.status(500).json({ message: 'Error fetching personalized content' });
  }
};

const updateLearningProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topic, progress, completedLevel } = req.body;

    let learningPath = await LearningPath.findOne({
      where: { userId, topic }
    });

    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    const updates = {
      progress: progress || learningPath.progress
    };

    if (completedLevel) {
      updates.currentLevel = completedLevel + 1;
    }

    updates.lastAccessed = new Date();

    await learningPath.update(updates);

    res.json({
      message: 'Progress updated successfully',
      learningPath
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Error updating progress' });
  }
};

const updateUserLearningLevel = async (userId, score) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) return;

    // Calculate average score from recent quizzes
    const recentQuizzes = await QuizResult.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    if (recentQuizzes.length < 3) return;

    const avgScore = recentQuizzes.reduce((sum, q) => sum + q.score, 0) / recentQuizzes.length;

    // Update learning level based on performance
    let newLevel = user.learningLevel;
    if (avgScore >= 85 && user.learningLevel === 'beginner') {
      newLevel = 'intermediate';
    } else if (avgScore >= 90 && user.learningLevel === 'intermediate') {
      newLevel = 'advanced';
    }

    if (newLevel !== user.learningLevel) {
      await user.update({ learningLevel: newLevel });
    }
  } catch (error) {
    console.error('Error updating learning level:', error);
  }
};

const calculateQuizStatistics = (quizHistory) => {
  if (!quizHistory.length) {
    return {
      averageScore: 0,
      totalQuizzes: 0,
      bestTopic: null,
      weakestTopic: null
    };
  }

  const topicPerformance = {};
  let totalScore = 0;

  quizHistory.forEach(quiz => {
    totalScore += quiz.score;
    
    quiz.topics?.forEach(topic => {
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { total: 0, count: 0 };
      }
      topicPerformance[topic].total += quiz.score;
      topicPerformance[topic].count += 1;
    });
  });

  // Calculate average per topic
  const topicAverages = {};
  Object.keys(topicPerformance).forEach(topic => {
    topicAverages[topic] = topicPerformance[topic].total / topicPerformance[topic].count;
  });

  // Find best and weakest topics
  const topics = Object.keys(topicAverages);
  let bestTopic = null;
  let weakestTopic = null;

  if (topics.length) {
    bestTopic = topics.reduce((a, b) => 
      topicAverages[a] > topicAverages[b] ? a : b
    );
    weakestTopic = topics.reduce((a, b) => 
      topicAverages[a] < topicAverages[b] ? a : b
    );
  }

  return {
    averageScore: totalScore / quizHistory.length,
    totalQuizzes: quizHistory.length,
    topicPerformance: topicAverages,
    bestTopic,
    weakestTopic
  };
};

const generateAdaptiveContent = (user, recentMood, learningPath) => {
  const mood = recentMood?.emotion || 'neutral';
  const level = user.learningLevel;
  const topic = learningPath.topic;

  // Base content structure
  let content = {
    title: `${topic} - ${level} Level`,
    difficulty: level,
    sections: [],
    recommendations: []
  };

  // Adjust content based on mood
  switch (mood) {
    case 'stressed':
      content.theme = 'calming';
      content.sections = [
        { type: 'summary', title: 'Quick Overview', duration: '3 min' },
        { type: 'simple', title: 'Key Concepts', interactive: false }
      ];
      content.recommendations.push('Take breaks between sections');
      break;
      
    case 'bored':
      content.theme = 'energetic';
      content.sections = [
        { type: 'interactive', title: 'Interactive Quiz', duration: '5 min' },
        { type: 'game', title: 'Learning Game', duration: '7 min' }
      ];
      content.recommendations.push('Try the gamified learning mode');
      break;
      
    case 'focused':
      content.theme = 'advanced';
      content.sections = [
        { type: 'deep', title: 'Advanced Concepts', duration: '15 min' },
        { type: 'challenge', title: 'Practice Challenge', duration: '10 min' },
        { type: 'project', title: 'Mini Project', duration: '20 min' }
      ];
      content.recommendations.push('Ready for advanced challenges');
      break;
      
    default:
      content.theme = 'balanced';
      content.sections = [
        { type: 'learn', title: 'Core Concepts', duration: '10 min' },
        { type: 'practice', title: 'Practice Exercises', duration: '10 min' }
      ];
  }

  return content;
};

module.exports = {
  submitQuizResult,
  getQuizHistory,
  getPersonalizedContent,
  updateLearningProgress
};