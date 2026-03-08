import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { submitQuizResult, currentMood, user } = useStore();
  
  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [topic, setTopic] = useState('');
  const [validationInProgress, setValidationInProgress] = useState(false);

  // Timer warning
  const [timerWarning, setTimerWarning] = useState(false);

  useEffect(() => {
    // Extract topic from quizId
    const topicMap = {
      'javascript-fundamentals': 'JavaScript',
      'react-hooks': 'React',
      'python-basics': 'Python'
    };
    setTopic(topicMap[quizId] || 'JavaScript');
  }, [quizId]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === 31) setTimerWarning(true);
          if (prev <= 1) {
            clearInterval(timer);
            handleQuizComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [quizStarted, timeLeft]);

  // Generate quiz using Gemini
  const generateQuiz = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const prompt = `Generate a ${difficulty} level quiz about ${topic} with ${questionCount} multiple-choice questions. 
      Format the response as a JSON object with this structure:
      {
        "title": "Quiz title",
        "description": "Brief description",
        "timeLimit": 900,
        "points": 1000,
        "category": "${topic}",
        "tags": ["${topic}", "Programming"],
        "questions": [
          {
            "text": "Question text",
            "options": ["option1", "option2", "option3", "option4"],
            "correctAnswer": 0-3 (index of correct option),
            "explanation": "Detailed explanation why this answer is correct",
            "difficulty": "${difficulty}",
            "points": 20,
            "hint": "A helpful hint",
            "category": "${topic}"
          }
        ]
      }
      Make questions challenging and educational. Include a mix of concept, code, and theory questions.`;

      const response = await axios.post(`${API_URL}/learning/chat/`, {
        message: prompt,
        mood: currentMood
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Parse the AI response
      const aiResponse = response.data.response;
      // Extract JSON from response (it might be wrapped in markdown)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const quizData = JSON.parse(jsonMatch[0]);
        setQuiz({
          ...quizData,
          id: quizId,
          timeLimit: quizData.timeLimit || 900
        });
        setTimeLeft(quizData.timeLimit || 900);
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      // Fallback to static quiz if AI fails
      loadFallbackQuiz();
    } finally {
      setGenerating(false);
    }
  };

  // Fallback static quiz
  const loadFallbackQuiz = () => {
    const fallbackQuiz = {
      id: quizId,
      title: `${topic} Fundamentals`,
      description: `Test your knowledge of ${topic}`,
      timeLimit: 600,
      difficulty: difficulty,
      points: 500,
      category: topic,
      tags: [topic],
      questions: [
        {
          id: 1,
          text: `What is ${topic} primarily used for?`,
          options: ['Web Development', 'Mobile Apps', 'Data Science', 'All of the above'],
          correctAnswer: 3,
          explanation: `${topic} is a versatile language used in many areas.`,
          difficulty: 'easy',
          points: 10,
          hint: 'Think about its common applications.'
        }
      ]
    };
    setQuiz(fallbackQuiz);
    setTimeLeft(fallbackQuiz.timeLimit);
  };

  const startQuiz = () => {
    generateQuiz();
    setQuizStarted(true);
  };

  const handleAnswer = async (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const question = quiz.questions[currentQuestion];
    
    setValidationInProgress(true);
    
    try {
      // Validate answer using Gemini
      const token = localStorage.getItem('token');
      const validationPrompt = `Question: "${question.text}"
Options: ${question.options.join(', ')}
User selected option ${answerIndex + 1}: "${question.options[answerIndex]}"

Is this correct? The correct answer is index ${question.correctAnswer} (${question.options[question.correctAnswer]}).
Provide a helpful explanation about why this answer is ${answerIndex === question.correctAnswer ? 'correct' : 'incorrect'}.`;

      const response = await axios.post(`${API_URL}/learning/chat/`, {
        message: validationPrompt,
        mood: currentMood
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const isCorrect = answerIndex === question.correctAnswer;
      
      // Update streak
      if (isCorrect) {
        setStreak(prev => prev + 1);
        setAnswerFeedback({
          correct: true,
          message: '✅ Correct! Great job!',
          points: question.points,
          explanation: response.data.response || question.explanation
        });
        
        if (streak >= 2) setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      } else {
        setStreak(0);
        setAnswerFeedback({
          correct: false,
          message: '❌ Not quite right. Keep learning!',
          explanation: response.data.response || question.explanation
        });
      }
      
      // Save answer
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = answerIndex;
      setAnswers(newAnswers);
      
      // Save user answer for history
      const newUserAnswers = [...userAnswers];
      newUserAnswers[currentQuestion] = {
        question: question.text,
        selected: answerIndex,
        correct: isCorrect,
        explanation: response.data.response || question.explanation
      };
      setUserAnswers(newUserAnswers);
      
      setShowExplanation(true);
    } catch (error) {
      console.error('Error validating answer:', error);
      // Fallback validation
      const isCorrect = answerIndex === question.correctAnswer;
      
      if (isCorrect) {
        setStreak(prev => prev + 1);
        setAnswerFeedback({
          correct: true,
          message: '✅ Correct! Great job!',
          points: question.points,
          explanation: question.explanation
        });
      } else {
        setStreak(0);
        setAnswerFeedback({
          correct: false,
          message: '❌ Not quite right. Keep learning!',
          explanation: question.explanation
        });
      }
      
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = answerIndex;
      setAnswers(newAnswers);
      
      setShowExplanation(true);
    } finally {
      setValidationInProgress(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnswerFeedback(null);
    } else {
      handleQuizComplete();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
      setShowExplanation(false);
      setAnswerFeedback(null);
    }
  };

  const handleQuizComplete = async () => {
    // Calculate detailed statistics
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    
    quiz.questions.forEach((q, index) => {
      const isCorrect = answers[index] === q.correctAnswer;
      if (isCorrect) {
        correctCount++;
        earnedPoints += q.points || 10;
      }
      totalPoints += q.points || 10;
    });
    
    const finalScore = (correctCount / quiz.questions.length) * 100;
    setScore(finalScore);
    
    // Calculate bonuses
    const timeBonus = Math.max(0, Math.floor((quiz.timeLimit - timeLeft) / 60) * 5);
    const bonusPoints = streak >= 3 ? 50 : streak >= 5 ? 100 : 0;
    const finalPoints = earnedPoints + timeBonus + bonusPoints;
    
    // Submit results
    await submitQuizResult({
      quizId: quiz.id,
      quizTitle: quiz.title,
      quizType: quiz.category,
      score: finalScore,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      timeSpent: quiz.timeLimit - timeLeft,
      timeBonus,
      streakBonus: bonusPoints,
      totalPoints: finalPoints,
      difficulty: quiz.difficulty,
      topics: quiz.tags,
      answers: userAnswers,
      mood: currentMood?.emotion
    });
    
    setQuizCompleted(true);
    setShowConfetti(finalScore >= 80);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff) => {
    const colors = {
      easy: 'text-green-400',
      medium: 'text-yellow-400',
      hard: 'text-red-400'
    };
    return colors[diff] || 'text-gray-400';
  };

  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl font-semibold mb-2">Generating Your Quiz...</p>
          <p className="text-gray-400">AI is creating personalized questions about {topic}</p>
          <div className="mt-8 flex gap-2 justify-center">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="max-w-3xl w-full glass rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">
              {topic === 'JavaScript' ? '📜' : topic === 'React' ? '⚛️' : '🐍'}
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              {topic} Quiz
            </h1>
            <p className="text-gray-300">AI-Generated • Every attempt is unique!</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <label className="block text-sm text-gray-400 mb-2">Questions</label>
              <select 
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="3">3 Questions</option>
                <option value="5">5 Questions</option>
                <option value="7">7 Questions</option>
                <option value="10">10 Questions</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-primary-600/20 rounded-lg">
              <span>🤖 AI-Generated Questions</span>
              <span className="text-primary-400">✓</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary-600/20 rounded-lg">
              <span>✨ Unique Every Time</span>
              <span className="text-primary-400">✓</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary-600/20 rounded-lg">
              <span>🧠 Smart Answer Validation</span>
              <span className="text-primary-400">✓</span>
            </div>
          </div>
          
          <button
            onClick={startQuiz}
            className="w-full py-4 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg font-medium hover:from-primary-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Generate & Start Quiz
          </button>
        </div>
      </motion.div>
    );
  }

  if (quizCompleted) {
    return (
      <>
        {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-screen flex items-center justify-center p-4"
        >
          <div className="max-w-3xl w-full glass rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                <span className="text-3xl font-bold text-white">{Math.round(score)}%</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-2">
                {score >= 80 ? '🏆 Excellent!' : score >= 60 ? '👍 Good Job!' : '💪 Keep Practicing!'}
              </h2>
              <p className="text-gray-400 mb-6">Here's your AI-analyzed performance:</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {answers.filter((a, i) => a === quiz.questions[i]?.correctAnswer).length}
                </div>
                <div className="text-sm text-gray-400">Correct</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {answers.filter(a => a !== null).length}
                </div>
                <div className="text-sm text-gray-400">Attempted</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">{streak}</div>
                <div className="text-sm text-gray-400">Max Streak</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {formatTime(quiz.timeLimit - timeLeft)}
                </div>
                <div className="text-sm text-gray-400">Time Taken</div>
              </div>
            </div>

            {/* AI-Powered Review */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>🤖 AI Review</span>
                <span className="text-xs bg-primary-600/30 px-2 py-1 rounded-full">Powered by Gemini</span>
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {quiz.questions.map((q, idx) => {
                  const isCorrect = answers[idx] === q.correctAnswer;
                  const userAnswer = userAnswers[idx];
                  return (
                    <div 
                      key={idx}
                      className={`p-4 rounded-lg ${
                        isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium">Q{idx + 1}: {q.text}</span>
                        <span className={`text-sm font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                          {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </div>
                      {userAnswer?.explanation && (
                        <p className="text-xs text-gray-400 mt-1">{userAnswer.explanation}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 bg-primary-600 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setQuizStarted(false);
                  setCurrentQuestion(0);
                  setAnswers([]);
                  setUserAnswers([]);
                  setQuizCompleted(false);
                  setStreak(0);
                  setQuiz(null);
                }}
                className="flex-1 py-3 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                New Quiz
              </button>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your quiz...</p>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen p-8">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="max-w-4xl mx-auto">
        {/* Header with progress */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-gray-400">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl font-bold">{quiz.title}</h2>
              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(question.difficulty)} bg-gray-800`}>
                {question.difficulty}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-2xl font-mono ${timerWarning ? 'text-red-400 animate-pulse' : ''}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-gray-400">Time Remaining</div>
            </div>
            <div className="h-12 w-px bg-gray-700"></div>
            <div className="text-right">
              <div className="text-2xl font-mono text-yellow-400">{streak} 🔥</div>
              <div className="text-xs text-gray-400">Streak</div>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="relative mb-8">
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Start</span>
            <span className="flex items-center gap-1">
              <span>🤖 AI Generated</span>
            </span>
            <span>{question.points} pts</span>
          </div>
        </div>
        
        {/* Question card */}
        <motion.div 
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass rounded-2xl p-8 mb-4"
        >
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold">{question.text}</h3>
          </div>
          
          {/* Code block if present */}
          {question.code && (
            <pre className="bg-gray-900 p-4 rounded-lg mb-6 overflow-x-auto">
              <code className="text-sm text-gray-300">{question.code}</code>
            </pre>
          )}
          
          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showExplanation && !validationInProgress && handleAnswer(index)}
                disabled={showExplanation || validationInProgress}
                className={`w-full text-left p-4 rounded-lg transition-all transform hover:scale-[1.02] ${
                  showExplanation && index === question.correctAnswer
                    ? 'bg-green-600/20 border border-green-500'
                    : showExplanation && answers[currentQuestion] === index && index !== question.correctAnswer
                    ? 'bg-red-600/20 border border-red-500'
                    : answers[currentQuestion] === index
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800/50 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center">
                  <span className="inline-block w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showExplanation && index === question.correctAnswer && (
                    <svg className="w-5 h-5 text-green-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {/* Validation loading */}
          {validationInProgress && (
            <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-primary-400">AI is validating your answer...</p>
              </div>
            </div>
          )}
          
          {/* Explanation section */}
          {showExplanation && answerFeedback && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg ${
                answerFeedback.correct ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
              }`}
            >
              <p className={`font-semibold mb-2 ${answerFeedback.correct ? 'text-green-400' : 'text-red-400'}`}>
                {answerFeedback.message}
                {answerFeedback.correct && ` (+${answerFeedback.points} pts)`}
              </p>
              <p className="text-sm text-gray-300">{answerFeedback.explanation}</p>
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <span>🤖 Validated by Gemini AI</span>
              </div>
            </motion.div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-between gap-3">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            
            {showExplanation && (
              <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                {currentQuestion === quiz.questions.length - 1 ? 'Complete Quiz' : 'Next Question →'}
              </button>
            )}
          </div>
        </motion.div>
        
        {/* Question navigator */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Question Navigator</span>
            <span className="text-xs text-gray-500">
              {answers.filter(a => a !== null).length}/{quiz.questions.length} answered
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  currentQuestion === idx
                    ? 'bg-primary-600 text-white'
                    : answers[idx] !== null
                    ? 'bg-green-600/30 text-green-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;