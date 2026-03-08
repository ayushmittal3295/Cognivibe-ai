import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,

      // Mood state
      currentMood: null,
      moodHistory: [],
      
      // Learning state
      currentLearningPath: null,
      quizResults: [],
      
      // UI state
      theme: 'dark',
      loading: false,
      error: null,

      // Auth actions
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await axiosInstance.post('/auth/login', { email, password });
          const { token, user } = response.data;
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, loading: false });
          return true;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Login failed', loading: false });
          return false;
        }
      },

      signup: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await axiosInstance.post('/auth/signup', { name, email, password });
          const { token, user } = response.data;
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, loading: false });
          return true;
        } catch (error) {
          set({ error: error.response?.data?.message || 'Signup failed', loading: false });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, currentMood: null });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        set({ loading: true });
        try {
          const response = await axiosInstance.get('/auth/profile');
          set({ user: response.data.user, isAuthenticated: true, loading: false });
        } catch (error) {
          localStorage.removeItem('token');
          set({ user: null, token: null, isAuthenticated: false, loading: false });
        }
      },

      // Mood actions
      setCurrentMood: (mood) => {
        set({ currentMood: mood });
      },

      recordMood: async (moodData) => {
        try {
          const response = await axiosInstance.post('/mood/record', moodData);
          const newMood = response.data.moodEntry;
          set((state) => ({
            moodHistory: [newMood, ...state.moodHistory].slice(0, 100),
            currentMood: newMood
          }));
          return newMood;
        } catch (error) {
          console.error('Error recording mood:', error);
        }
      },

      fetchMoodHistory: async (days = 7) => {
        try {
          const response = await axiosInstance.get(`/mood/history?days=${days}`);
          set({ moodHistory: response.data.history });
          return response.data.statistics;
        } catch (error) {
          console.error('Error fetching mood history:', error);
        }
      },

      analyzeText: async (text) => {
        try {
          const response = await axiosInstance.post('/mood/analyze-text', { text });
          return response.data;
        } catch (error) {
          console.error('Error analyzing text:', error);
        }
      },

      // Learning actions
      fetchPersonalizedContent: async (topic) => {
        try {
          const response = await axiosInstance.get(`/learning/content${topic ? `?topic=${topic}` : ''}`);
          set({ currentLearningPath: response.data.learningPath });
          return response.data;
        } catch (error) {
          console.error('Error fetching content:', error);
        }
      },

      submitQuizResult: async (quizData) => {
        try {
          const response = await axiosInstance.post('/learning/quiz', quizData);
          set((state) => ({
            quizResults: [response.data.quizResult, ...state.quizResults]
          }));
          return response.data;
        } catch (error) {
          console.error('Error submitting quiz:', error);
        }
      },

      fetchQuizHistory: async () => {
        try {
          const response = await axiosInstance.get('/learning/quiz-history');
          set({ quizResults: response.data.history });
          return response.data.statistics;
        } catch (error) {
          console.error('Error fetching quiz history:', error);
        }
      },

      updateProgress: async (topic, progress, completedLevel) => {
        try {
          const response = await axiosInstance.post('/learning/progress', {
            topic,
            progress,
            completedLevel
          });
          set({ currentLearningPath: response.data.learningPath });
          return response.data;
        } catch (error) {
          console.error('Error updating progress:', error);
        }
      },

      // UI actions
      setTheme: (theme) => set({ theme }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'cognivibe-storage',
      partialize: (state) => ({
        user: state.user,
        theme: state.theme
      })
    }
  )
);