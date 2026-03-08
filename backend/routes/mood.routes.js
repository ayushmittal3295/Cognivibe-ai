const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { recordMood, getMoodHistory, analyzeTextSentiment } = require('../controllers/mood.controller');

const router = express.Router();

// All mood routes require authentication
router.use(authenticate);

router.post('/record', recordMood);
router.get('/history', getMoodHistory);
router.post('/analyze-text', analyzeTextSentiment);

module.exports = router;