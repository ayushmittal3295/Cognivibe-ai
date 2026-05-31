import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const GeographyPuzzle = () => {
  const navigate = useNavigate();
  const { submitQuizResult, currentMood, user } = useStore();
  
  const [gameState, setGameState] = useState('menu'); // menu, playing, completed
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedPieces, setSelectedPieces] = useState([]);
  const [completedPuzzles, setCompletedPuzzles] = useState([]);
  const [hints, setHints] = useState(3);
  const [difficulty, setDifficulty] = useState('medium');

  // Puzzle data
  const puzzles = [
    {
      id: 'europe',
      name: 'Europe Map',
      description: 'Arrange European countries',
      pieces: ['France', 'Germany', 'Italy', 'Spain', 'UK', 'Poland', 'Sweden', 'Netherlands'],
      correctOrder: ['UK', 'France', 'Germany', 'Netherlands', 'Poland', 'Sweden', 'Italy', 'Spain'],
      hint: 'Start from the northwest and work clockwise'
    },
    {
      id: 'asia',
      name: 'Asia Capitals',
      description: 'Match countries to their capitals',
      pieces: ['Tokyo', 'Beijing', 'Mumbai', 'Seoul', 'Bangkok', 'Jakarta', 'Manila', 'Singapore'],
      correctOrder: ['Tokyo', 'Beijing', 'Seoul', 'Bangkok', 'Singapore', 'Mumbai', 'Jakarta', 'Manila'],
      hint: 'Think of major economic hubs'
    },
    {
      id: 'americas',
      name: 'Americas Geography',
      description: 'Order from north to south',
      pieces: ['Canada', 'USA', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
      correctOrder: ['Canada', 'USA', 'Mexico', 'Colombia', 'Peru', 'Brazil', 'Chile', 'Argentina'],
      hint: 'Follow the continents from top to bottom'
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
    setCurrentPuzzle(0);
    setScore(0);
    setTimeLeft(300); // 5 minutes
    setSelectedPieces([]);
    setCompletedPuzzles([]);
    setHints(3);
  };

  const handlePieceSelect = (piece) => {
    if (selectedPieces.includes(piece)) {
      setSelectedPieces(selectedPieces.filter(p => p !== piece));
    } else {
      setSelectedPieces([...selectedPieces, piece]);
    }
  };

  const submitArrangement = () => {
    const current = puzzles[currentPuzzle];
    const isCorrect = JSON.stringify(selectedPieces) === JSON.stringify(current.correctOrder);
    
    if (isCorrect) {
      setScore(prev => prev + 100);
      setCompletedPuzzles([...completedPuzzles, currentPuzzle]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      
      if (currentPuzzle < puzzles.length - 1) {
        setCurrentPuzzle(currentPuzzle + 1);
        setSelectedPieces([]);
      } else {
        handleGameComplete();
      }
    } else {
      setScore(prev => Math.max(0, prev - 20));
    }
  };

  const useHint = () => {
    if (hints > 0) {
      setHints(hints - 1);
      alert(puzzles[currentPuzzle].hint);
    }
  };

  const handleGameComplete = async () => {
    setGameState('completed');
    
    // Submit game result
    await submitQuizResult({
      quizId: 'geography-puzzle-game',
      quizTitle: 'Geography Puzzle Challenge',
      quizType: 'Geography Game',
      score: score,
      totalQuestions: puzzles.length,
      correctAnswers: completedPuzzles.length,
      timeSpent: 300 - timeLeft,
      difficulty: difficulty,
      topics: ['Geography', 'Puzzles'],
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
            <div className="text-6xl mb-4 animate-bounce">🧩</div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              Geography Puzzle
            </h1>
            <p className="text-gray-300">Arrange countries, capitals, and landmarks!</p>
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
              <label className="block text-sm text-gray-400 mb-2">Puzzles</label>
              <div className="w-full bg-gray-700 rounded-lg p-2 text-white">
                {puzzles.length} Puzzles
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-primary-600/20 rounded-lg">
              <span>🧩 Interactive Puzzles</span>
              <span className="text-primary-400">✓</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary-600/20 rounded-lg">
              <span>🌍 Geography Learning</span>
              <span className="text-primary-400">✓</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary-600/20 rounded-lg">
              <span>⏱️ Time Challenge</span>
              <span className="text-primary-400">✓</span>
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="w-full py-4 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg font-medium hover:from-primary-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Start Geography Puzzle
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
                score >= 200 ? 'bg-green-500' : score >= 100 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                <span className="text-3xl font-bold text-white">{score}</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-2">
                {score >= 200 ? '🏆 Geography Master!' : score >= 100 ? '👍 Great Explorer!' : '💪 Keep Exploring!'}
              </h2>
              <p className="text-gray-400 mb-6">You completed {completedPuzzles.length} out of {puzzles.length} puzzles!</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {completedPuzzles.length}
                </div>
                <div className="text-sm text-gray-400">Puzzles Solved</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {hints}
                </div>
                <div className="text-sm text-gray-400">Hints Left</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">{score}</div>
                <div className="text-sm text-gray-400">Final Score</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {formatTime(300 - timeLeft)}
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

  const current = puzzles[currentPuzzle];

  return (
    <div className="min-h-screen p-8">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-gray-400">
              Puzzle {currentPuzzle + 1} of {puzzles.length}
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
              style={{ width: `${((currentPuzzle + 1) / puzzles.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Hints: {hints}</span>
            <span>🧩 Geography Puzzle</span>
            <span>100 pts per puzzle</span>
          </div>
        </div>
        
        {/* Puzzle area */}
        <motion.div 
          key={currentPuzzle}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass rounded-2xl p-8 mb-4"
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">{current.description}</h3>
            <p className="text-gray-400">Arrange the pieces in the correct order</p>
          </div>
          
          {/* Selected pieces display */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Your Arrangement:</h4>
            <div className="flex flex-wrap gap-2 min-h-16 p-4 bg-gray-800/30 rounded-lg">
              {selectedPieces.map((piece, index) => (
                <span key={piece} className="px-3 py-1 bg-primary-600/30 rounded-full text-sm">
                  {index + 1}. {piece}
                </span>
              ))}
            </div>
          </div>
          
          {/* Available pieces */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Available Pieces:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {current.pieces.map((piece) => (
                <button
                  key={piece}
                  onClick={() => handlePieceSelect(piece)}
                  className={`p-3 rounded-lg transition-all transform hover:scale-105 ${
                    selectedPieces.includes(piece)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                >
                  {piece}
                </button>
              ))}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-between gap-3">
            <button
              onClick={useHint}
              disabled={hints === 0}
              className="px-4 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💡 Hint ({hints})
            </button>
            
            <button
              onClick={submitArrangement}
              disabled={selectedPieces.length !== current.pieces.length}
              className="px-6 py-2 bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Arrangement
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GeographyPuzzle;