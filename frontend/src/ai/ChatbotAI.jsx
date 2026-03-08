import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ChatbotAI = ({ currentMood, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { user } = useStore();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchSuggestions = async (mood) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.post(`${API_URL}/learning/chat/suggestions`, 
        { mood },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessageText = inputMessage;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      // Send to backend
      const response = await axios.post(`${API_URL}/learning/chat/`, {
        message: userMessageText,
        mood: currentMood,
        conversationHistory: conversationHistory.slice(-10) // Last 5 exchanges
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { response: botResponse, suggestions: newSuggestions } = response.data;

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);

      if (newSuggestions) {
        setSuggestions(newSuggestions.map(s => ({ text: s, icon: '💡' })));
      }

      setIsTyping(false);
      
    } catch (error) {
      console.error('Chat error:', error);
      
      // Friendly error message
      const errorMessage = "I'm having a little trouble connecting right now. Please try again in a moment!";
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion.text || suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      fearful: '😨',
      surprised: '😲',
      neutral: '😐',
      calm: '😌',
      disgusted: '😒'
    };
    return emojis[mood] || '😐';
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] glass rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-700 z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gradient-to-r from-primary-600/20 to-purple-600/20">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0"></div>
          </div>
          <h3 className="font-semibold text-white">Cogni - AI Learning Assistant</h3>
          {currentMood && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-700 capitalize flex items-center">
              <span className="mr-1">{getMoodEmoji(currentMood.emotion)}</span>
              {currentMood.emotion}
            </span>
          )}
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <div className="text-6xl mb-4 animate-bounce">👋</div>
            <p className="text-lg font-semibold text-white mb-2">Hey {user?.name || 'there'}!</p>
            <p className="text-sm mb-4">I'm Cogni, your personal AI learning assistant</p>
            <p className="text-xs text-gray-500">Ask me anything about programming, get project ideas, or just chat!</p>
            <div className="mt-6 flex justify-center space-x-2">
              <span className="px-2 py-1 bg-primary-600/20 rounded-full text-xs">JavaScript</span>
              <span className="px-2 py-1 bg-primary-600/20 rounded-full text-xs">Python</span>
              <span className="px-2 py-1 bg-primary-600/20 rounded-full text-xs">React</span>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  message.sender === 'user'
                    ? 'bg-primary-600 text-white rounded-br-none'
                    : 'bg-gray-800 text-gray-200 rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-bl-none p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about learning..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows="1"
            style={{ maxHeight: '100px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="p-2 bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {/* Quick suggestions */}
        {suggestions.length > 0 && messages.length < 6 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-gray-800 hover:bg-gray-700 rounded-full px-3 py-1.5 transition-colors text-gray-300 flex items-center"
              >
                <span className="mr-1">{suggestion.icon || '💡'}</span>
                {suggestion.text || suggestion}
              </button>
            ))}
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
            🤖 Cogni • Adapts to your emotional state • Ask me anything!
        </p>
      </div>
    </div>
  );
};

export default ChatbotAI;