const { MoodHistory, User } = require('../models');
const { Op } = require('sequelize');
const natural = require('natural');

const sentimentAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');

const recordMood = async (req, res) => {
  try {
    const { emotion, confidence, source, intensity, notes, metadata } = req.body;
    const userId = req.user.id;

    const moodEntry = await MoodHistory.create({
      userId,
      emotion,
      confidence,
      source,
      intensity,
      notes,
      metadata
    });

    // Update user's learning recommendations based on mood
    await updateLearningRecommendations(userId, emotion);

    res.status(201).json({
      message: 'Mood recorded successfully',
      moodEntry
    });
  } catch (error) {
    console.error('Record mood error:', error);
    res.status(500).json({ message: 'Error recording mood' });
  }
};

const getMoodHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7, limit = 100 } = req.query;

    const dateFilter = days ? {
      createdAt: {
        [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    } : {};

    const moodHistory = await MoodHistory.findAll({
      where: {
        userId,
        ...dateFilter
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    // Calculate mood statistics
    const statistics = calculateMoodStatistics(moodHistory);

    res.json({
      history: moodHistory,
      statistics
    });
  } catch (error) {
    console.error('Get mood history error:', error);
    res.status(500).json({ message: 'Error fetching mood history' });
  }
};

const analyzeTextSentiment = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Tokenize and analyze sentiment
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text);
    const sentimentScore = sentimentAnalyzer.getSentiment(tokens);

    // Map sentiment score to emotion
    let emotion, confidence;
    if (sentimentScore > 0.3) {
      emotion = 'happy';
      confidence = Math.min(sentimentScore / 2 + 0.5, 1);
    } else if (sentimentScore < -0.3) {
      emotion = sentimentScore < -0.6 ? 'angry' : 'sad';
      confidence = Math.min(Math.abs(sentimentScore) / 2 + 0.5, 1);
    } else {
      emotion = 'neutral';
      confidence = 0.7;
    }

    // Record the mood
    const moodEntry = await MoodHistory.create({
      userId,
      emotion,
      confidence,
      source: 'text',
      metadata: { text, sentimentScore, tokens: tokens.length }
    });

    res.json({
      emotion,
      confidence,
      sentimentScore,
      moodEntry
    });
  } catch (error) {
    console.error('Text sentiment analysis error:', error);
    res.status(500).json({ message: 'Error analyzing text sentiment' });
  }
};

const calculateMoodStatistics = (moodHistory) => {
  if (!moodHistory.length) {
    return {
      averageMood: 'neutral',
      moodDistribution: {},
      dominantMood: null,
      totalEntries: 0
    };
  }

  const moodCounts = {};
  let totalConfidence = 0;

  moodHistory.forEach(entry => {
    moodCounts[entry.emotion] = (moodCounts[entry.emotion] || 0) + 1;
    totalConfidence += entry.confidence;
  });

  const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
    moodCounts[a] > moodCounts[b] ? a : b
  );

  return {
    moodDistribution: moodCounts,
    dominantMood,
    averageConfidence: totalConfidence / moodHistory.length,
    totalEntries: moodHistory.length
  };
};

const updateLearningRecommendations = async (userId, emotion) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) return;

    // Adjust learning recommendations based on emotional state
    let recommendations = [];
    
    switch (emotion) {
      case 'stressed':
        recommendations = [
          { type: 'content', difficulty: 'easy', reason: 'Take it easy today' },
          { type: 'break', duration: 5, reason: 'Recommended break' }
        ];
        break;
      case 'bored':
        recommendations = [
          { type: 'quiz', difficulty: 'interactive', reason: 'Try an interactive quiz' },
          { type: 'game', reason: 'Learning game available' }
        ];
        break;
      case 'focused':
        recommendations = [
          { type: 'content', difficulty: 'advanced', reason: 'Ready for advanced content' },
          { type: 'challenge', reason: 'Try a challenge' }
        ];
        break;
      default:
        recommendations = [
          { type: 'content', difficulty: 'medium', reason: 'Continue learning' }
        ];
    }

    // Store recommendations in user metadata or separate table
    // For now, just return them
    return recommendations;
  } catch (error) {
    console.error('Error updating recommendations:', error);
  }
};

module.exports = {
  recordMood,
  getMoodHistory,
  analyzeTextSentiment
};