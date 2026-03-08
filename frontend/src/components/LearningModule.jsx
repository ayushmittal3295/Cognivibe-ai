import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import TeacherAI from '../ai/TeacherAI';
import ContentGenerator from '../ai/ContentGenerator';
import gsap from 'gsap';

const LearningModule = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const { user, currentMood, fetchPersonalizedContent, updateProgress } = useStore();
  
  const [content, setContent] = useState(null);
  const [currentModule, setCurrentModule] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});

  useEffect(() => {
    loadContent();
  }, [topic, currentMood]);

  useEffect(() => {
    // Animate content entrance
    gsap.from('.module-content', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    });
  }, [currentModule]);

  const loadContent = async () => {
    setLoading(true);
    
    // Get personalized content from AI
    const path = await fetchPersonalizedContent(topic);
    const generatedContent = ContentGenerator.generateContent(
      topic,
      user?.learningLevel || 'beginner',
      currentMood?.emotion || 'neutral',
      [] // user progress would go here
    );
    
    setContent(generatedContent);
    setLoading(false);
  };

  const handleModuleComplete = async () => {
    // Track progress
    await updateProgress(topic, ((currentModule + 1) / content.modules.length) * 100, currentModule + 1);
    
    if (currentModule < content.modules.length - 1) {
      setCurrentModule(currentModule + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handleQuizSubmit = () => {
    // Calculate score
    const score = calculateScore();
    
    // Submit quiz result
    useStore.getState().submitQuizResult({
      quizType: topic,
      score,
      totalQuestions: content.quiz.totalQuestions,
      correctAnswers: Object.values(quizAnswers).filter(a => a.isCorrect).length,
      timeSpent: 0, // Would track actual time
      difficulty: content.quiz.difficulty,
      topics: [topic]
    });
    
    // Show results and navigate
    navigate('/dashboard');
  };

  const calculateScore = () => {
    const correct = Object.values(quizAnswers).filter(a => a.isCorrect).length;
    return (correct / content.quiz.totalQuestions) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (showQuiz) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6">Quiz: {topic}</h2>
            <p className="text-gray-400 mb-8">Test your knowledge</p>
            
            <div className="space-y-6">
              {content.quiz.questions.map((q, index) => (
                <div key={q.id} className="bg-gray-800/30 rounded-lg p-6">
                  <p className="font-medium mb-4">{index + 1}. {q.text}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => (
                      <label key={optIndex} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/30 cursor-pointer">
                        <input
                          type="radio"
                          name={`q${q.id}`}
                          value={optIndex}
                          onChange={(e) => {
                            setQuizAnswers({
                              ...quizAnswers,
                              [q.id]: {
                                selected: parseInt(e.target.value),
                                isCorrect: parseInt(e.target.value) === q.correctAnswer
                              }
                            });
                          }}
                          className="text-primary-500 focus:ring-primary-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleQuizSubmit}
              disabled={Object.keys(quizAnswers).length !== content.quiz.totalQuestions}
              className="mt-8 w-full py-3 bg-primary-600 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const module = content.modules[currentModule];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Module {currentModule + 1} of {content.modules.length}</span>
            <span>{Math.round(((currentModule + 1) / content.modules.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentModule + 1) / content.modules.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Module Content */}
        <div className="module-content glass rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-4">{module.title}</h2>
          
          {module.explanationStyle === 'simple' && (
            <div className="mb-6 p-4 bg-blue-500/20 rounded-lg">
              <p className="text-blue-300">✨ Simplified for better understanding</p>
            </div>
          )}
          
          {module.motivation && (
            <div className="mb-6 p-4 bg-green-500/20 rounded-lg">
              <p className="text-green-300">💪 {module.motivation}</p>
            </div>
          )}
          
          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-gray-300 text-lg leading-relaxed">{module.content}</p>
          </div>
          
          {module.analogy && (
            <div className="mb-8 p-6 bg-purple-500/20 rounded-lg">
              <h3 className="text-purple-300 font-semibold mb-2">💡 Think of it this way:</h3>
              <p className="text-gray-300">{module.analogy}</p>
            </div>
          )}
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Examples</h3>
            <div className="space-y-4">
              {module.examples.map((example, index) => (
                <pre key={index} className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
                  <code className="text-green-400">{example}</code>
                </pre>
              ))}
            </div>
          </div>
          
          {module.extraHelp && (
            <div className="mb-8 p-4 bg-yellow-500/20 rounded-lg">
              <h4 className="text-yellow-300 font-semibold mb-2">📚 Need extra help?</h4>
              <p className="text-gray-300">Here's a simpler explanation:</p>
              <p className="mt-2 text-gray-400">{module.simplifiedVersion.content}</p>
            </div>
          )}
          
          <button
            onClick={handleModuleComplete}
            className="w-full py-3 bg-primary-600 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            {currentModule === content.modules.length - 1 ? 'Take Quiz' : 'Next Module'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningModule;