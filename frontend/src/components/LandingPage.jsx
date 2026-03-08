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
              <div className="hero-image mt-8 flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 border-2 border-gray-900"></div>
                  ))}
                </div>
                <p className="text-gray-400">
                  <span className="text-white font-semibold">10,000+</span> learners already joined
                </p>
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
            <div className="w-1 h-2 bg-white rounded-full mt-2 animate-scroll"></div>
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

      {/* How It Works Section */}
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
                <div className="glass rounded-2xl p-8 text-center relative z-10">
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <div className="text-6xl font-bold text-primary-500/20 mb-2">{step.number}</div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
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