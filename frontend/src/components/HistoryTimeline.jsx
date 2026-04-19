import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const HistoryTimeline = () => {
  const navigate = useNavigate();
  const { submitQuizResult, currentMood, user } = useStore();
  
  const [gameState, setGameState] = useState('menu'); // menu, playing, completed
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [userArrangement, setUserArrangement] = useState([]);
  const [roundsCompleted, setRoundsCompleted] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');

  // Timeline data
  const timelineRounds = [
    {
      id: 'ancient',
      name: 'Ancient Civilizations',
      events: [
        { id: 1, year: -3100, event: 'First Dynasty of Egypt' },
        { id: 2, year: -2334, event: 'Akkadian Empire founded' },
        { id: 3, year: -1754, event: 'Code of Hammurabi' },
        { id: 4, year: -1046, event: 'Zhou Dynasty in China' },
        { id: 5, year: -776, event: 'First Olympic Games' }
      ]
    },
    {
      id: 'medieval',
      name: 'Medieval Period',
      events: [
        { id: 1, year: 476, event: 'Fall of Western Roman Empire' },
        { id: 2, year: 622, event: 'Hijra - Islamic calendar begins' },
        { id: 3, year: 1066, event: 'Norman Conquest of England' },
        { id: 4, year: 1215, event: 'Magna Carta signed' },
        { id: 5, year: 1347, event: 'Black Death reaches Europe' }
      ]
    },
    {
      id: 'modern',
      name: 'Modern Era',
      events: [
        { id: 1, year: 1492, event: 'Columbus reaches Americas' },
        { id: 2, year: 1776, event: 'American Declaration of Independence' },
        { id: 3, year: 1789, event: 'French Revolution begins' },
        { id: 4, year: 1914, event: 'World War I begins' },
        { id: 5, year: 1969, event: 'Moon landing' }
      ]
    }
  ];

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleGameComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  const startGame = () => {
    setGameState('playing');
    setCurrentRound(0);
    setScore(0);
    setTimeLeft(600); // 10 minutes
    setRoundsCompleted([]);
    loadRound(0);
  };

  const loadRound = (roundIndex) => {
    const round = timelineRounds[roundIndex];
    // Shuffle events for the challenge
    const shuffledEvents = [...round.events].sort(() => Math.random() - 0.5);
    setTimelineEvents(shuffledEvents);
    setUserArrangement([]);
  };

  const moveEvent = (fromIndex, toIndex) => {
    const newArrangement = [...userArrangement];
    const [movedEvent] = newArrangement.splice(fromIndex, 1);
    newArrangement.splice(toIndex, 0, movedEvent);
    setUserArrangement(newArrangement);
  };

  const addToArrangement = (event) => {
    if (!userArrangement.find(e => e.id === event.id)) {
      setUserArrangement([...userArrangement, event]);
    }
  };

  const removeFromArrangement = (eventId) => {
    setUserArrangement(userArrangement.filter(e => e.id !== eventId));
  };

  const submitTimeline = () => {
    const round = timelineRounds[currentRound];
    const correctOrder = round.events.sort((a, b) => a.year - b.year);
    const userOrder = userArrangement.map(e => e.year);
    const correctOrderYears = correctOrder.map(e => e.year);
    
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrderYears);
    
    if (isCorrect) {
      setScore(prev => prev + 200);
      setRoundsCompleted([...roundsCompleted, currentRound]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      
      if (currentRound < timelineRounds.length - 1) {
        setCurrentRound(currentRound + 1);
        loadRound(currentRound + 1);
      } else {
        handleGameComplete();
      }
    } else {
      setScore(prev => Math.max(0, prev - 30));
      // Show correct order briefly
      setTimeout(() => {
        loadRound(currentRound);
      }, 3000);
    }
  };

  const handleGameComplete = async () => {
    setGameState('completed');
    
    // Submit game result
    await submitQuizResult({
      quizId: 'history-timeline-game',
      quizTitle: 'History Timeline Challenge',
      quizType: 'History Game',
      score: score,
      totalQuestions: timelineRounds.length,
      correctAnswers: roundsCompleted.length,
      timeSpent: 600 - timeLeft,
      difficulty: difficulty,
      topics: ['History', 'Timeline'],
      mood: currentMood?.emotion
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'menu') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="max-w-3xl w-full glass rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">⏳</div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              History Timeline
            </h1>
            <p className="text-gray-300">Arrange historical events in chronological order!</p>
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
              <label className="block text-sm text-gray-400 mb-2">Rounds</label>
              <div className="w-full bg-gray-700 rounded-lg p-2 text-white">
                {timelineRounds.length} Timeline Rounds
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-primary-600/20 rounded-lg">
              <span>⏳ Chronological Sorting</span>
              <span className="text-primary-400">✓</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary-600/20 rounded-lg">
              <span>📚 Historical Learning</span>
              <span className="text-primary-400">✓</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary-600/20 rounded-lg">
              <span>🎯 Time Pressure Challenge</span>
              <span className="text-primary-400">✓</span>
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="w-full py-4 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg font-medium hover:from-primary-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Start History Timeline
          </button>
        </div>
      </motion.div>
    );
  }

  if (gameState === 'completed') {
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
                score >= 400 ? 'bg-green-500' : score >= 200 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                <span className="text-3xl font-bold text-white">{score}</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-2">
                {score >= 400 ? '🏆 Timeline Master!' : score >= 200 ? '👍 History Buff!' : '💪 Keep Studying!'}
              </h2>
              <p className="text-gray-400 mb-6">You completed {roundsCompleted.length} out of {timelineRounds.length} timeline rounds!</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {roundsCompleted.length}
                </div>
                <div className="text-sm text-gray-400">Rounds Completed</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {timelineRounds.length}
                </div>
                <div className="text-sm text-gray-400">Total Rounds</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">{score}</div>
                <div className="text-sm text-gray-400">Final Score</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {formatTime(600 - timeLeft)}
                </div>
                <div className="text-sm text-gray-400">Time Taken</div>
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
                onClick={() => setGameState('menu')}
                className="flex-1 py-3 bg-gray-700 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  const current = timelineRounds[currentRound];

  return (
    <div className="min-h-screen p-8">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-gray-400">
              Round {currentRound + 1} of {timelineRounds.length}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl font-bold">{current.name}</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-primary-600/30 text-primary-400">
                {difficulty}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-mono text-red-400">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-gray-400">Time Left</div>
            </div>
            <div className="h-12 w-px bg-gray-700"></div>
            <div className="text-right">
              <div className="text-2xl font-mono text-yellow-400">{score}</div>
              <div className="text-xs text-gray-400">Score</div>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="relative mb-8">
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentRound + 1) / timelineRounds.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Drag & Drop</span>
            <span>⏳ History Timeline</span>
            <span>200 pts per round</span>
          </div>
        </div>
        
        {/* Timeline game area */}
        <motion.div 
          key={currentRound}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass rounded-2xl p-8 mb-4"
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Arrange Events Chronologically</h3>
            <p className="text-gray-400">Drag events to create the correct timeline</p>
          </div>
          
          {/* Timeline display */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4">Your Timeline:</h4>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-500"></div>
              
              <div className="space-y-4">
                {userArrangement.map((event, index) => (
                  <div key={event.id} className="flex items-center">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="ml-4 p-4 bg-gray-800/50 rounded-lg flex-1">
                      <div className="font-semibold">{event.year > 0 ? event.year : `${Math.abs(event.year)} BCE`}</div>
                      <div className="text-gray-400">{event.event}</div>
                    </div>
                    <button
                      onClick={() => removeFromArrangement(event.id)}
                      className="ml-2 p-2 text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Available events */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Available Events:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {timelineEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => addToArrangement(event)}
                  disabled={userArrangement.find(e => e.id === event.id)}
                  className={`p-4 rounded-lg transition-all transform hover:scale-105 text-left ${
                    userArrangement.find(e => e.id === event.id)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="font-semibold">{event.year > 0 ? event.year : `${Math.abs(event.year)} BCE`}</div>
                  <div className="text-sm text-gray-400">{event.event}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Submit button */}
          <div className="text-center">
            <button
              onClick={submitTimeline}
              disabled={userArrangement.length !== timelineEvents.length}
              className="px-8 py-3 bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Timeline
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HistoryTimeline;