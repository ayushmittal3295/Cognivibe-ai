import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';
import LearningModule from './components/LearningModule';
import Quiz from './components/Quiz';
import GeographyPuzzle from './components/GeographyPuzzle';
import HistoryTimeline from './components/HistoryTimeline';
import ScienceLab from './components/ScienceLab';
import Scene3D from './3d/Scene3D';

function App() {
  const { isAuthenticated, checkAuth } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="relative min-h-screen">
        {/* Only show 3D background on dashboard when authenticated */}
        {isAuthenticated && window.location.pathname.includes('/dashboard') && <Scene3D />}
        
        {/* Main Content */}
        <div className="relative z-10">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
            />
            <Route 
              path="/signup" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignupPage />} 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/learn/:topic" 
              element={isAuthenticated ? <LearningModule /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/quiz/:quizId" 
              element={isAuthenticated ? <Quiz /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/game/geography-puzzle" 
              element={isAuthenticated ? <GeographyPuzzle /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/game/history-timeline" 
              element={isAuthenticated ? <HistoryTimeline /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/game/science-lab" 
              element={isAuthenticated ? <ScienceLab /> : <Navigate to="/login" />} 
            />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;