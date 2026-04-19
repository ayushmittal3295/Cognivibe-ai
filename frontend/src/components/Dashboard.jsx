import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import EmotionDetector from '../ai/EmotionDetector';
import TeacherAI from '../ai/TeacherAI';
import ChatbotAI from '../ai/ChatbotAI';
import gsap from 'gsap';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user, currentMood, setCurrentMood, recordMood, fetchMoodHistory, logout } = useStore();
  const [moodStats, setMoodStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showWebcam, setShowWebcam] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [detectionStatus, setDetectionStatus] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMoodHistory();
  }, []);

  useEffect(() => {
    if (currentMood) {
      const recs = TeacherAI.generateRecommendations(user, currentMood.emotion);
      setRecommendations(recs);
    }
  }, [currentMood]);

  const loadMoodHistory = async () => {
    const stats = await fetchMoodHistory(7);
    setMoodStats(stats);
  };

  const startWebcam = async () => {
    try {
      setModelsLoading(true);
      setCameraError('');
      setDetectionStatus('Initializing camera...');
      
      setShowWebcam(true);
      
      setTimeout(async () => {
        try {
          if (!videoRef.current) {
            throw new Error('Video element not found');
          }
          
          console.log('Starting webcam with video element:', videoRef.current);
          
          setDetectionStatus('Requesting camera access...');
          await EmotionDetector.startWebcam(videoRef.current);
          
          if (videoRef.current) {
            videoRef.current.style.width = '100%';
            videoRef.current.style.height = 'auto';
            videoRef.current.style.transform = 'scaleX(-1)';
            videoRef.current.style.display = 'block';
          }
          
          setModelsLoading(false);
          setDetectionStatus('Detecting emotions...');
          
          EmotionDetector.startContinuousDetection(async (detection) => {
            setCurrentMood(detection);
            
            console.log('Real-time emotion:', detection.emotion, 
                        'confidence:', (detection.confidence * 100).toFixed(1) + '%');
            
            recordMood({
              emotion: detection.emotion,
              confidence: detection.confidence,
              source: 'webcam',
              metadata: detection.allEmotions
            }).catch(err => console.error('Error recording mood:', err));
            
            setDetectionStatus(`Detected: ${detection.emotion}`);
          }, 500);
          
        } catch (error) {
          console.error('Failed to start webcam:', error);
          setModelsLoading(false);
          setCameraError(error.message || 'Failed to start webcam');
          setShowWebcam(false);
          setDetectionStatus('');
        }
      }, 100);
      
    } catch (error) {
      console.error('Failed to start webcam:', error);
      setModelsLoading(false);
      setCameraError(error.message || 'Failed to start webcam');
      setDetectionStatus('');
    }
  };

  const stopWebcam = () => {
    EmotionDetector.stopWebcam();
    EmotionDetector.stopContinuousDetection();
    setShowWebcam(false);
    setCameraError('');
    setCurrentMood(null);
    setDetectionStatus('');
  };

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Mood Intensity',
        data: [7, 6, 8, 5, 7, 8, 9],
        borderColor: currentMood ? EmotionDetector.getEmotionColor(currentMood.emotion) : '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'white'
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      }
    }
  };

  const moodDistributionData = {
    labels: moodStats ? Object.keys(moodStats.moodDistribution) : [],
    datasets: [
      {
        data: moodStats ? Object.values(moodStats.moodDistribution) : [],
        backgroundColor: [
          '#FFD700',
          '#4169E1',
          '#DC143C',
          '#AA44FF',
          '#88AAFF',
          '#44FFAA',
          '#808080'
        ]
      }
    ]
  };

  // Quiz navigation handlers
  const handleQuizNavigation = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  // Game navigation handlers
  const handleGameNavigation = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  const handleRecommendationClick = (rec) => {
    if (rec.type === 'quiz') {
      // Map recommendation titles to quiz IDs
      const quizMap = {
        'JavaScript': 'javascript-fundamentals',
        'React': 'react-hooks',
        'Python': 'python-basics'
      };
      
      // Try to find a matching quiz
      const topic = Object.keys(quizMap).find(key => 
        rec.title.toLowerCase().includes(key.toLowerCase())
      );
      
      const quizId = quizMap[topic] || 'javascript-fundamentals';
      navigate(`/quiz/${quizId}`);
    } else if (rec.type === 'lesson') {
      navigate(`/learn/${rec.title.toLowerCase().replace(/\s+/g, '-')}`);
    } else if (rec.type === 'break') {
      alert(`🧘 Take a ${rec.duration} minute break! Your brain will thank you.`);
    }
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-400 mt-2">
            Your learning environment adapts to your emotional state
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Chatbot Toggle Button */}
          <button
            onClick={() => setShowChatbot(!showChatbot)}
            className={`p-2 rounded-lg transition-colors ${
              showChatbot ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="AI Learning Assistant"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>

          {/* Current Mood Indicator */}
          {currentMood && (
            <div className="flex items-center space-x-3 glass px-4 py-2 rounded-full animate-pulse">
              <span className="text-2xl">{EmotionDetector.getEmotionEmoji?.(currentMood.emotion) || '😐'}</span>
              <div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full animate-ping"
                    style={{ backgroundColor: EmotionDetector.getEmotionColor(currentMood.emotion) }}
                  ></div>
                  <div 
                    className="w-3 h-3 rounded-full absolute"
                    style={{ backgroundColor: EmotionDetector.getEmotionColor(currentMood.emotion) }}
                  ></div>
                  <span className="text-white capitalize font-semibold">{currentMood.emotion}</span>
                </div>
                <span className="text-gray-400 text-xs">
                  {(currentMood.confidence * 100).toFixed(0)}% confident
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={logout}
            className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Mood & Webcam */}
        <div className="space-y-8">
          {/* Webcam Card */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Emotion Detection</h2>
            
            {cameraError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-200 rounded-lg">
                {cameraError}
              </div>
            )}
            
            {detectionStatus && !cameraError && (
              <div className="mb-4 p-2 bg-blue-500/20 text-blue-200 rounded-lg text-sm text-center">
                {detectionStatus}
              </div>
            )}
            
            {showWebcam ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full rounded-lg"
                  style={{ 
                    minHeight: '240px',
                    backgroundColor: '#1a1a1a',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                    display: 'block'
                  }}
                  onLoadedData={() => {
                    console.log('Video loaded successfully');
                  }}
                  onError={(e) => console.error('Video error:', e)}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {currentMood && (
                  <div className="absolute bottom-4 left-4 right-4 glass rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{EmotionDetector.getEmotionEmoji?.(currentMood.emotion) || '😐'}</span>
                        <span className="capitalize font-semibold text-lg">{currentMood.emotion}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-300">
                          {(currentMood.confidence * 100).toFixed(0)}%
                        </span>
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${currentMood.confidence * 100}%`,
                              backgroundColor: EmotionDetector.getEmotionColor(currentMood.emotion)
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {currentMood.allEmotions && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(currentMood.allEmotions)
                          .sort(([,a], [,b]) => b - a)
                          .map(([emotion, score]) => (
                          <div key={emotion} className="flex items-center justify-between">
                            <span className="text-gray-400 capitalize">{emotion}:</span>
                            <div className="flex items-center space-x-1">
                              <span className="text-white font-mono">{(score * 100).toFixed(0)}%</span>
                              <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full"
                                  style={{ 
                                    width: `${score * 100}%`,
                                    backgroundColor: EmotionDetector.getEmotionColor(emotion)
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={stopWebcam}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-full hover:bg-red-600 transition-colors"
                  title="Stop Webcam"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={startWebcam}
                disabled={modelsLoading}
                className="w-full py-12 border-2 border-dashed border-gray-600 rounded-lg hover:border-primary-500 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {modelsLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="text-gray-400">Loading face detection models...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-400 group-hover:text-primary-400">Start Webcam Detection</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Mood Statistics */}
          {moodStats && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Mood Distribution</h2>
              <div className="h-64">
                <Doughnut data={moodDistributionData} options={{ maintainAspectRatio: false }} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-400">Dominant Mood: 
                  <span className="ml-2 text-white font-semibold capitalize">{moodStats.dominantMood}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Middle Column - Learning Recommendations */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mood Chart */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Weekly Mood Pattern</h2>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Personalized Recommendations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-all cursor-pointer transform hover:scale-105"
                    onClick={() => handleRecommendationClick(rec)}
                  >
                    <h3 className="font-semibold text-primary-400 mb-2">{rec.title}</h3>
                    <p className="text-sm text-gray-400">{rec.reason}</p>
                    
                    {rec.type === 'quiz' && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                        Interactive Quiz 🧠
                      </span>
                    )}
                    
                    {rec.type === 'lesson' && (
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                        Learning Path 📚
                      </span>
                    )}
                    
                    {rec.type === 'break' && (
                      <span className="inline-block mt-2 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                        {rec.duration} min break ☕
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 col-span-2 text-center py-4">
                  No recommendations yet. Start learning to get personalized suggestions!
                </p>
              )}
            </div>
          </div>

          {/* GK Quizzes & Games Section */}
          <div className="glass rounded-2xl p-6">
             <h3 className="text-lg font-semibold mb-4 text-primary-400">🧠 Featured Quizzes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* World Geography Quiz Card */}
              <div 
                onClick={() => handleQuizNavigation('world-geography-gk')}
                className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="text-3xl mb-2">🌍</div>
                <h3 className="font-semibold">World Geography</h3>
                <p className="text-xs text-gray-400 mt-1">Explore the Planet</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">Fun Facts</span>
                  <span className="text-xs bg-blue-600/30 px-2 py-1 rounded-full">Medium</span>
                </div>
              </div>
              
              {/* History Trivia Game Card */}
              <div 
                onClick={() => handleQuizNavigation('history-trivia-game')}
                className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="text-3xl mb-2">🏛️</div>
                <h3 className="font-semibold">History Trivia</h3>
                <p className="text-xs text-gray-400 mt-1">Time Travel Game</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">Interactive</span>
                  <span className="text-xs bg-amber-600/30 px-2 py-1 rounded-full">Easy</span>
                </div>
              </div>
              
              {/* Science & Tech GK Card */}
              <div 
                onClick={() => handleQuizNavigation('science-tech-gk')}
                className="bg-gradient-to-br from-green-600/20 to-teal-600/20 rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="text-3xl mb-2">🔬</div>
                <h3 className="font-semibold">Science & Tech</h3>
                <p className="text-xs text-gray-400 mt-1">Modern Discoveries</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">AI Generated</span>
                  <span className="text-xs bg-green-600/30 px-2 py-1 rounded-full">Hard</span>
                </div>
              </div>
            </div>

            {/* Games Section */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4 text-primary-400">🎮 Interactive Games</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Geography Puzzle Game Card */}
                <div 
                  onClick={() => handleGameNavigation('geography-puzzle')}
                  className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="text-3xl mb-2">🧩</div>
                  <h3 className="font-semibold">Geography Puzzle</h3>
                  <p className="text-xs text-gray-400 mt-1">Map & Country Puzzles</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">Puzzle Game</span>
                    <span className="text-xs bg-purple-600/30 px-2 py-1 rounded-full">Fun</span>
                  </div>
                </div>
                
                {/* History Timeline Game Card */}
                <div 
                  onClick={() => handleGameNavigation('history-timeline')}
                  className="bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="text-3xl mb-2">⏳</div>
                  <h3 className="font-semibold">History Timeline</h3>
                  <p className="text-xs text-gray-400 mt-1">Sort Historical Events</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">Timeline Game</span>
                    <span className="text-xs bg-red-600/30 px-2 py-1 rounded-full">Challenging</span>
                  </div>
                </div>
                
                {/* Science Lab Game Card */}
                <div 
                  onClick={() => handleGameNavigation('science-lab')}
                  className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="text-3xl mb-2">🧪</div>
                  <h3 className="font-semibold">Science Lab</h3>
                  <p className="text-xs text-gray-400 mt-1">Virtual Experiments</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">Lab Game</span>
                    <span className="text-xs bg-cyan-600/30 px-2 py-1 rounded-full">Educational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CHATBOT PROMPT REMOVED - No more "Need help?" box here */}
          
        </div>
      </div>

      {/* Floating Chatbot Component - This appears as a floating window when button is clicked */}
      {showChatbot && (
        <ChatbotAI 
          currentMood={currentMood} 
          onClose={() => setShowChatbot(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;