import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useStore();
  
  // Refs for animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  // Animation on scroll
  useEffect(() => {
    // Hero section animation
    gsap.fromTo('.hero-title', 
      { opacity: 0, y: 100 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
    
    gsap.fromTo('.hero-subtitle', 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power3.out' }
    );
    
    gsap.fromTo('.hero-cta', 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, delay: 0.6, ease: 'power3.out' }
    );
    
    gsap.fromTo('.hero-image', 
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 1.2, delay: 0.4, ease: 'back.out(1.7)' }
    );

    // Features section animation
    gsap.fromTo('.features-title',
      { opacity: 0, y: 50 },
      { 
        opacity: 1, y: 0, duration: 1,
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    gsap.fromTo('.feature-card',
      { opacity: 0, y: 50 },
      { 
        opacity: 1, y: 0, duration: 0.8, stagger: 0.2,
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 70%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Stats section animation
    gsap.fromTo('.stat-item',
      { opacity: 0, scale: 0.5 },
      { 
        opacity: 1, scale: 1, duration: 0.8, stagger: 0.2,
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // How it works section
    gsap.fromTo('.step-card',
      { opacity: 0, x: -50 },
      { 
        opacity: 1, x: 0, duration: 0.8, stagger: 0.3,
        scrollTrigger: {
          trigger: howItWorksRef.current,
          start: 'top 70%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // CTA section
    gsap.fromTo('.cta-content',
      { opacity: 0, y: 50 },
      { 
        opacity: 1, y: 0, duration: 1,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );

  }, []);

  const features = [
    {
      icon: '😊',
      title: 'Emotion-Adaptive Learning',
      description: 'Our AI detects your emotional state in real-time and adapts content difficulty, pacing, and style to match your mood.',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: '🎯',
      title: 'Personalized Recommendations',
      description: 'Get tailored learning paths based on your emotional patterns, learning history, and performance metrics.',
      color: 'from-blue-400 to-indigo-500'
    },
    {
      icon: '🧠',
      title: 'Real-time Emotion Detection',
      description: 'Advanced facial recognition and text analysis to understand how you feel while learning.',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: '📊',
      title: 'Mood Analytics Dashboard',
      description: 'Visualize your emotional patterns over time and discover when you learn best.',
      color: 'from-green-400 to-teal-500'
    },
    {
      icon: '🎮',
      title: 'Gamified Experience',
      description: 'Interactive quizzes and challenges that adapt to keep you engaged and motivated.',
      color: 'from-red-400 to-pink-500'
    },
    {
      icon: '🌐',
      title: '3D Interactive Environment',
      description: 'Immersive 3D visualizations that respond to your emotional state in real-time.',
      color: 'from-indigo-400 to-purple-500'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Sign Up',
      description: 'Create your free account in seconds. No credit card required.',
      icon: '📝'
    },
    {
      number: '02',
      title: 'Start Learning',
      description: 'Choose a topic and begin your personalized learning journey.',
      icon: '🚀'
    },
    {
      number: '03',
      title: 'Get Detected',
      description: 'Our AI analyzes your emotions through webcam or text input.',
      icon: '🔍'
    },
    {
      number: '04',
      title: 'Adapt & Grow',
      description: 'Content automatically adapts to your emotional state for optimal learning.',
      icon: '📈'
    }
  ];

  const stats = [
    { value: '95%', label: 'User Satisfaction' },
    { value: '3x', label: 'Faster Learning' },
    { value: '24/7', label: 'AI Support' },
    { value: '10k+', label: 'Active Users' }
  ];

  // REAL user photos from randomuser.me API (reliable and always available)
  const userPhotos = [
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://randomuser.me/api/portraits/women/68.jpg',
    'https://randomuser.me/api/portraits/men/75.jpg',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Custom Cursor Effect */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 mix-blend-overlay">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-purple-500/5"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-2 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                Cognivibe AI
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
              <a href="#stats" className="text-gray-300 hover:text-white transition-colors">Stats</a>
              
              {/* Conditional rendering based on auth state */}
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                  >
                    Sign Up Free
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/30 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6">
                Learn Smarter with{' '}
                <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                  Emotion AI
                </span>
              </h1>
              <p className="hero-subtitle text-xl text-gray-300 mb-8 leading-relaxed">
                The first learning platform that adapts to your emotions in real-time. 
                Feel stressed? We simplify. Bored? We gamify. Focused? We challenge you.
              </p>
              <div className="hero-cta flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-primary-500/30 transition-all transform hover:scale-105"
                >
                  Start Learning Free
                </button>
                <button className="px-8 py-4 glass rounded-xl text-lg font-semibold hover:bg-white/10 transition-all">
                  Watch Demo
                </button>
              </div>
              
              {/* REAL user photos in circles */}
              <div className="hero-image mt-8 flex items-center space-x-4">
                <div className="flex -space-x-3">
                  {userPhotos.slice(0, 5).map((photo, index) => (
                    <img 
                      key={index}
                      src={photo} 
                      alt={`User ${index + 1}`} 
                      className="w-10 h-10 rounded-full border-2 border-gray-900 object-cover hover:scale-110 hover:border-primary-400 transition-all duration-300"
                      title={`Happy Learner ${index + 1}`}
                    />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 border-2 border-gray-900 flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform">
                    +5k
                  </div>
                </div>
                <p className="text-gray-400">
                  <span className="text-white font-semibold">10,000+</span> learners already joined
                </p>
              </div>

              {/* Social media links */}
              <div className="mt-6 flex items-center space-x-6">
                
              </div>
            </div>
            
            <div className="relative">
              <div className="hero-image relative w-full aspect-square">
                {/* 3D Sphere Preview */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-r from-primary-400 to-purple-400 rounded-full animate-spin-slow shadow-2xl shadow-primary-500/50 flex items-center justify-center">
                    <div className="w-48 h-48 md:w-60 md:h-60 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse-slow flex items-center justify-center">
                      <span className="text-6xl animate-float">🧠</span>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-10 left-0 w-16 h-16 glass rounded-xl flex items-center justify-center animate-float">
                  <span className="text-2xl">😊</span>
                </div>
                <div className="absolute bottom-20 right-0 w-16 h-16 glass rounded-xl flex items-center justify-center animate-float animation-delay-2000">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="absolute top-1/2 -right-8 w-16 h-16 glass rounded-xl flex items-center justify-center animate-float animation-delay-4000">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="features-title text-4xl md:text-5xl font-bold mb-4">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                Cognivibe AI
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the future of personalized learning with our cutting-edge emotion-adaptive technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card group relative bg-gray-800/30 rounded-2xl p-8 hover:bg-gray-800/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/20"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}></div>
                <div className="relative">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" ref={statsRef} className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - FIXED with equal card sizes */}
      <section id="how-it-works" ref={howItWorksRef} className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How{' '}
              <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                Cognivibe AI
              </span>
              {' '}Works
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Get started in minutes and experience personalized learning like never before
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="step-card relative">
                <div className="glass rounded-2xl p-8 text-center relative z-10 h-full flex flex-col">
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <div className="text-6xl font-bold text-primary-500/20 mb-2">{step.number}</div>
                  <h3 className="text-xl font-semibold mb-2 min-h-[3rem] flex items-center justify-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-[200px] mx-auto">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="cta-content glass rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500 rounded-full filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of learners who are already experiencing the future of education with Cognivibe AI.
              </p>
              
              {/* User photos in CTA */}
              <div className="flex justify-center items-center space-x-4 mb-6">
                <div className="flex -space-x-3">
                  {userPhotos.slice(0, 5).map((photo, index) => (
                    <img 
                      key={index}
                      src={photo} 
                      alt={`User ${index + 1}`} 
                      className="w-8 h-8 rounded-full border-2 border-gray-900 object-cover"
                    />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 border-2 border-gray-900 flex items-center justify-center text-xs font-bold">
                    +5k
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Join <span className="text-white font-semibold">10,000+</span> happy learners
                </p>
              </div>

              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-primary-500/30 transition-all transform hover:scale-105"
              >
                Get Started Free
              </button>
              <p className="text-sm text-gray-400 mt-4">
                No credit card required • Free forever plan available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🧠</span>
                </div>
                <span className="text-xl font-bold">Cognivibe AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Revolutionizing education through emotion-adaptive artificial intelligence.
              </p>
              
              {/* Social media links in footer */}
              <div className="flex space-x-4 mt-4">
                <a 
                  href="https://google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.204 0 22.225 0z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2026 Cognivibe AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;