import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { submitQuizResult, currentMood, user } = useStore();
  
  // Quiz state
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [hint, setHint] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [bookmarked, setBookmarked] = useState([]);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  // Timer warning
  const [timerWarning, setTimerWarning] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          // Warning at 30 seconds
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

  const loadQuiz = () => {
    // Advanced quiz data with more features
    const quizLibrary = {
      'javascript-fundamentals': {
        id: 'javascript-fundamentals',
        title: 'JavaScript Mastery Challenge',
        description: 'Advanced JavaScript concepts including closures, promises, and ES6+ features',
        timeLimit: 900, // 15 minutes
        difficulty: 'hard',
        points: 1000,
        category: 'Programming',
        tags: ['JavaScript', 'Web Development', 'ES6'],
        prerequisites: ['Basic JavaScript'],
        questions: [
          {
            id: 1,
            text: 'What will be the output of: console.log(1 + "2" + "2");',
            code: 'console.log(1 + "2" + "2");',
            options: ['"122"', '5', '"14"', 'Error'],
            correctAnswer: 0,
            explanation: 'JavaScript performs type coercion. The first + operator sees a number and string, so it converts 1 to "1" and concatenates. Then "12" + "2" = "122".',
            difficulty: 'easy',
            points: 10,
            hint: 'Think about how JavaScript handles different data types with the + operator.',
            category: 'Type Coercion',
            timeLimit: 60
          },
          {
            id: 2,
            text: 'What is the output of this closure?',
            code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1000);
}`,
            options: ['0 1 2', '3 3 3', 'undefined', 'Error'],
            correctAnswer: 1,
            explanation: 'var has function scope, not block scope. The loop completes before setTimeout runs, so i is 3 when the callbacks execute.',
            difficulty: 'hard',
            points: 25,
            hint: 'Consider the difference between var and let in loops.',
            category: 'Closures',
            timeLimit: 90
          },
          {
            id: 3,
            text: 'What does the Promise.all() method return?',
            code: `Promise.all([p1, p2, p3]).then(values => console.log(values));`,
            options: [
              'First resolved promise',
              'Array of all resolved values',
              'Last resolved promise',
              'First rejected promise'
            ],
            correctAnswer: 1,
            explanation: 'Promise.all() returns a single promise that resolves to an array of the results of all input promises. It rejects immediately if any promise rejects.',
            difficulty: 'medium',
            points: 15,
            hint: 'Think about waiting for multiple async operations.',
            category: 'Promises',
            timeLimit: 75
          },
          {
            id: 4,
            text: 'What is the result of: [] == ![] ?',
            options: ['true', 'false', 'undefined', 'TypeError'],
            correctAnswer: 0,
            explanation: 'This is a famous JavaScript quirk. ![] is false, so [] == false. Then [] is coerced to "", and "" == false is true.',
            difficulty: 'hard',
            points: 30,
            hint: 'Double equals (==) performs type coercion. Think about truthy/falsy values.',
            category: 'Type Coercion',
            timeLimit: 60
          },
          {
            id: 5,
            text: 'Which statement correctly describes the event loop?',
            options: [
              'Executes code in multiple threads',
              'Handles async callbacks in a single thread',
              'Creates new threads for promises',
              'Runs all code synchronously'
            ],
            correctAnswer: 1,
            explanation: 'The event loop allows JavaScript to perform non-blocking operations by offloading operations to the system kernel and processing callbacks when the call stack is empty.',
            difficulty: 'medium',
            points: 20,
            hint: 'Think about how JavaScript handles async operations with a single thread.',
            category: 'Event Loop',
            timeLimit: 60
          }
        ]
      },
      'react-hooks': {
        id: 'react-hooks',
        title: 'React Hooks Deep Dive',
        description: 'Master React hooks with advanced patterns and custom hooks',
        timeLimit: 1200,
        difficulty: 'hard',
        points: 1200,
        category: 'React',
        tags: ['React', 'Hooks', 'Frontend'],
        questions: [
          {
            id: 1,
            text: 'What is the correct order of useEffect execution?',
            code: `useEffect(() => {
  console.log('effect');
  return () => console.log('cleanup');
}, [dep]);`,
            options: [
              'cleanup → effect → render',
              'render → effect → cleanup',
              'effect → cleanup → render',
              'render → cleanup → effect'
            ],
            correctAnswer: 3,
            explanation: 'The component renders first, then the previous cleanup runs (if any), then the new effect runs.',
            difficulty: 'medium',
            points: 15,
            category: 'useEffect'
          }
        ]
      }
    };

    const selectedQuiz = quizLibrary[quizId] || quizLibrary['javascript-fundamentals'];
    setQuiz(selectedQuiz);
    setTimeLeft(selectedQuiz.timeLimit);
    setDifficulty(selectedQuiz.difficulty);
    setBookmarked(new Array(selectedQuiz.questions.length).fill(false));
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setAnswers(new Array(quiz.questions.length).fill(null));
  };

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const question = quiz.questions[currentQuestion];
    const isCorrect = answerIndex === question.correctAnswer;
    
    // Update streak
    if (isCorrect) {
      setStreak(prev => prev + 1);
      setAnswerFeedback({
        correct: true,
        message: '✅ Correct! Great job!',
        points: question.points
      });
      
      // Show confetti for streaks of 3 or more
      if (streak >= 2) setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      setStreak(0);
      setAnswerFeedback({
        correct: false,
        message: '❌ Not quite right. Keep learning!',
        explanation: question.explanation
      });
    }
    
    // Save answer
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
    
    // Show explanation
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnswerFeedback(null);
      setShowHint(false);
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
    const questionResults = [];
    
    quiz.questions.forEach((q, index) => {
      const isCorrect = answers[index] === q.correctAnswer;
      if (isCorrect) {
        correctCount++;
        earnedPoints += q.points || 10;
      }
      totalPoints += q.points || 10;
      
      questionResults.push({
        question: q.text,
        userAnswer: answers[index],
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
        category: q.category
      });
    });
    
    const finalScore = (correctCount / quiz.questions.length) * 100;
    setScore(finalScore);
    
    // Calculate time bonus
    const timeBonus = Math.max(0, Math.floor((quiz.timeLimit - (quiz.timeLimit - timeLeft)) / 60) * 5);
    const bonusPoints = streak >= 3 ? 50 : streak >= 5 ? 100 : 0;
    const finalPoints = earnedPoints + timeBonus + bonusPoints;
    
    // Submit results with advanced metrics
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
      questionResults,
      accuracy: correctCount / quiz.questions.length,
      pace: (quiz.timeLimit - timeLeft) / quiz.questions.length,
      mood: currentMood?.emotion
    });
    
    setQuizCompleted(true);
    setShowConfetti(finalScore >= 80);
  };

  const toggleBookmark = () => {
    const newBookmarked = [...bookmarked];
    newBookmarked[currentQuestion] = !newBookmarked[currentQuestion];
    setBookmarked(newBookmarked);
  };

  const saveNote = () => {
    if (note.trim()) {
      // Save note logic - could be sent to backend
      console.log('Note saved:', note);
      setNote('');
      setShowNoteInput(false);
    }
  };

  const getHint = () => {
    const question = quiz.questions[currentQuestion];
    setHint(question.hint || 'Think about the core concept being tested.');
    setShowHint(true);
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

  if (!quizStarted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="max-w-3xl w-full glass rounded-2xl p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                {quiz.title}
              </h1>
              <p className="text-gray-300">{quiz.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              quiz.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
              quiz.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {quiz.difficulty.toUpperCase()}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {quiz.tags?.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-700 rounded-full text-xs">
                #{tag}
              </span>
            ))}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <div className="text-sm text-gray-400">Questions</div>
              <div className="text-2xl font-bold">{quiz.questions.length}</div>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <div className="text-sm text-gray-400">Time Limit</div>
              <div className="text-2xl font-bold">{formatTime(quiz.timeLimit)}</div>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <div className="text-sm text-gray-400">Max Points</div>
              <div className="text-2xl font-bold">{quiz.points}</div>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <div className="text-sm text-gray-400">Category</div>
              <div className="text-2xl font-bold">{quiz.category}</div>
            </div>
          </div>

          {quiz.prerequisites && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h3 className="font-semibold text-yellow-400 mb-2">Prerequisites</h3>
              <ul className="list-disc list-inside text-sm text-gray-300">
                {quiz.prerequisites.map(pre => <li key={pre}>{pre}</li>)}
              </ul>
            </div>
          )}
          
          <button
            onClick={startQuiz}
            className="w-full py-4 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg font-medium hover:from-primary-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Start Challenge
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
              <p className="text-gray-400 mb-6">Here's your performance breakdown:</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {answers.filter((a, i) => a === quiz.questions[i].correctAnswer).length}
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

            {/* Question Review */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Question Review</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {quiz.questions.map((q, idx) => {
                  const isCorrect = answers[idx] === q.correctAnswer;
                  return (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg flex items-center justify-between ${
                        isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}
                    >
                      <span className="text-sm">Q{idx + 1}: {q.text.substring(0, 50)}...</span>
                      <span className={`text-sm font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
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
                  setQuizCompleted(false);
                  setStreak(0);
                }}
                className="flex-1 py-3 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      </>
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
        
        {/* Progress bar with categories */}
        <div className="relative mb-8">
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Start</span>
            <span>Category: {question.category}</span>
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
            <div className="flex gap-2">
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  bookmarked[currentQuestion] ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                }`}
              >
                <svg className="w-5 h-5" fill={bookmarked[currentQuestion] ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <button
                onClick={() => setShowNoteInput(!showNoteInput)}
                className="p-2 rounded-lg text-gray-400 hover:text-primary-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Code block if present */}
          {question.code && (
            <pre className="bg-gray-900 p-4 rounded-lg mb-6 overflow-x-auto">
              <code className="text-sm text-gray-300">{question.code}</code>
            </pre>
          )}
          
          {/* Note input */}
          {showNoteInput && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this question..."
                className="w-full bg-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="3"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowNoteInput(false)}
                  className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNote}
                  className="px-3 py-1 text-sm bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  Save Note
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showExplanation && handleAnswer(index)}
                disabled={showExplanation}
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
          
          {/* Hint section */}
          {showHint && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
            >
              <p className="text-sm text-yellow-400">
                <span className="font-semibold">💡 Hint:</span> {hint}
              </p>
            </motion.div>
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
              <p className="text-sm text-gray-300">{question.explanation}</p>
            </motion.div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-between gap-3">
            <div className="flex gap-2">
              <button
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              {!showHint && !showExplanation && (
                <button
                  onClick={getHint}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  💡 Hint
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              {showExplanation && (
                <button
                  onClick={nextQuestion}
                  className="px-6 py-2 bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  {currentQuestion === quiz.questions.length - 1 ? 'Complete Quiz' : 'Next Question →'}
                </button>
              )}
            </div>
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