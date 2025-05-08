import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, BookmarkPlus, Send, Smile, PlusCircle, 
  ArrowUp, ChevronRight, X, Award, MoreHorizontal, ChevronDown,
  User, Bell, Calendar, Zap, Sun, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import maradImg from '../assets/marad.png';

// Hugging Face API configuration
const HF_API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";
const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

// Fallback responses for when API is not available
const fallbackResponses = {
  greeting: "Hello! I'm your AI coach. How can I help you today?",
  error: "I'm having trouble connecting right now. Here are some tips:\n\n1. Start with small, achievable goals\n2. Track your progress daily\n3. Celebrate small wins\n4. Stay consistent\n\nWould you like me to elaborate on any of these points?",
  default: "I understand you're working on building better habits. Remember that consistency is key, and it's okay to have setbacks. What specific area would you like to focus on?"
};

// Check if API key is configured
if (!HF_API_KEY) {
  console.error('Hugging Face API key is not configured. Please add VITE_HUGGINGFACE_API_KEY to your .env file');
}

// Function to clean AI response and remove echoed user input
function cleanAIResponse(userInput, aiOutput) {
  // Remove the first line if it contains the user's input (case-insensitive, ignoring punctuation)
  const normalizedInput = userInput.trim().toLowerCase().replace(/[?.!,]/g, '');
  const lines = aiOutput.split('\n');
  if (lines.length > 1) {
    const firstLine = lines[0].trim().toLowerCase().replace(/[?.!,]/g, '');
    if (firstLine.includes(normalizedInput)) {
      return lines.slice(1).join('\n').trim();
    }
  }
  // Also remove the prompt if it appears at the very start of the response (even if not on a new line)
  const aiOutputNormalized = aiOutput.trim().toLowerCase().replace(/[?.!,]/g, '');
  if (aiOutputNormalized.startsWith(normalizedInput)) {
    return aiOutput.trim().slice(userInput.length).trim();
  }
  return aiOutput.trim();
}

// Main AI Coach Component
export default function AICoach({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [currentMood, setCurrentMood] = useState(null);
  const [remainingMessages, setRemainingMessages] = useState(5); // For free tier users
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  const [showHabitTools, setShowHabitTools] = useState(false);
  const [showSavedTips, setShowSavedTips] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [canContinue, setCanContinue] = useState(false);
  
  // Mock data - saved tips
  const savedTips = [
    { id: 1, text: "Remember to take small steps when building new habits", tag: "Routine", saved: true },
    { id: 2, text: "When feeling stuck, try the 2-minute rule - commit to just 2 minutes of your habit", tag: "Focus", saved: true },
    { id: 3, text: "Habit stacking works by connecting new habits to existing routines", tag: "Routine", saved: true },
  ];

  // Mock suggestions based on user context
  const suggestions = [
    "Suggest a morning routine",
    "I broke my streak. What now?",
    "I feel demotivated today",
    "How can I build consistency?",
    "Tips for breaking bad habits"
  ];

  // Mock habit tool options
  const habitTools = [
    { title: "Build a New Habit", icon: "➕", description: "Create a sustainable new habit with personalized guidance" },
    { title: "Break a Bad Habit", icon: "❌", description: "Replace unwanted behaviors with healthy alternatives" },
    { title: "Streak Saver Mode", icon: "🔥", description: "Get motivation when you're about to break a streak" },
    { title: "Smart Suggestions", icon: "💡", description: "Get AI-powered habit recommendations" }
  ];

  // Mood options
  const moodOptions = [
    { emoji: "😊", label: "Happy" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "😔", label: "Sad" },
    { emoji: "😤", label: "Frustrated" },
    { emoji: "😴", label: "Tired" }
  ];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to get AI response from Hugging Face
  const getAIResponse = async (text) => {
    try {
      // First, check if the API key is configured
      if (!HF_API_KEY) {
        console.warn('Using fallback response: API key not configured');
        return fallbackResponses.default;
      }

      const systemPrompt = "You are Coach Nova, a helpful and friendly habit and wellness assistant. Answer user questions clearly and conversationally. Do not repeat the user's question. If you don't know, say so politely.\n";
      const history = messages
        .filter(m => m.sender === 'user' || m.sender === 'ai')
        .map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n');
      const prompt = systemPrompt + history + `\nUser: ${text}\nAssistant:`;

      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            max_new_tokens: 350,
            temperature: 0.7,
            top_p: 0.95,
            repetition_penalty: 1.1
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Details:', errorData);
        
        if (response.status === 404) {
          console.warn('Using fallback response: Model not found');
          return fallbackResponses.default;
        } else if (response.status === 401) {
          console.warn('Using fallback response: Invalid API key');
          return fallbackResponses.error;
        } else if (response.status === 503) {
          console.warn('Using fallback response: Model is loading');
          return "The AI model is still loading. In the meantime, here's a tip: Start with the smallest possible version of your habit. For example, if you want to meditate, start with just 1 minute a day.";
        } else {
          console.warn('Using fallback response: API request failed');
          return fallbackResponses.error;
        }
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      // Handle different response formats
      let rawResponse = '';
      if (Array.isArray(data) && data.length > 0) {
        rawResponse = data[0].generated_text || fallbackResponses.default;
      } else if (data.generated_text) {
        rawResponse = data.generated_text;
      } else {
        console.error('Unexpected API response format:', data);
        return fallbackResponses.default;
      }

      // Extract only the latest assistant reply after the last 'Assistant:'
      const lastAssistantIdx = rawResponse.lastIndexOf('Assistant:');
      let reply = rawResponse;
      if (lastAssistantIdx !== -1) {
        reply = rawResponse.substring(lastAssistantIdx + 'Assistant:'.length).trim();
      }
      // Remove any trailing 'User:' or 'Assistant:' prompts
      reply = reply.replace(/^(User:|Assistant:)/, '').trim();

      // Only fallback if the reply is very short or looks like a search query list
      if (
        reply.length < 30 ||
        /^[,\\s]*how to/i.test(reply) || // starts with "how to"
        /^[,\\s]*$/.test(reply) || // empty or just commas/spaces
        (reply.split(',').length > 4 && reply.length < 200) || // looks like a list of queries
        reply.toLowerCase().includes('my name is olivia') // or any other junk pattern
      ) {
        return "Sorry, the AI is currently overloaded or unavailable. Please try again in a few minutes, or ask a different question.";
      }

      return reply || fallbackResponses.default;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return fallbackResponses.error;
    }
  };

  // Handle sending a message
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    // Add user message
    const newMessage = {
      id: messages.length + 1,
      text: text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
    setIsTyping(true);
    
    try {
      // Get AI response
      const aiResponse = await getAIResponse(text);
      const cleanedResponse = cleanAIResponse(text, aiResponse);
      
      // Add AI response message
      const aiMessage = {
        id: messages.length + 2,
        text: cleanedResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update remaining messages for free users
      if (remainingMessages > 0) {
        setRemainingMessages(prev => prev - 1);
      }
      
      // Occasionally show mood check (20% chance)
      if (Math.random() < 0.2 && !showMoodCheck) {
        setTimeout(() => {
          setShowMoodCheck(true);
        }, 1000);
      }

      const endsWithPunct = /[.!?]$/.test(cleanedResponse.trim());
      setCanContinue(!endsWithPunct && cleanedResponse.length > 100); // adjust length as needed
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        text: "I'm sorry, I encountered an error. Please try again.",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle quick suggestion clicks
  const handleSuggestionClick = async (suggestion) => {
    setShowSuggestions(false);
    setIsTyping(true);
    const newMessage = {
      id: messages.length + 1,
      text: suggestion,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
    const aiResponse = await getAIResponse(suggestion);
    const cleanedResponse = cleanAIResponse(suggestion, aiResponse);
    const aiMessage = {
      id: messages.length + 2,
      text: cleanedResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
    setShowSuggestions(true);
  };

  // Handle mood selection
  const handleMoodSelection = (mood) => {
    setCurrentMood(mood);
    setShowMoodCheck(false);
    
    // Add mood as a system message
    const moodMessage = {
      id: messages.length + 1,
      text: `You're feeling ${mood.label} ${mood.emoji}`,
      sender: 'system',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, moodMessage]);
    
    // Simulate AI responding to mood
    setTimeout(() => {
      setIsTyping(true);
      
      setTimeout(() => {
        const moodResponse = {
          id: messages.length + 2,
          text: getMoodResponse(mood),
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, moodResponse]);
        setIsTyping(false);
      }, 1500);
    }, 500);
  };

  // Generate response based on mood
  const getMoodResponse = (mood) => {
    switch(mood.label) {
      case 'Happy':
        return "That's great to hear you're feeling happy! This positive energy is perfect for tackling your habits. Would you like to channel this energy into starting something new or building on your existing routines?";
      case 'Neutral':
        return "Thanks for sharing. A neutral mood can be a good baseline for consistent habit work. Would you like me to suggest a simple win that might boost your mood while making progress on your goals?";
      case 'Sad':
        return "I'm sorry you're feeling sad today. Remember that it's okay to have off days. Would a gentle self-care habit help? Or would you prefer some simple activities that might help lift your mood?";
      case 'Frustrated':
        return "I understand frustration can be challenging. Is there a specific habit or goal that's causing this feeling? Sometimes breaking things down into smaller steps can help reduce that frustration.";
      case 'Tired':
        return "I hear you're feeling tired. Rest is an important part of any habit system. Would you like suggestions for low-energy habits you can do today, or would you prefer tips for improving your energy levels?";
      default:
        return "Thank you for sharing how you're feeling. How can I help support your habit goals today?";
    }
  };

  // Handle selecting a habit tool
  const handleSelectHabitTool = (tool) => {
    setShowHabitTools(false);
    
    // Add system message about tool selection
    const toolMessage = {
      id: messages.length + 1,
      text: `You've selected: ${tool.title}`,
      sender: 'system',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, toolMessage]);
    
    // Simulate AI starting the habit flow
    setTimeout(() => {
      setIsTyping(true);
      
      setTimeout(() => {
        const habitToolResponse = {
          id: messages.length + 2,
          text: getHabitToolResponse(tool),
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, habitToolResponse]);
        setIsTyping(false);
      }, 1500);
    }, 500);
  };

  // Generate response based on selected habit tool
  const getHabitToolResponse = (tool) => {
    switch(tool.title) {
      case 'Build a New Habit':
        return "Let's create a new habit together! To get started:\n\n1. What specific habit would you like to build?\n2. When during the day would be ideal to perform this habit?\n3. How often would you like to do it (daily, specific days, etc.)?\n\nOnce you share these details, I can help you create a sustainable plan!";
      case 'Break a Bad Habit':
        return "Breaking habits effectively is about understanding and replacing them. Let's work through this:\n\n1. What specific habit would you like to break?\n2. When does this habit typically occur? (time of day, triggers, emotions)\n3. What healthier alternative could replace this habit?\n\nWith these insights, we can develop an effective strategy!";
      case 'Streak Saver Mode':
        return "Streak Saver activated! Which habit streak are you concerned about maintaining? I'll help you find a way to keep it going even on challenging days with minimum viable effort.";
      case 'Smart Suggestions':
        return "I'd be happy to recommend personalized habits based on your goals and current routines! To give you the most relevant suggestions:\n\n1. What are your main wellness or productivity goals right now?\n2. What existing habits are you most consistent with?\n3. How much time can you realistically commit each day?\n\nThis will help me suggest habits that complement your lifestyle!";
      default:
        return "Let's get started with improving your habits! What specifically would you like help with today?";
    }
  };

  // Save/bookmark a message
  const handleSaveMessage = (messageId) => {
    setMessages(messages =>
      messages.map(msg =>
        msg.id === messageId ? { ...msg, saved: !msg.saved } : msg
      )
    );
  };

  useEffect(() => {
    // Try to get the user's name from localStorage first
    const storedName = localStorage.getItem('habitharmony_user_name');
    if (storedName) {
      setUserName(storedName);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages([
        { id: 1, text: `Hi ${storedName}! 👋 I'm Coach Nova, your personal habit assistant. How can I help you today?`, sender: 'ai', time: now }
      ]);
    } else {
      // Fallback: Try to fetch from API if not in localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        fetch('https://habitharmony.onrender.com/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            const firstName = (data.name || '').split(' ')[0];
            setUserName(firstName);
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setMessages([
              { id: 1, text: `Hi ${firstName}! 👋 I'm Coach Nova, your personal habit assistant. How can I help you today?`, sender: 'ai', time: now }
            ]);
          })
          .catch(err => {
            setUserName('');
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setMessages([
              { id: 1, text: `Hi there! 👋 I'm Coach Nova, your personal habit assistant. How can I help you today?`, sender: 'ai', time: now }
            ]);
          });
      } else {
        setUserName('');
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages([
          { id: 1, text: `Hi there! 👋 I'm Coach Nova, your personal habit assistant. How can I help you today?`, sender: 'ai', time: now }
        ]);
      }
    }
  }, []);

  const habitHistory = {
    '2024-05-01': { completed: 3, total: 3 },
    '2024-05-02': { completed: 2, total: 3 },
    // ...
  };

  function openDayDetails(dateStr) {
    setSelectedDay(dateStr);
    // Show modal or sidebar with details
  }

  return (
    <div className="min-h-screen font-display bg-[#F8F3F3] pb-24 relative flex flex-col">
      {/* Header - Sticky */}
      <div className="sticky top-0 bg-[#F8F3F3] z-10 pt-6 pb-3 px-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/homescreen')}
              className="mr-2"
            >
              <ArrowLeft size={20} className="text-[#F75836]" />
            </motion.button>
            <MessageSquare size={20} className="text-[#F75836]" />
            <h1 className="font-bold text-lg">AI Coach</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white px-2 py-1 rounded-full border border-gray-200 shadow-sm">
              <span className="text-sm font-medium flex items-center">
                <MessageSquare size={14} className="text-[#F75836] mr-1" />
                {remainingMessages} left
              </span>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative size-10 rounded-full cursor-pointer border-2 border-[#F75836] overflow-hidden"
            >
              <img src={maradImg} alt="Profile" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* AI Usage Summary (Free Tier) */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-3 bg-blue-50 rounded-xl p-3 border border-blue-100"
      >
        <div className="flex items-start">
          <div className="text-blue-500 mr-3 text-xl mt-1">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="font-medium text-blue-700">Free Plan: {remainingMessages}/5 coaching sessions left</h3>
            <p className="text-sm text-blue-600 mt-1">Get unlimited coaching with Premium!</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-auto bg-[#F75836] text-white text-sm py-1 px-3 rounded-full"
          >
            Upgrade
          </motion.button>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 px-4 pt-3 pb-20 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : message.sender === 'system' ? 'justify-center' : 'justify-start'}`}
            >
              {message.sender === 'system' ? (
                <div className="bg-gray-100 rounded-lg py-2 px-4 max-w-xs sm:max-w-md text-sm text-center text-gray-500">
                  {message.text}
                </div>
              ) : (
                <div className={`relative max-w-xs sm:max-w-md ${message.sender === 'user' ? 'order-2' : ''}`}>
                  {message.sender === 'ai' && (
                    <div className="absolute -left-10 top-1 size-8 bg-[#F75836] rounded-full flex items-center justify-center text-white text-xs font-bold">
                      CN
                    </div>
                  )}
                  
                  <div className={`rounded-2xl p-3 ${
                    message.sender === 'user' 
                      ? 'bg-[#F75836] text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-line">{message.text}</p>
                    <div className={`flex justify-between items-center mt-1 text-xs ${
                      message.sender === 'user' ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      <span>{message.time}</span>
                      
                      {message.sender === 'ai' && (
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSaveMessage(message.id)}
                          className={message.saved ? 'text-[#F75836]' : ''}
                        >
                          <BookmarkPlus size={16} />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          
          {/* AI Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="relative max-w-xs sm:max-w-md">
                <div className="absolute -left-10 top-1 size-8 bg-[#F75836] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  CN
                </div>
                <div className="rounded-2xl p-4 bg-white border border-gray-200 rounded-tl-none">
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                      className="bg-gray-300 h-2 w-2 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      className="bg-gray-300 h-2 w-2 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      className="bg-gray-300 h-2 w-2 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Mood Check Prompt */}
          <AnimatePresence>
            {showMoodCheck && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex justify-center"
              >
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm max-w-xs sm:max-w-md">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-700">How are you feeling today?</h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowMoodCheck(false)}
                      className="text-gray-400"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>
                  
                  <div className="flex justify-between">
                    {moodOptions.map((mood) => (
                      <motion.button
                        key={mood.label}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleMoodSelection(mood)}
                        className="flex flex-col items-center"
                      >
                        <span className="text-2xl mb-1">{mood.emoji}</span>
                        <span className="text-xs text-gray-600">{mood.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {canContinue && (
            <div className="flex justify-center my-2">
              <button
                className="bg-[#F75836] text-white px-4 py-2 rounded-full shadow"
                onClick={() => handleSendMessage('continue')}
              >
                Continue
              </button>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Quick Suggestions */}
      {showSuggestions && (
        <div className="mb-2 px-4 py-2">
          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex-shrink-0 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm whitespace-nowrap shadow-sm"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input Area - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F8F3F3] border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message Coach Nova..."
              className="w-full border border-gray-300 rounded-2xl py-3 px-4 pr-10 text-sm focus:outline-none focus:border-[#F75836] resize-none"
              style={{ maxHeight: '120px', minHeight: '48px' }}
              rows={inputText.split('\n').length > 3 ? 3 : inputText.split('\n').length}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }
              }}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim()}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                inputText.trim() ? 'text-[#F75836]' : 'text-gray-400'
              }`}
            >
              <Send size={20} />
            </motion.button>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMoodCheck(true)}
              className="bg-white size-10 rounded-full flex items-center justify-center border border-gray-300 shadow-sm"
            >
              <Smile size={20} className="text-gray-600" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowHabitTools(!showHabitTools)}
              className="bg-[#F75836] size-10 rounded-full flex items-center justify-center shadow-sm"
            >
              <PlusCircle size={20} className="text-white" />
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Habit Assistant Tools Panel */}
      <AnimatePresence>
        {showHabitTools && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-30"
              onClick={() => setShowHabitTools(false)}
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 z-40 max-h-[70vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Habit Assistant Tools</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowHabitTools(false)}
                >
                  <X size={20} />
                </motion.button>
              </div>
              
              <div className="space-y-3">
                {habitTools.map((tool, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectHabitTool(tool)}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tool.icon}</span>
                      <div>
                        <h3 className="font-bold">{tool.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                      </div>
                      <ChevronRight size={18} className="ml-auto text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Saved Tips Panel */}
      <AnimatePresence>
        {showSavedTips && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-30"
              onClick={() => setShowSavedTips(false)}
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 z-40 max-h-[70vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">My Saved Tips</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSavedTips(false)}
                >
                  <X size={20} />
                </motion.button>
              </div>
              
              {messages.filter(msg => msg.saved).length > 0 ? (
                <div className="space-y-3">
                  {messages.filter(msg => msg.saved).map((msg) => (
                    <motion.div
                      key={msg.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                    >
                      <p className="text-sm">{msg.text}</p>
                      <div className="flex justify-end items-center mt-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-[#F75836]"
                          onClick={() => handleSaveMessage(msg.id)}
                        >
                          <BookmarkPlus size={16} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <BookmarkPlus size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No saved tips yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Tap the bookmark icon on any coach message to save it
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Floating Action Button for Saved Tips */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowSavedTips(true)}
        className="fixed bottom-36 right-4 z-20 bg-white size-12 rounded-full flex items-center justify-center shadow-lg border border-gray-200"
      >
        <BookmarkPlus size={22} className="text-[#F75836]" />
      </motion.button>
    </div>
  );
}