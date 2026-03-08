import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { submitQuizResult, currentMood } = useStore();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Load quiz data
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
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
    // Mock quiz data - in production, this would come from an API
    const mockQuiz = {
      id: quizId,
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of JavaScript basics',
      timeLimit: 600, // seconds
      questions: [
        {
          id: 1,
          text: 'What is the correct way to declare a variable in JavaScript?',
          options: ['var myVar;', 'variable myVar;', 'v myVar;', 'let myVar;'],
          correctAnswer: 3,
          explanation: 'Both var and let can be used, but let is the modern way.'
        },
        {
          id: 2,
          text: 'Which of the following is NOT a JavaScript data type?',
          options: ['Number', 'String', 'Integer', 'Boolean'],
          correctAnswer: 2,
          explanation: 'JavaScript uses Number for all numeric types, not a separate Integer type.'
        },
        {
          id: 3,
          text: 'What will console.log(typeof []) output?',
          options: ['"array"', '"object"', '"list"', '"undefined"'],
          correctAnswer: 1,
          explanation: 'Arrays are objects in JavaScript.'
        }
      ]
    };
    
    setQuiz(mockQuiz);
    setTimeLeft(mockQuiz.timeLimit);
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    
    const finalScore = (correctCount / quiz.questions.length) * 100;
    setScore(finalScore);
    
    // Submit results
    await submitQuizResult({
      quizType: quiz.title,
      score: finalScore,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      timeSpent: quiz.timeLimit - timeLeft,
      difficulty: 'medium',
      topics: [quiz.title]
    });
    
    setQuizCompleted(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full glass rounded-2xl p-8">
          <h1 className="text-4xl font-bold mb-4">{quiz.title}</h1>
          <p className="text-gray-300 mb-6">{quiz.description}</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <span>Questions</span>
              <span className="font-semibold">{quiz.questions.length}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <span>Time Limit</span>
              <span className="font-semibold">{formatTime(quiz.timeLimit)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <span>Difficulty</span>
              <span className="font-semibold capitalize">Medium</span>
            </div>
          </div>
          
          <button
            onClick={startQuiz}
            className="w-full py-3 bg-primary-600 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full glass rounded-2xl p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary-600 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-gray-400 mb-8">Great job! Here's how you did:</p>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <div className="text-3xl font-bold text-primary-400">{Math.round(score)}%</div>
              <div className="text-sm text-gray-400">Score</div>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <div className="text-3xl font-bold text-primary-400">
                {answers.filter((a, i) => a === quiz.questions[i].correctAnswer).length}
              </div>
              <div className="text-sm text-gray-400">Correct</div>
            </div>
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <div className="text-3xl font-bold text-primary-400">
                {formatTime(quiz.timeLimit - timeLeft)}
              </div>
              <div className="text-sm text-gray-400">Time</div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-primary-600 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="text-gray-400">Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <h2 className="text-2xl font-bold mt-1">{quiz.title}</h2>
          </div>
          <div className="text-2xl font-mono bg-gray-800 px-4 py-2 rounded-lg">
            {formatTime(timeLeft)}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Question */}
        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl mb-6">{question.text}</h3>
          
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  answers[currentQuestion] === index
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800/50 hover:bg-gray-700/50'
                }`}
              >
                <span className="inline-block w-8">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>
          
          <button
            onClick={nextQuestion}
            disabled={answers[currentQuestion] === undefined}
            className="w-full py-3 bg-primary-600 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;