import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const ScienceLab = () => {
  const navigate = useNavigate();
  const { submitQuizResult, currentMood, user } = useStore();
  
  const [gameState, setGameState] = useState('menu'); // menu, playing, completed
  const [currentExperiment, setCurrentExperiment] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedTools, setSelectedTools] = useState([]);
  const [experimentResult, setExperimentResult] = useState(null);
  const [completedExperiments, setCompletedExperiments] = useState([]);
  const [lives, setLives] = useState(3);
  const [difficulty, setDifficulty] = useState('medium');

  // Experiment data
  const experiments = [
    {
      id: 'acid-base',
      name: 'Acid-Base Reaction',
      description: 'Mix chemicals to create a neutralization reaction',
      tools: ['Hydrochloric Acid', 'Sodium Hydroxide', 'Litmus Paper', 'Beaker', 'Stirring Rod'],
      correctTools: ['Hydrochloric Acid', 'Sodium Hydroxide', 'Beaker', 'Litmus Paper'],
      result: 'The solution turns neutral (pH 7) and litmus paper shows purple',
      wrongResult: 'The reaction fails or creates unwanted byproducts'
    },
    {
      id: 'electrolysis',
      name: 'Water Electrolysis',
      description: 'Split water into hydrogen and oxygen using electricity',
      tools: ['Water', 'Electrodes', 'Battery', 'Test Tubes', 'Wires'],
      correctTools: ['Water', 'Electrodes', 'Battery', 'Test Tubes', 'Wires'],
      result: 'Bubbles of hydrogen and oxygen gas are produced',
      wrongResult: 'No reaction occurs or dangerous gas mixture forms'
    },
    {
      id: 'photosynthesis',
      name: 'Plant Photosynthesis',
      description: 'Demonstrate how plants convert light to energy',
      tools: ['Elodea Plant', 'Test Tube', 'Light Source', 'Carbon Dioxide', 'Water'],
      correctTools: ['Elodea Plant', 'Test Tube', 'Light Source', 'Water'],
      result: 'Oxygen bubbles are produced as the plant photosynthesizes',
      wrongResult: 'No oxygen production or plant dies'
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
    setCurrentExperiment(0);
    setScore(0);
    setTimeLeft(480); // 8 minutes
    setSelectedTools([]);
    setCompletedExperiments([]);
    setLives(3);
    setExperimentResult(null);
  };

  const handleToolSelect = (tool) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter(t => t !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const runExperiment = () => {
    const current = experiments[currentExperiment];
    const isCorrect = JSON.stringify(selectedTools.sort()) === JSON.stringify(current.correctTools.sort());
    
    if (isCorrect) {
      setScore(prev => prev + 150);
      setExperimentResult({
        success: true,
        message: current.result,
        points: 150
      });
      setCompletedExperiments([...completedExperiments, currentExperiment]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      setLives(prev => prev - 1);
      setScore(prev => Math.max(0, prev - 25));
      setExperimentResult({
        success: false,
        message: current.wrongResult,
        points: -25
      });
      
      if (lives <= 1) {
        handleGameComplete();
        return;
      }
    }
    
    setTimeout(() => {
      if (currentExperiment < experiments.length - 1) {
        setCurrentExperiment(currentExperiment + 1);
        setSelectedTools([]);
        setExperimentResult(null);
      } else {
        handleGameComplete();
      }
    }, 3000);
  };

  const handleGameComplete = async () => {
    setGameState('completed');
    
    // Submit game result
    await submitQuizResult({
      quizId: 'science-lab-game',
      quizTitle: 'Science Lab Experiments',
      quizType: 'Science Game',
      score: score,
      totalQuestions: experiments.length,
      correctAnswers: completedExperiments.length,
      timeSpent: 480 - timeLeft,
      difficulty: difficulty,
      topics: ['Science', 'Experiments'],
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
            <div className="text-6xl mb-4 animate-bounce">🧪</div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              Science Lab
            </h1>
            <p className="text-gray-300">Conduct virtual experiments and learn science!</p>
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
              <label className="block text-sm text-gray-400 mb-2">Experiments</label>
              <div className="w-full bg-gray-700 rounded-lg p-2 text-white">
                {experiments.length} Virtual Labs
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-primary-600/20 rounded-lg">
              <span>🧪 Virtual Experiments</span>
              <span className="text-primary-400">✓</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary-600/20 rounded-lg">
              <span>🔬 Scientific Learning</span>
              <span className="text-primary-400">✓</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary-600/20 rounded-lg">
              <span>❤️ Limited Lives System</span>
              <span className="text-primary-400">✓</span>
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="w-full py-4 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg font-medium hover:from-primary-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Enter Science Lab
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
                score >= 300 ? 'bg-green-500' : score >= 150 ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                <span className="text-3xl font-bold text-white">{score}</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-2">
                {score >= 300 ? '🏆 Lab Genius!' : score >= 150 ? '🔬 Science Explorer!' : '🧪 Keep Experimenting!'}
              </h2>
              <p className="text-gray-400 mb-6">You completed {completedExperiments.length} out of {experiments.length} experiments!</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {completedExperiments.length}
                </div>
                <div className="text-sm text-gray-400">Experiments Done</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {lives}
                </div>
                <div className="text-sm text-gray-400">Lives Left</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">{score}</div>
                <div className="text-sm text-gray-400">Final Score</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {formatTime(480 - timeLeft)}
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
                Experiment Again
              </button>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  const current = experiments[currentExperiment];

  return (
    <div className="min-h-screen p-8">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-gray-400">
              Experiment {currentExperiment + 1} of {experiments.length}
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
            <div className="flex items-center gap-2">
              {[...Array(lives)].map((_, i) => (
                <span key={i} className="text-red-500 text-xl">❤️</span>
              ))}
              {[...Array(3 - lives)].map((_, i) => (
                <span key={i} className="text-gray-600 text-xl">💔</span>
              ))}
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
              style={{ width: `${((currentExperiment + 1) / experiments.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Lives: {lives}</span>
            <span>🧪 Science Lab</span>
            <span>150 pts per experiment</span>
          </div>
        </div>
        
        {/* Experiment area */}
        <motion.div 
          key={currentExperiment}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass rounded-2xl p-8 mb-4"
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">{current.description}</h3>
            <p className="text-gray-400">Select the correct tools and run your experiment</p>
          </div>
          
          {/* Selected tools display */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Selected Tools:</h4>
            <div className="flex flex-wrap gap-2 min-h-16 p-4 bg-gray-800/30 rounded-lg">
              {selectedTools.map((tool) => (
                <span key={tool} className="px-3 py-1 bg-primary-600/30 rounded-full text-sm">
                  {tool}
                </span>
              ))}
            </div>
          </div>
          
          {/* Available tools */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Available Tools:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {current.tools.map((tool) => (
                <button
                  key={tool}
                  onClick={() => handleToolSelect(tool)}
                  className={`p-3 rounded-lg transition-all transform hover:scale-105 ${
                    selectedTools.includes(tool)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>
          
          {/* Experiment result */}
          {experimentResult && (
            <div className={`mb-6 p-4 rounded-lg ${
              experimentResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <p className={`font-semibold mb-2 ${experimentResult.success ? 'text-green-400' : 'text-red-400'}`}>
                {experimentResult.success ? '✅ Experiment Successful!' : '❌ Experiment Failed!'}
                {experimentResult.points > 0 ? ` (+${experimentResult.points} pts)` : ` (${experimentResult.points} pts)`}
              </p>
              <p className="text-sm text-gray-300">{experimentResult.message}</p>
            </div>
          )}
          
          {/* Run experiment button */}
          <div className="text-center">
            <button
              onClick={runExperiment}
              disabled={selectedTools.length === 0 || experimentResult !== null}
              className="px-8 py-3 bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🧪 Run Experiment
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ScienceLab;