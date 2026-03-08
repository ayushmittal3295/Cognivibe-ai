import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import gsap from 'gsap';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    gsap.fromTo('.signup-card',
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
    );
    
    gsap.fromTo('.form-field',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out' }
    );
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    if (e.target.name === 'password') {
      const strength = calculatePasswordStrength(e.target.value);
      setPasswordStrength(strength);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]+/)) strength += 25;
    if (password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/)) strength += 25;
    return strength;
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const success = await signup(formData.name, formData.email, formData.password);
    
    if (success) {
      gsap.to('.signup-card', {
        opacity: 0,
        y: -50,
        duration: 0.5,
        onComplete: () => navigate('/dashboard')
      });
    } else {
      setError('Signup failed. Email may already be in use.');
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
        <span className="text-lg">⭐</span>
      </div>
      <div className="absolute bottom-32 left-[15%] w-10 h-10 glass rounded-lg flex items-center justify-center animate-float animation-delay-2000 opacity-60">
        <span className="text-lg">🚀</span>
      </div>
      <div className="absolute top-1/3 left-[10%] w-8 h-8 glass rounded-lg flex items-center justify-center animate-float animation-delay-4000 opacity-60">
        <span className="text-base">✓</span>
      </div>

      {/* Signup Card - Exactly same width as Login */}
      <div className="signup-card relative z-10 w-full max-w-[400px]">
        <div className="glass rounded-2xl p-6 shadow-2xl border border-white/10">
          {/* Logo - Smaller */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">👤</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-center mb-1 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-gray-400 text-center text-xs mb-4">
            Join thousands of learners already using Cognivibe
          </p>

          {error && (
            <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="form-field space-y-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-8 pr-3 py-2 bg-gray-800/30 border border-gray-700 rounded-lg text-white text-xs placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="form-field space-y-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-8 pr-3 py-2 bg-gray-800/30 border border-gray-700 rounded-lg text-white text-xs placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="form-field space-y-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-8 pr-3 py-2 bg-gray-800/30 border border-gray-700 rounded-lg text-white text-xs placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="Create a password"
                />
              </div>
              
              {formData.password && (
                <div className="mt-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[9px] text-gray-500">Password strength:</span>
                    <span className="text-[9px] font-medium" style={{ 
                      color: passwordStrength <= 25 ? '#ef4444' : 
                             passwordStrength <= 50 ? '#f97316' : 
                             passwordStrength <= 75 ? '#eab308' : '#22c55e'
                    }}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="h-0.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getStrengthColor()} transition-all duration-300`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-field space-y-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-8 pr-3 py-2 bg-gray-800/30 border border-gray-700 rounded-lg text-white text-xs placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="Confirm your password"
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-[9px] text-red-400 mt-0.5">Passwords do not match</p>
              )}
            </div>

            <div className="form-field">
              <label className="flex items-start">
                <input type="checkbox" required className="mt-0.5 w-3 h-3 text-primary-500 bg-gray-800 border-gray-600 rounded focus:ring-primary-500/50" />
                <span className="ml-2 text-[10px] text-gray-400">
                  I agree to the{' '}
                  <a href="#" className="text-primary-400 hover:text-primary-300">Terms</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary-400 hover:text-primary-300">Privacy</a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="form-field w-full py-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg text-white font-medium text-xs hover:shadow-lg hover:shadow-primary-500/25 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                  Creating...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-3 text-center">
            <p className="text-xs text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => {
                  gsap.to('.signup-card', {
                    opacity: 0,
                    y: -50,
                    duration: 0.3,
                    onComplete: () => navigate('/login')
                  });
                }}
                className="text-primary-400 hover:text-primary-300 font-medium text-xs transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Social Signup */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-[9px]">
                <span className="px-2 bg-gray-900 text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors">
                <span className="text-sm text-blue-400">G</span>
                <span className="text-[10px] text-gray-300">Google</span>
              </button>
              <button className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors">
                <span className="text-sm text-gray-300">⌨️</span>
                <span className="text-[10px] text-gray-300">GitHub</span>
              </button>
              <button className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors">
                <span className="text-sm text-blue-300">M</span>
                <span className="text-[10px] text-gray-300">Microsoft</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;