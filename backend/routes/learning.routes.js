const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const {
  submitQuizResult,
  getQuizHistory,
  getPersonalizedContent,
  updateLearningProgress
} = require('../controllers/learning.controller');

const router = express.Router();

// All learning routes require authentication
router.use(authenticate);

router.post('/quiz', submitQuizResult);
router.get('/quiz-history', getQuizHistory);
router.get('/content', getPersonalizedContent);
router.post('/progress', updateLearningProgress);

module.exports = router;