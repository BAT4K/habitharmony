import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, BookmarkPlus, Send, Smile, PlusCircle, 
  ArrowUp, ChevronRight, X, Award, MoreHorizontal, ChevronDown,
  User, Bell, Calendar, Zap, Sun, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import maradImg from '../assets/marad.png';

// API configuration
const OLLAMA_API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/chat` : "https://habitharmony.onrender.com/api/chat";

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 60, // Gemini's free tier limit per minute
  timeWindow: 60000, // 1 minute in milliseconds
  requests: []
};

// Fallback responses for when API is not available
const fallbackResponses = {
  greeting: "Hello! I'm your AI coach. How can I help you today?",
  error: "I'm having trouble connecting right now. Here are some tips:\n\n" +
         "1. Start with small, achievable goals\n" +
         "2. Track your progress daily\n" +
         "3. Celebrate small wins\n" +
         "4. Stay consistent\n\n" +
         "You can also try:\n" +
         "- Using the habit tracking tools in the app\n" +
         "- Setting up reminders for your habits\n" +
         "- Breaking down your goals into smaller steps\n\n" +
         "Would you like me to elaborate on any of these points?",
  default: "I understand you're working on building better habits. Here are some key principles to remember:\n\n" +
           "1. Start small and build up gradually\n" +
           "2. Focus on consistency over perfection\n" +
           "3. Track your progress to stay motivated\n" +
           "4. Celebrate your wins, no matter how small\n\n" +
           "What specific area would you like to focus on today?"
};

// Add these functions after the fallbackResponses object
const getDayBasedGreeting = () => {
  const day = new Date().getDay();
  const dayGreetings = {
    0: "Happy Sunday", // Sunday
    1: "Happy Monday",
    2: "Happy Tuesday",
    3: "Happy Wednesday",
    4: "Happy Thursday",
    5: "Happy Friday",
    6: "Happy Saturday"
  };
  return dayGreetings[day];
};

const getSeason = () => {
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();
  // Northern Hemisphere (adjust for your region if needed)
  if ((month === 12 && day >= 21) || (month <= 2) || (month === 3 && day < 20)) return "winter";
  if ((month === 3 && day >= 20) || (month <= 5) || (month === 6 && day < 21)) return "spring";
  if ((month === 6 && day >= 21) || (month <= 8) || (month === 9 && day < 22)) return "summer";
  if ((month === 9 && day >= 22) || (month <= 11) || (month === 12 && day < 21)) return "fall";
  return "";
};

const getUserPreferredHabit = () => {
  // Try to get a preferred habit from localStorage or fallback to null
  try {
    const habit = localStorage.getItem('habitharmony_preferred_habit');
    return habit ? habit : null;
  } catch {
    return null;
  }
};

const getSpecialOccasion = () => {
  const today = new Date();
  const month = today.getMonth();
  const date = today.getDate();
  // Expanded special occasions
  const occasions = {
    "1-1": "Happy New Year",
    "2-14": "Happy Valentine's Day",
    "3-8": "Happy International Women's Day",
    "4-22": "Happy Earth Day",
    "5-1": "Happy Labor Day",
    "6-21": "Happy Summer Solstice",
    "10-31": "Happy Halloween",
    "11-23": "Happy Thanksgiving", // US Thanksgiving (4th Thursday of November, approx)
    "12-25": "Merry Christmas",
    "12-31": "Happy New Year's Eve",
    "2-10": "Happy Chinese New Year", // 2024 date, update as needed
    "4-10": "Happy Eid al-Fitr", // 2024 date, update as needed
    "10-31": "Happy Diwali", // 2024 date, update as needed
    "12-7": "Happy Hanukkah", // 2024 date, update as needed
  };
  const occasionKey = `${month + 1}-${date}`;
  return occasions[occasionKey] || null;
};

const getPersonalizedGreeting = (name) => {
  const hour = new Date().getHours();
  const specialOccasion = getSpecialOccasion();
  const dayGreeting = getDayBasedGreeting();
  const season = getSeason();
  const preferredHabit = getUserPreferredHabit();
  let timeBasedGreeting;
  if (hour >= 5 && hour < 12) {
    timeBasedGreeting = "Good morning";
  } else if (hour >= 12 && hour < 17) {
    timeBasedGreeting = "Good afternoon";
  } else if (hour >= 17 && hour < 22) {
    timeBasedGreeting = "Good evening";
  } else {
    timeBasedGreeting = "Hello";
  }

  // Seasonal greetings
  const seasonalGreetings = {
    winter: [
      `Stay cozy this winter${name ? ", " + name : ''}! ❄️ I'm Coach Nova, here to help you build warm habits.`,
      `Winter wellness check-in${name ? ", " + name : ''}! ⛄ How can I help you stay motivated?`,
      `It's chilly outside! Let's warm up your habit streak,${name ? ' ' + name : ''}! 🔥`
    ],
    spring: [
      `Happy spring${name ? ", " + name : ''}! 🌸 I'm Coach Nova, ready to help you grow new habits.`,
      `Spring into action${name ? ", " + name : ''}! 🌱 What would you like to work on today?`,
      `Fresh starts for spring! Let's plant some good habits,${name ? ' ' + name : ''}! 🌷`
    ],
    summer: [
      `Happy summer${name ? ", " + name : ''}! ☀️ I'm Coach Nova, here to help you shine.`,
      `Summer vibes${name ? ", " + name : ''}! 😎 Ready to build some sunny new habits?`,
      `Let's make this summer productive,${name ? ' ' + name : ''}! 🏖️`
    ],
    fall: [
      `Happy fall${name ? ", " + name : ''}! 🍂 I'm Coach Nova, here to help you harvest good habits.`,
      `Autumn check-in${name ? ", " + name : ''}! 🎃 What would you like to focus on?`,
      `Let's turn over a new leaf this fall,${name ? ' ' + name : ''}! 🍁`
    ]
  };

  // More greeting variations for each time
  const morningGreetings = [
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 🌅 I'm Coach Nova, ready to help you start your day right. What habits would you like to focus on today?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! ☀️ I'm Coach Nova, excited to help you build momentum for your day. How can I assist you?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 🌞 I'm Coach Nova, here to help you make the most of your morning. What's on your mind?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 🥣 Did you have breakfast? Let's fuel your day with good habits!`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 🧘‍♂️ How about a quick meditation to start your day?`,
    preferredHabit ? `${timeBasedGreeting}${name ? ` ${name}` : ''}! Let's make time for your favorite habit: ${preferredHabit}.` : null
  ].filter(Boolean);

  const afternoonGreetings = [
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 🌤️ I'm Coach Nova, here to help you maintain your momentum. How can I support you?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! ⭐ I'm Coach Nova, ready to help you stay on track. What would you like to work on?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 💫 I'm Coach Nova, here to help you make the most of your day. How can I assist you?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 🍵 Time for a quick break? Let's check in on your habits.`,
    preferredHabit ? `${timeBasedGreeting}${name ? ` ${name}` : ''}! How's your progress with ${preferredHabit}?` : null
  ].filter(Boolean);

  const eveningGreetings = [
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 🌙 I'm Coach Nova, here to help you wind down and reflect. How was your day?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 🌠 I'm Coach Nova, ready to help you plan for tomorrow. What's on your mind?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 🌛 I'm Coach Nova, here to help you end your day on a positive note. How can I assist you?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 📖 How about a little journaling before bed?`,
    preferredHabit ? `${timeBasedGreeting}${name ? ` ${name}` : ''}! Don't forget your ${preferredHabit} before the day ends.` : null
  ].filter(Boolean);

  const nightGreetings = [
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 🌌 I'm Coach Nova, here to help you prepare for tomorrow. What would you like to focus on?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 🌑 I'm Coach Nova, ready to help you plan for a better tomorrow. How can I assist you?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 🌘 I'm Coach Nova, here to help you set up for success. What's on your mind?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 😴 Time to wind down. Any last habits for today?`,
    preferredHabit ? `${timeBasedGreeting}${name ? ` ${name}` : ''}! A little ${preferredHabit} before bed can be a great way to end the day.` : null
  ].filter(Boolean);

  // General greetings (fallback)
  const generalGreetings = [
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 👋 I'm Coach Nova, your personal habit assistant. How can I help you today?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 🌟 I'm Coach Nova, ready to help you build better habits. What would you like to work on?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 💪 I'm Coach Nova, here to support your wellness journey. How can I assist you today?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! ✨ I'm Coach Nova, your habit-building companion. What's on your mind?`,
    `${timeBasedGreeting}${name ? ` ${name}` : ''}! 🌱 I'm Coach Nova, excited to help you grow your habits. How can I support you today?`
  ];

  // Select appropriate greeting array based on time
  let greetingArray;
  if (hour >= 5 && hour < 12) {
    greetingArray = morningGreetings;
  } else if (hour >= 12 && hour < 17) {
    greetingArray = afternoonGreetings;
  } else if (hour >= 17 && hour < 22) {
    greetingArray = eveningGreetings;
  } else {
    greetingArray = nightGreetings;
  }

  // Special occasion greeting
  if (specialOccasion) {
    return `${specialOccasion}${name ? ` ${name}` : ''}! 🎉 I'm Coach Nova, here to help you celebrate and maintain your habits. How can I assist you today?`;
  }

  // Weekend greeting
  if (new Date().getDay() === 0 || new Date().getDay() === 6) {
    return `${dayGreeting}${name ? ` ${name}` : ''}! 🌈 I'm Coach Nova, here to help you make the most of your weekend. What would you like to focus on?`;
  }

  // Seasonal greeting
  if (season && seasonalGreetings[season]) {
    return seasonalGreetings[season][Math.floor(Math.random() * seasonalGreetings[season].length)];
  }

  // Return random greeting from appropriate array
  return greetingArray[Math.floor(Math.random() * greetingArray.length)];
};

const getAdvancedPersonalizedGreeting = (name) => {
  const hour = new Date().getHours();
  const specialOccasion = getSpecialOccasion();
  const dayGreeting = getDayBasedGreeting();
  const season = getSeason();
  const preferredHabit = getUserPreferredHabit();

  // Advanced personalization from localStorage
  let lastCompletedHabit = null;
  let streakCount = null;
  let lastMood = null;
  let lastVisit = null;
  try {
    lastCompletedHabit = localStorage.getItem('habitharmony_last_completed_habit');
    streakCount = parseInt(localStorage.getItem('habitharmony_streak_count'), 10);
    lastMood = localStorage.getItem('habitharmony_last_mood');
    lastVisit = localStorage.getItem('habitharmony_last_visit');
  } catch {}

  // Calculate time since last visit (in days)
  let daysSinceLastVisit = null;
  if (lastVisit) {
    const last = new Date(parseInt(lastVisit, 10));
    const now = new Date();
    daysSinceLastVisit = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  }

  // 1. Welcome back if it's been a while
  if (daysSinceLastVisit !== null && daysSinceLastVisit > 2) {
    return `Welcome back${name ? ', ' + name : ''}! 👋 It's been ${daysSinceLastVisit} days. Ready to get back on track?`;
  }

  // 2. Celebrate streaks
  if (streakCount && streakCount > 1) {
    return `Amazing job${name ? ', ' + name : ''}! 🌟 You're on a ${streakCount}-day streak${preferredHabit ? ' with ' + preferredHabit : ''}! Keep it going!`;
  }

  // 3. Reference last completed habit
  if (lastCompletedHabit) {
    return `Congrats on completing ${lastCompletedHabit}${name ? ', ' + name : ''}! 🎉 Want to keep the momentum going today?`;
  }

  // 4. Mood-aware greeting
  if (lastMood) {
    if (lastMood === 'Tired') {
      return `I noticed you felt a bit tired recently${name ? ', ' + name : ''}. 😴 Want to try a gentle habit today?`;
    } else if (lastMood === 'Happy') {
      return `You were feeling happy last time${name ? ', ' + name : ''}! 😊 Let's channel that energy into your habits!`;
    } else if (lastMood === 'Sad') {
      return `I saw you were feeling down last time${name ? ', ' + name : ''}. 💙 Want to try something uplifting today?`;
    } else if (lastMood === 'Frustrated') {
      return `Last time you felt frustrated${name ? ', ' + name : ''}. 😤 Let's break things down and make progress together!`;
    } else if (lastMood === 'Neutral') {
      return `Welcome back${name ? ', ' + name : ''}! Let's make today a good one!`;
    }
  }

  // Fallback to previous personalized greeting system
  return getPersonalizedGreeting(name);
};

// Check if API key is configured
if (!OLLAMA_API_URL) {
  console.error('Ollama API URL is not configured. Please add OLLAMA_API_URL to your .env file');
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

// Add blinking cursor CSS
if (typeof document !== 'undefined' && !document.getElementById('blinking-cursor-style')) {
  const style = document.createElement('style');
  style.id = 'blinking-cursor-style';
  style.innerHTML = `
    .blinking-cursor {
      display: inline-block;
      width: 1ch;
      animation: blink 1s steps(1) infinite;
      color: #F75836;
      font-weight: bold;
    }
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
    .ai-streaming-message {
      font-family: inherit;
      font-size: 1rem;
      background: #fffbe8;
      border-radius: 1rem;
      padding: 1rem;
      margin: 1rem 0;
      border: 1px solid #ffe0b2;
      min-height: 2.5rem;
      white-space: pre-line;
      word-break: break-word;
    }
  `;
  document.head.appendChild(style);
}

// Dynamically load Razorpay script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Add a function to generate personalized suggestions
function getPersonalizedSuggestions({ userName, habitData, currentMood, messages }) {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12
    ? "morning"
    : hour < 18
      ? "afternoon"
      : "evening";

  const streak = parseInt(habitData?.streak || 0, 10);
  const favoriteHabit = habitData?.mostConsistentHabit || null;
  const lastUserMessage = messages.slice().reverse().find(m => m.sender === 'user');
  const lastAImessage = messages.slice().reverse().find(m => m.sender === 'ai');

  // Advanced: streak history (simulate with current streak and best streak)
  const bestStreak = parseInt(habitData?.bestStreak || 0, 10);
  const streakImprovement = streak > 0 && bestStreak > 0 ? streak - bestStreak : 0;

  // Advanced: time since last message
  let timeSinceLastUserMsg = null;
  if (lastUserMessage && lastUserMessage.time) {
    const now = new Date();
    const [h, m] = lastUserMessage.time.split(':');
    const lastMsgDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    timeSinceLastUserMsg = Math.floor((now - lastMsgDate) / 60000); // in minutes
  }

  // Custom suggestion templates
  const templates = [
    streak > 0 && streakImprovement > 0 ? `You're improving your streak! Up by ${streakImprovement} days from your best.` : null,
    bestStreak > 0 ? `Your best streak ever is ${bestStreak} days. Want to beat it?` : null,
    timeSinceLastUserMsg && timeSinceLastUserMsg > 60 ? `It's been a while since your last check-in. Want a fresh start?` : null,
    favoriteHabit ? `Let's make progress on your "${favoriteHabit}" habit today!` : null,
    streak > 0 && streak % 7 === 0 ? `Congrats! You've hit a ${streak}-day milestone! Want to celebrate?` : null,
    hour < 12 ? "What's one thing you want to accomplish this morning?" : null,
    hour >= 12 && hour < 18 ? "How's your day going? Need an afternoon boost?" : null,
    hour >= 18 ? "Ready to reflect on your day or plan for tomorrow?" : null,
    currentMood && currentMood.label === 'Happy' ? "Share your happiness—what's going well?" : null,
    currentMood && currentMood.label === 'Sad' ? "Would a gratitude exercise help today?" : null,
    currentMood && currentMood.label === 'Tired' ? "Try a micro-habit to keep momentum with low energy." : null,
    lastUserMessage && lastUserMessage.text.length > 20 ? "Want to break that down into a smaller step?" : null,
    lastAImessage && lastAImessage.text && lastAImessage.text.length > 40 ? "Summarize my last advice in one sentence." : null,
    "Ask for a science-backed habit tip",
    "Show me a quick win for today",
    "What's a tiny habit I can try now?",
    "Remind me why consistency matters"
  ].filter(Boolean);

  // Mood-based suggestions (keep from previous logic)
  let moodSuggestions = [];
  
  if (currentMood === 'tired') {
    moodSuggestions.push("Want a low-energy habit idea?");
    moodSuggestions.push("Need a quick energy boost tip?");
  } else if (currentMood === 'happy') {
    moodSuggestions.push("Channel your happy mood into a new habit!");
    moodSuggestions.push("Want to celebrate your progress?");
  } else if (currentMood === 'sad') {
    moodSuggestions.push("Would a gentle self-care habit help?");
    moodSuggestions.push("Need a mood-lifting suggestion?");
  } else if (currentMood === 'frustrated') {
    moodSuggestions.push("Want a tip to overcome frustration?");
    moodSuggestions.push("Break down a big goal into small steps?");
  } else {
    moodSuggestions.push("Ready for a simple win today?");
    moodSuggestions.push("Want a random habit tip?");
  }

  // Add custom templates and general suggestions
  moodSuggestions = moodSuggestions.concat(templates);
  
  // Remove duplicates and randomize
  moodSuggestions = Array.from(new Set(moodSuggestions)).sort(() => 0.5 - Math.random()).slice(0, 4);
  return moodSuggestions;
}

// Add this near the top of the file, after imports
const API_URL = 'https://habitharmony.onrender.com';

// Main AI Coach Component
export default function AICoach({ onBack }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(() => {
    const stored = localStorage.getItem('habitharmony_remaining_messages');
    return stored ? parseInt(stored, 10) : 10;
  });
  
  // Initialize suggestions with static values
  const [suggestions, setSuggestions] = useState([
    "How can I improve my habits?",
    "What's my current streak?",
    "Show me my recent progress",
    "Give me some motivation"
  ]);

  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [currentMood, setCurrentMood] = useState(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showHabitTools, setShowHabitTools] = useState(false);
  const [showSavedTips, setShowSavedTips] = useState(false);
  const [showLimitReachedModal, setShowLimitReachedModal] = useState(false);
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [canContinue, setCanContinue] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState('plans');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [premium, setPremium] = useState(() => localStorage.getItem('habitharmony_premium') === 'true');
  const [upgradeError, setUpgradeError] = useState('');
  const [showManageSubscription, setShowManageSubscription] = useState(false);
  
  // Mock data - saved tips
  const savedTips = [
    { id: 1, text: "Remember to take small steps when building new habits", tag: "Routine", saved: true },
    { id: 2, text: "When feeling stuck, try the 2-minute rule - commit to just 2 minutes of your habit", tag: "Focus", saved: true },
    { id: 3, text: "Habit stacking works by connecting new habits to existing routines", tag: "Routine", saved: true },
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

  // Add an effect to persist remainingMessages to localStorage
  useEffect(() => {
    localStorage.setItem('habitharmony_remaining_messages', remainingMessages);
  }, [remainingMessages]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to get AI response from Ollama
  const getAIResponse = async (text) => {
    try {
      const habitData = getUserHabitData();
      const systemPrompt = `
You are Coach Nova, the AI coach for Habit Harmony, a habit tracking and wellness app.
Always refer to the app as Habit Harmony and never mention any other company or app name.
Here is the user's habit data:
- Current streak: ${habitData.streak}
- Best streak: ${habitData.bestStreak}
- Longest streak habit: ${habitData.longestStreakHabit || 'N/A'}
- Points: ${habitData.points}
- Most consistent habit: ${habitData.mostConsistentHabit || 'N/A'}
- Habits: ${habitData.habits.map(h => h.name).join(', ') || 'None'}
- Habits completed this week: ${Object.entries(habitData.completedThisWeek).map(([k,v]) => `${k} (${v})`).join(', ') || 'None'}
- Last completed habit: ${habitData.lastCompletedHabit || 'N/A'}
- Total completions (all time): ${habitData.totalCompletionsAllTime}
- Average completions per week: ${habitData.avgCompletionsPerWeek}
- Missed habits this week: ${Object.keys(habitData.missedThisWeek).join(', ') || 'None'}
- Best month: ${habitData.bestMonth || 'N/A'} (${habitData.bestMonthCount} completions)
- Most improved habit (last 30 days): ${habitData.mostImprovedHabit || 'N/A'} (+${habitData.maxStreakIncrease} streak)
- Recent completions: ${Object.keys(habitData.calendarHistory).slice(-7).join(', ')}

Answer user questions clearly and conversationally, using this data when relevant.
`;

      const response = await fetch(OLLAMA_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "phi3:mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
          ],
          stream: false
        }),
      });

      if (!response.ok) {
        return fallbackResponses.error;
      }

      const data = await response.json();
      // Ollama returns the response in data.message.content
      return data.message?.content?.trim() || fallbackResponses.default;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return fallbackResponses.error;
    }
  };

  // Fix getAIResponseStream to use phi3:mini
  const getAIResponseStream = async (text, onChunk) => {
    const habitData = getUserHabitData();
    const systemPrompt = `
You are Coach Nova, the AI coach for Habit Harmony, a habit tracking and wellness app.
Always refer to the app as Habit Harmony and never mention any other company or app name.
Here is the user's habit data:
- Current streak: ${habitData.streak}
- Best streak: ${habitData.bestStreak}
- Longest streak habit: ${habitData.longestStreakHabit || 'N/A'}
- Points: ${habitData.points}
- Most consistent habit: ${habitData.mostConsistentHabit || 'N/A'}
- Habits: ${habitData.habits.map(h => h.name).join(', ') || 'None'}
- Habits completed this week: ${Object.entries(habitData.completedThisWeek).map(([k,v]) => `${k} (${v})`).join(', ') || 'None'}
- Last completed habit: ${habitData.lastCompletedHabit || 'N/A'}
- Total completions (all time): ${habitData.totalCompletionsAllTime}
- Average completions per week: ${habitData.avgCompletionsPerWeek}
- Missed habits this week: ${Object.keys(habitData.missedThisWeek).join(', ') || 'None'}
- Best month: ${habitData.bestMonth || 'N/A'} (${habitData.bestMonthCount} completions)
- Most improved habit (last 30 days): ${habitData.mostImprovedHabit || 'N/A'} (+${habitData.maxStreakIncrease} streak)
- Recent completions: ${Object.keys(habitData.calendarHistory).slice(-7).join(', ')}

Answer user questions clearly and conversationally, using this data when relevant.
`;

    const response = await fetch(OLLAMA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "phi3:mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
            ],
            stream: true
        }),
    });

    if (!response.body) throw new Error("No response body");

    // Use TextDecoderStream for modern browsers
    const stream = response.body
        .pipeThrough(new TextDecoderStream());
    const reader = stream.getReader();

    let fullText = "";
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        // Split by newlines and process each line
        const lines = value.split('\n');
        for (const line of lines) {
            if (line.trim()) {
                try {
                    const data = JSON.parse(line);
                    const token = data.message?.content || "";
                    if (token) {
                        fullText += token;
                        onChunk(fullText);
                    }
                } catch (e) {
                    // If it's not JSON, it might be a direct token
                    if (line.trim()) {
                        fullText += line.trim();
                        onChunk(fullText);
                    }
                }
            }
        }
    }
    return fullText;
};

  // Update the updateSuggestions function
  const updateSuggestions = useCallback(() => {
    // Only update if we have at least one message
    if (messages.length > 0) {
      const newSuggestions = getPersonalizedSuggestions({ 
        userName, 
        habitData: getUserHabitData(), 
        currentMood, 
        messages 
      });
      setSuggestions(prev => {
        // Only update if there are significant changes
        if (JSON.stringify(prev) !== JSON.stringify(newSuggestions)) {
          return newSuggestions;
        }
        return prev;
      });
    }
  }, [userName, currentMood, messages]);

  // Remove the automatic suggestions update on component mount
  useEffect(() => {
    // Only update suggestions when messages change
    if (messages.length > 0) {
      const timeoutId = setTimeout(updateSuggestions, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, updateSuggestions]);

  // Update handleSendMessage to use the API_URL
  const handleSendMessage = async (input) => {
    // Handle both event and direct text input
    const messageText = typeof input === 'string' ? input : input.target?.value || '';
    if (!messageText.trim() || isLoading || remainingMessages <= 0) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.response) {
              assistantMessage += data.response;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  lastMessage.content = assistantMessage;
                } else {
                  newMessages.push({ role: 'assistant', content: assistantMessage });
                }
                return newMessages;
              });
            }
          }
        }
      }

      // Update remaining messages count
      const newRemaining = remainingMessages - 1;
      setRemainingMessages(newRemaining);
      localStorage.setItem('habitharmony_remaining_messages', newRemaining.toString());

      // Update suggestions after successful message with a delay
      setTimeout(updateSuggestions, 1000);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the onKeyDown handler in the textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  // Handle quick suggestion clicks
  const handleSuggestionClick = async (suggestion) => {
    setInput(suggestion);
    await handleSendMessage(suggestion);
    // Don't update suggestions here - it will be handled by the useEffect
  };

  // Handle mood selection
  const handleMoodSelection = (mood) => {
    setCurrentMood(mood);
    setShowMoodSelector(false);
    
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
    // Update last visit timestamp
    localStorage.setItem('habitharmony_last_visit', Date.now().toString());
    
    if (storedName) {
      setUserName(storedName);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages([
        { id: 1, text: getAdvancedPersonalizedGreeting(storedName), sender: 'ai', time: now }
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
          .then(res => {
            if (!res.ok) {
              throw new Error('Failed to fetch user data');
            }
            return res.json();
          })
          .then(data => {
            const firstName = (data.name || '').split(' ')[0];
            setUserName(firstName);
            localStorage.setItem('habitharmony_user_name', firstName);
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setMessages([
              { id: 1, text: getAdvancedPersonalizedGreeting(firstName), sender: 'ai', time: now }
            ]);
          })
          .catch(err => {
            console.warn('Error fetching user data:', err);
            // Fallback to anonymous greeting
            setUserName('');
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setMessages([
              { id: 1, text: getAdvancedPersonalizedGreeting(), sender: 'ai', time: now }
            ]);
          });
      } else {
        setUserName('');
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages([
          { id: 1, text: getAdvancedPersonalizedGreeting(), sender: 'ai', time: now }
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

  function getUserHabitData() {
    const habits = JSON.parse(localStorage.getItem('habitharmony_user_habits') || '[]');
    const streak = localStorage.getItem('habitharmony_streak') || '0';
    const points = localStorage.getItem('habitharmony_points') || '0';
    const calendarHistory = JSON.parse(localStorage.getItem('habitharmony_calendar_history') || '{}');

    // Analytics
    // 1. Most consistent habit (highest streak)
    let mostConsistentHabit = null;
    let bestStreak = 0;
    let longestStreakHabit = null;
    habits.forEach(h => {
      if (h.streak && h.streak > bestStreak) {
        bestStreak = h.streak;
        mostConsistentHabit = h.name;
        longestStreakHabit = h.name;
      }
    });

    // 2. Habits completed this week
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Sunday
    const completedThisWeek = {};
    let totalCompletionsAllTime = 0;
    let completionsByWeek = {};
    let completionsByMonth = {};
    let missedThisWeek = {};
    Object.entries(calendarHistory).forEach(([date, completedIds]) => {
      const d = new Date(date);
      // Count completions for all time
      totalCompletionsAllTime += completedIds.length;
      // Count completions by week
      const weekKey = `${d.getFullYear()}-W${getWeekNumber(d)}`;
      completionsByWeek[weekKey] = (completionsByWeek[weekKey] || 0) + completedIds.length;
      // Count completions by month
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      completionsByMonth[monthKey] = (completionsByMonth[monthKey] || 0) + completedIds.length;
      // This week
      if (d >= weekStart && d <= today) {
        completedIds.forEach(id => {
          const habit = habits.find(h => h.id === id);
          if (habit) {
            completedThisWeek[habit.name] = (completedThisWeek[habit.name] || 0) + 1;
          }
        });
      }
    });
    // Calculate average completions per week
    const weekCounts = Object.values(completionsByWeek);
    const avgCompletionsPerWeek = weekCounts.length ? (weekCounts.reduce((a, b) => a + b, 0) / weekCounts.length).toFixed(2) : '0';

    // Best month (most completions in a month)
    let bestMonth = null;
    let bestMonthCount = 0;
    Object.entries(completionsByMonth).forEach(([month, count]) => {
      if (count > bestMonthCount) {
        bestMonthCount = count;
        bestMonth = month;
      }
    });

    // Missed habits this week
    habits.forEach(habit => {
      const completed = completedThisWeek[habit.name] || 0;
      if (completed === 0) {
        missedThisWeek[habit.name] = true;
      }
    });

    // 3. Last completed habit
    let lastCompletedHabit = null;
    const sortedDates = Object.keys(calendarHistory).sort((a, b) => new Date(b) - new Date(a));
    for (const date of sortedDates) {
      const completedIds = calendarHistory[date];
      if (completedIds && completedIds.length > 0) {
        const habit = habits.find(h => h.id === completedIds[0]);
        if (habit) {
          lastCompletedHabit = habit.name;
          break;
        }
      }
    }

    // Most improved habit (largest streak increase in last 30 days)
    let mostImprovedHabit = null;
    let maxStreakIncrease = 0;
    // For demo: assume each habit has a streakHistory array in localStorage (not implemented in your code, so fallback to streak)
    // If you want to track streak history, you would update this logic
    habits.forEach(habit => {
      // Simulate: streak 30 days ago is 0, now is habit.streak
      const streak30DaysAgo = 0;
      const increase = habit.streak - streak30DaysAgo;
      if (increase > maxStreakIncrease) {
        maxStreakIncrease = increase;
        mostImprovedHabit = habit.name;
      }
    });

    return {
      habits,
      streak,
      points,
      calendarHistory,
      mostConsistentHabit,
      bestStreak,
      completedThisWeek,
      lastCompletedHabit,
      totalCompletionsAllTime,
      avgCompletionsPerWeek,
      longestStreakHabit,
      missedThisWeek,
      bestMonth,
      bestMonthCount,
      mostImprovedHabit,
      maxStreakIncrease
    };
  }

  // Helper to get ISO week number
  function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    return weekNo;
  }

  // Payment handler
  const handleRazorpayPayment = async () => {
    setUpgradeStep('processing');
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setUpgradeStep('error');
      setUpgradeError('Failed to load payment gateway.');
      return;
    }
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag', // Demo key, replace with your real key
      amount: selectedPlan === 'monthly' ? 10000 : 79900, // in paise
      currency: 'INR',
      name: 'Habit Harmony',
      description: selectedPlan === 'monthly' ? 'Monthly Premium' : 'Yearly Premium',
      image: '',
      handler: function (response) {
        // On success
        localStorage.setItem('habitharmony_premium', 'true');
        setPremium(true);
        setUpgradeStep('success');
      },
      prefill: {
        name: '',
        email: '',
      },
      theme: {
        color: '#F75836',
      },
      modal: {
        ondismiss: () => {
          setUpgradeStep('plans');
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const habitData = getUserHabitData();
  useEffect(() => {
    const personalizedSuggestions = getPersonalizedSuggestions({ userName, habitData, currentMood, messages });
    setSuggestions(personalizedSuggestions);
  }, [messages, currentMood, userName, habitData]);

  return (
    <div className="min-h-screen font-display bg-[#F8F3F3] pb-24 relative flex flex-col">
      {/* Header - Sticky */}
      <div className="sticky top-0 bg-[#F8F3F3] z-10 pt-6 pb-3 px-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)} // Go back to previous page
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
            <h3 className="font-medium text-blue-700">
              {premium ? (
                <span className="inline-flex items-center gap-2 text-green-600">
                  <Award size={16} className="inline-block" /> Premium Member
                </span>
              ) : (
                <>Free Plan: {remainingMessages}/10 coaching sessions left</>
              )}
            </h3>
            <p className="text-sm text-blue-600 mt-1">
              {premium ? 'You have unlimited coaching!' : 'Get unlimited coaching with Premium!'}
            </p>
            {!premium && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-2 bg-[#F75836] text-white text-sm py-1 px-3 rounded-full"
                onClick={() => { setShowUpgradeModal(true); setUpgradeStep('plans'); }}
              >
                Upgrade
              </motion.button>
            )}
            {premium && (
              <button
                className="mt-4 text-blue-600 underline"
                onClick={() => setShowManageSubscription(true)}
              >
                Manage Subscription
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Manage Subscription Modal */}
      <AnimatePresence>
        {showManageSubscription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
          >
            <div className="fixed inset-0 bg-black opacity-40" onClick={() => setShowManageSubscription(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-t-2xl p-6 z-50 max-w-md w-full mx-auto shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Manage Subscription</h2>
                <button onClick={() => setShowManageSubscription(false)} className="text-gray-400">
                  <X size={20} />
                </button>
              </div>
              <div>
                <p className="mb-4">To cancel or change your subscription, please contact <a href="mailto:support@habitharmony.com" className="underline text-blue-600">support@habitharmony.com</a> or visit your payment provider's dashboard.</p>
                <button className="bg-[#F75836] text-white px-6 py-2 rounded-full font-semibold" onClick={() => setShowManageSubscription(false)}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowUpgradeModal(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 z-50 max-w-md mx-auto shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Upgrade to Premium</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-gray-400"
                >
                  <X size={20} />
                </motion.button>
              </div>
              {upgradeStep === 'plans' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div>
                      <div className="font-semibold">Monthly</div>
                      <div className="text-gray-500 text-sm">₹100 / month</div>
                    </div>
                    <button className="bg-[#F75836] text-white px-4 py-2 rounded-full font-semibold" onClick={() => { setSelectedPlan('monthly'); setUpgradeStep('confirm'); }}>Choose</button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div>
                      <div className="font-semibold">Yearly</div>
                      <div className="text-gray-500 text-sm">₹799 / year</div>
                    </div>
                    <button className="bg-[#F75836] text-white px-4 py-2 rounded-full font-semibold" onClick={() => { setSelectedPlan('yearly'); setUpgradeStep('confirm'); }}>Choose</button>
                  </div>
                </div>
              )}
              {upgradeStep === 'confirm' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-2">Confirm your plan</div>
                    <div className="mb-4">
                      {selectedPlan === 'monthly' ? 'Monthly Premium – ₹100 / month' : 'Yearly Premium – ₹799 / year'}
                    </div>
                    <button className="bg-[#F75836] text-white px-6 py-2 rounded-full font-semibold" onClick={handleRazorpayPayment}>Proceed to Payment</button>
                    <button className="block mx-auto mt-3 text-gray-500 underline" onClick={() => setUpgradeStep('plans')}>Back</button>
                  </div>
                </div>
              )}
              {upgradeStep === 'processing' && (
                <div className="text-center py-8">
                  <div className="text-lg font-semibold mb-2">Processing payment...</div>
                  <div className="text-gray-500">Please wait and do not close this window.</div>
                </div>
              )}
              {upgradeStep === 'success' && (
                <div className="text-center py-8">
                  <div className="text-green-600 text-2xl mb-2">✔</div>
                  <div className="text-lg font-semibold mb-2">Thank you for upgrading!</div>
                  <div className="text-gray-600 mb-4">You are now a Premium member. Enjoy unlimited coaching and exclusive features.</div>
                  <button className="bg-[#F75836] text-white px-6 py-2 rounded-full font-semibold" onClick={() => { setShowUpgradeModal(false); setUpgradeStep('plans'); }}>Get Started</button>
                </div>
              )}
              {upgradeStep === 'error' && (
                <div className="text-center py-8">
                  <div className="text-red-600 text-2xl mb-2">✖</div>
                  <div className="text-lg font-semibold mb-2">Payment failed</div>
                  <div className="text-gray-600 mb-4">{upgradeError || 'Something went wrong. Please try again.'}</div>
                  <button className="bg-[#F75836] text-white px-6 py-2 rounded-full font-semibold" onClick={() => setUpgradeStep('plans')}>Back to Plans</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Limit Reached Modal */}
      <AnimatePresence>
        {showLimitReachedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="fixed inset-0 bg-black opacity-40" onClick={() => setShowLimitReachedModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-xl p-6 z-50 max-w-md w-full mx-4 shadow-lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h2 className="text-xl font-bold mb-2">Message Limit Reached</h2>
                <p className="text-gray-600 mb-6">
                  You've used all your free messages. Upgrade to Premium for unlimited coaching and exclusive features!
                </p>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowLimitReachedModal(false);
                      setShowUpgradeModal(true);
                      setUpgradeStep('plans');
                    }}
                    className="w-full bg-[#F75836] text-white py-3 rounded-xl font-semibold"
                  >
                    Upgrade to Premium
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLimitReachedModal(false)}
                    className="w-full border border-gray-300 py-3 rounded-xl font-semibold"
                  >
                    Maybe Later
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          
          {/* Mood Check Prompt */}
          <AnimatePresence>
            {showMoodSelector && (
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
                      onClick={() => setShowMoodSelector(false)}
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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Coach Nova..."
              className="w-full border border-gray-300 rounded-2xl py-3 px-4 pr-10 text-sm focus:outline-none focus:border-[#F75836] resize-none"
              style={{ maxHeight: '120px', minHeight: '48px' }}
              rows={input.split('\n').length > 3 ? 3 : input.split('\n').length}
              onKeyDown={handleKeyDown}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim()}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                input.trim() ? 'text-[#F75836]' : 'text-gray-400'
              }`}
            >
              <Send size={20} />
            </motion.button>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMoodSelector(true)}
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