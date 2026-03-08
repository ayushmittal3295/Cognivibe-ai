import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import gsap from 'gsap';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    gsap.fromTo('.login-card',
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
    );
    
    gsap.fromTo('.form-field',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.2, ease: 'power3.out' }
    );
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(formData.email, formData.password);
    
    if (success) {
      gsap.to('.login-card', {
        opacity: 0,
        y: -50,
        duration: 0.5,
        onComplete: () => navigate('/dashboard')
      });
    } else {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-full filter blur-3xl"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-[15%] w-10 h-10 glass rounded-lg flex items-center justify-center animate-float opacity-60">
        <span className="text-lg">😊</span>
      </div>
      <div className="absolute bottom-32 left-[15%] w-10 h-10 glass rounded-lg flex items-center justify-center animate-float animation-delay-2000 opacity-60">
        <span className="text-lg">✓</span>
      </div>
      <div className="absolute top-1/3 left-[10%] w-8 h-8 glass rounded-lg flex items-center justify-center animate-float animation-delay-4000 opacity-60">
        <span className="text-base">⚡</span>
      </div>

      {/* Login Card */}
      <div className="login-card relative z-10 w-full max-w-md">
        <div className="glass rounded-2xl p-8 shadow-2xl border border-white/10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🧠</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-1 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-center text-sm mb-6">
            Sign in to continue your learning journey
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-field space-y-1">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-4 py-3 bg-gray-800/30 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="form-field space-y-1">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-4 py-3 bg-gray-800/30 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="form-field flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="w-3.5 h-3.5 text-primary-500 bg-gray-800 border-gray-600 rounded focus:ring-primary-500/50" />
                <span className="ml-2 text-gray-400">Remember me</span>
              </label>
              <a href="#" className="text-primary-400 hover:text-primary-300 text-xs transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="form-field w-full py-3 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg text-white font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  gsap.to('.login-card', {
                    opacity: 0,
                    y: -50,
                    duration: 0.3,
                    onComplete: () => navigate('/signup')
                  });
                }}
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Social Login - Full Width Buttons with Logos */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-gray-900 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <button className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors">
                <span className="text-lg text-blue-400">G</span>
                <span className="text-sm text-gray-300">Google</span>
              </button>
              <button className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors">
                <span className="text-lg text-gray-300">⌨️</span>
                <span className="text-sm text-gray-300">GitHub</span>
              </button>
              <button className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors">
                <span className="text-lg text-blue-300">M</span>
                <span className="text-sm text-gray-300">Microsoft</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;