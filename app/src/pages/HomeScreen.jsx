   // Trigger Vercel fresh build - no code change
import React, { useState, useEffect } from "react";
import { 
  Sun, Plus, ChevronRight, Bell, Trophy, 
  Zap, ArrowRight, Calendar as CalendarIcon, User, X, Pencil, Moon, LogOut, Edit, Award, Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import maradImg from '../assets/marad.webp';
import auratImg from '../assets/aurat.webp';
import { useNavigate, useLocation } from 'react-router-dom';
import { UPGRADE_FEATURES, UPGRADE_PRICES, getRemainingMessages, openRazorpay } from '../utils/upgradeInfo';

// Mock data for the demo
const userPoints = 1420;
const userStreak = 7;
const userAvatar = "/api/placeholder/40/40";

// Modified reminders data to match ReminderComponent structure
const reminders = [
  {
    activity: "meditation",
    message: "Take a moment for mindfulness. Just 5 minutes of meditation daily can reduce stress.",
    color: "blue",
    icon: "🧘"
  },
  {
    activity: "hydration",
    message: "Remember to drink water every hour for better hydration.",
    color: "cyan",
    icon: "💧"
  },
  {
    activity: "walking",
    message: "Taking a short walk can boost your creativity.",
    color: "purple",
    icon: "🚶"
  }
];

// Colors mapping for dynamic styling (same as in ReminderComponent)
const colorVariants = {
  amber: {
    bg: "bg-amber-100",
    text: "text-amber-500"
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-500"
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-500"
  },
  cyan: {
    bg: "bg-cyan-100",
    text: "text-cyan-500"
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-500"
  }
};

const friendsData = [
  { id: 1, name: "Emma", avatar: "/api/placeholder/40/40", progress: 80 },
  { id: 2, name: "Mike", avatar: "/api/placeholder/40/40", progress: 65 },
  { id: 3, name: "Sarah", avatar: "/api/placeholder/40/40", progress: 90 },
  { id: 4, name: "John", avatar: "/api/placeholder/40/40", progress: 40 },
  { id: 5, name: "Lisa", avatar: "/api/placeholder/40/40", progress: 75 }
];

const challengesData = [
  { 
    id: 1, 
    title: "Best Runners!", 
    icon: "🏃", 
    daysLeft: 5, 
    friendsJoined: 2, 
    progress: 70 
  },
  { 
    id: 2, 
    title: "Readathon", 
    icon: "📚", 
    daysLeft: 3, 
    friendsJoined: 4, 
    progress: 50 
  }
];

const habitsData = [
  { 
    id: 1, 
    name: "Drink 8 Cups of Water", 
    icon: "🚰", 
    progress: 500, 
    target: 2000, 
    unit: "mL", 
    streak: 6 
  },
  { 
    id: 2, 
    name: "Read 30 Minutes", 
    icon: "📚", 
    progress: 15, 
    target: 30, 
    unit: "min", 
    streak: 3 
  },
  { 
    id: 3, 
    name: "Walk 10k Steps", 
    icon: "🚶", 
    progress: 6500, 
    target: 10000, 
    unit: "steps", 
    streak: 12 
  }
];

const suggestionsData = [
  { id: 1, icon: "📚", text: "Try a 5-min reading break today" },
  { id: 2, icon: "💬", text: "Chat with AI Coach for personalized tips" },
  { id: 3, icon: "🧠", text: "Learn a new word every day" }
];

// Generate the days of the week
const getCurrentWeek = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(today.setDate(diff));
  const week = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);
    const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i];
    const dateStr = currentDate.toLocaleDateString('en-CA');
    week.push({ dayName, dateStr, dayNum: currentDate.getDate() });
  }
  return week;
};

const HABITS_STORAGE_KEY = 'habitharmony_habits';
const POINTS_STORAGE_KEY = 'habitharmony_points';
const STREAK_STORAGE_KEY = 'habitharmony_streak';
const POINTS_TODAY_STORAGE_KEY = 'habitharmony_points_today';
const LAST_STREAK_DATE_KEY = 'habitharmony_last_streak_date';
const CALENDAR_HISTORY_KEY = 'habitharmony_calendar_history';

// Predefined habits
const predefinedHabits = [
  { name: "Drink Water", icon: "🚰", unit: "cups", target: 8 },
  { name: "Exercise", icon: "🏋️", unit: "min", target: 30 },
  { name: "Reading", icon: "📚", unit: "min", target: 30 },
  { name: "Studying", icon: "📖", unit: "min", target: 60 },
  { name: "Cooking", icon: "🍳", unit: "meals", target: 1 },
  { name: "Gardening", icon: "🌱", unit: "min", target: 20 },
  { name: "Meditation", icon: "🧘", unit: "min", target: 10 },
  { name: "Coding", icon: "💻", unit: "min", target: 45 }
];

const getTodayStr = () => new Date().toLocaleDateString('en-CA');

const HabitSkeleton = React.memo(() => (
  <div className="bg-white rounded-xl p-4 mb-3 border border-gray-100 flex items-center justify-between animate-pulse">
    <div className="flex items-center gap-3">
      <span className="bg-gray-200 rounded-full w-8 h-8 block" />
      <div className="h-4 bg-gray-200 rounded w-24" />
    </div>
    <div className="flex items-center gap-2">
      <span className="bg-orange-100 rounded w-10 h-4 block" />
      <span className="bg-gray-200 rounded-full w-8 h-8 block" />
    </div>
  </div>
));

const MenuButton = React.memo(function MenuButton({ icon, label, onClick }) {
  return (
    <button
      className="w-full flex items-center px-4 py-3 rounded-xl transition-all duration-150 active:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-[#F75836] text-base font-medium group"
      onClick={onClick}
      tabIndex={0}
      type="button"
    >
      {icon}
      <span className="flex-1 text-left transition-colors">{label}</span>
    </button>
  );
});

const ProgressRing = React.memo(({ progress, size = 40, strokeWidth = 3, color = "#F75836" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  return (
    <svg height={size} width={size} className="absolute top-0 left-0">
      <circle
        stroke="#E5E7EB"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
      />
    </svg>
  );
});

const HomeScreen = () => {
  const [currentReminderIndex, setCurrentReminderIndex] = useState(0);
  const [showFABMenu, setShowFABMenu] = useState(false);
  const [greeting, setGreeting] = useState("Good Morning");
  const [showMonthView, setShowMonthView] = useState(false);
  const [showReminder, setShowReminder] = useState(true);
  const [userName, setUserName] = useState('');
  const [habitHistory, setHabitHistory] = useState({
    '2024-05-01': { completed: 3, total: 3 },
    '2024-05-02': { completed: 2, total: 3 },
    // Add more dates as needed
  });
  const [selectedDay, setSelectedDay] = useState(null);
  const [habits, setHabits] = useState(() => {
    const stored = localStorage.getItem('habitharmony_user_habits');
    let habitsArr = stored ? JSON.parse(stored) : habitsData;
    // Load today's completed habits from calendar history
    const calendarHistory = JSON.parse(localStorage.getItem(CALENDAR_HISTORY_KEY) || '{}');
    const today = getTodayStr();
    const completedIds = calendarHistory[today] || [];
    habitsArr = habitsArr.map(h => ({ ...h, completed: completedIds.includes(h.id) }));
    return habitsArr;
  });
  const [habitModal, setHabitModal] = useState({ open: false, habit: null });
  const [habitProgress, setHabitProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showEditHabits, setShowEditHabits] = useState(false);
  const [userPoints, setUserPoints] = useState(() => {
    const stored = localStorage.getItem(POINTS_STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });
  const [habitPoints, setHabitPoints] = useState(() => {
    const stored = localStorage.getItem('habitharmony_habitPoints');
    return stored ? JSON.parse(stored) : {};
  });
  // Track the last points earned for celebration popup
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [userStreak, setUserStreak] = useState(() => {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 7;
  });
  const [pointsToday, setPointsToday] = useState(() => {
    const stored = localStorage.getItem(POINTS_TODAY_STORAGE_KEY);
    const today = getTodayStr();
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) return parsed.points;
    }
    return 0;
  });
  const [lastStreakDate, setLastStreakDate] = useState(() => {
    return localStorage.getItem(LAST_STREAK_DATE_KEY) || '';
  });
  // Track if a streak was just hit for the celebration popup
  const [justHitStreak, setJustHitStreak] = useState(false);
  const [justHitStreakValue, setJustHitStreakValue] = useState(0);
  const [calendarHistory, setCalendarHistory] = useState({});
  const [avatar, setAvatar] = useState(() => {
    return localStorage.getItem('habitharmony_avatar') || maradImg;
  });
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isPremium = localStorage.getItem('habitharmony_premium') === 'true';
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('habitharmony_theme') || 'light');
  const location = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Blur navbar when edit modal is open
  useEffect(() => {
    if (showCelebration || showEditHabits) {
      document.body.classList.add('celebration-blur');
    } else {
      document.body.classList.remove('celebration-blur');
    }
    return () => document.body.classList.remove('celebration-blur');
  }, [showCelebration, showEditHabits]);

  // Click-away logic for menu
  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('.profile-menu-trigger') && !e.target.closest('.profile-menu-dropdown')) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showProfileMenu]);

  const handleThemeToggle = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('habitharmony_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Function to open day details modal
  function openDayDetails(dateStr) {
    setSelectedDay(dateStr);
  }

  function closeDayDetails() {
    setSelectedDay(null);
  }

  // Open habit modal and set progress
  function openHabitModal(habit) {
    setHabitModal({ open: true, habit });
    setHabitProgress(habit.progress);
  }

  // Handle progress change
  function handleProgressChange(val) {
    setHabitProgress(val);
  }

  // Handle progress submit
  function handleProgressSubmit() {
    const updatedHabits = habits.map(h =>
      h.id === habitModal.habit.id ? { ...h, progress: habitProgress } : h
    );
    setHabits(updatedHabits);
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
    if (habitProgress >= habitModal.habit.target) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2500);
    }
    setHabitModal({ open: false, habit: null });
  }

  // Remove a habit
  function removeHabit(habitId) {
    const updatedHabits = habits.filter(h => h.id !== habitId);
    setHabits(updatedHabits);
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
  }

  // Helper to check if all habits are completed
  function allHabitsCompleted(habitsArr) {
    return habitsArr.length > 0 && habitsArr.every(h => h.completed);
  }

  // Toggle habit completed state and update streak, points, and pointsToday
  function toggleHabitCompleted(habitId) {
    let showCelebrate = false;
    let pointsDelta = 0;
    let willHitStreak = false;
    let nextStreakValue = userStreak;
    const today = getTodayStr();
    const updatedHabits = habits.map(h => {
      if (h.id === habitId) {
        const nowCompleted = !h.completed;
        let newStreak = h.streak;
        if (nowCompleted) {
          showCelebrate = true;
          newStreak = h.streak + 1;
          pointsDelta = Math.floor(Math.random() * 6) + 5;
          setLastPointsEarned(pointsDelta);
        } else {
          newStreak = Math.max(0, h.streak - 1);
          pointsDelta = -(habitPoints[habitId] || 0);
          setLastPointsEarned(0);
        }
        return { ...h, completed: nowCompleted, streak: newStreak };
      }
      return h;
    });
    setHabits(updatedHabits);
    // Persist completed state for today in calendarHistory and habits
    const completedHabits = updatedHabits.filter(h => h.completed).map(h => h.id);
    setCalendarHistory(prev => {
      const updated = { ...prev, [today]: completedHabits };
      localStorage.setItem(CALENDAR_HISTORY_KEY, JSON.stringify(updated));
      // Also update habits in localStorage to persist completed state
      localStorage.setItem('habitharmony_user_habits', JSON.stringify(updatedHabits));
      return updated;
    });

    // Update points and habitPoints
    setUserPoints(prev => {
      let newPoints = prev + pointsDelta;
      if (newPoints < 0) newPoints = 0;
      localStorage.setItem(POINTS_STORAGE_KEY, newPoints);
      // Sync points and streak with backend
      try {
        const user = JSON.parse(localStorage.getItem('habitharmony_user'));
        fetch('https://habitharmony.onrender.com/api/auth/update-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            points: newPoints,
            streak: userStreak // use the latest streak value
          })
        });
      } catch (e) { /* ignore errors for now */ }
      return newPoints;
    });
    setHabitPoints(prev => {
      const updated = { ...prev };
      if (pointsDelta > 0) {
        updated[habitId] = pointsDelta;
      } else if (pointsDelta < 0) {
        delete updated[habitId];
      }
      localStorage.setItem('habitharmony_habitPoints', JSON.stringify(updated));
      return updated;
    });

    // Update points earned today (add or subtract)
    setPointsToday(prev => {
      let newToday = prev + pointsDelta;
      if (newToday < 0) newToday = 0;
      localStorage.setItem(POINTS_TODAY_STORAGE_KEY, JSON.stringify({ date: today, points: newToday }));
      return newToday;
    });

    // Handle streak logic
    if (allHabitsCompleted(updatedHabits)) {
      if (lastStreakDate !== today) {
        willHitStreak = true;
        nextStreakValue = userStreak + 1;
        setUserStreak(prev => {
          const newStreak = prev + 1;
          localStorage.setItem(STREAK_STORAGE_KEY, newStreak);
          // Sync points and streak with backend
          try {
            const user = JSON.parse(localStorage.getItem('habitharmony_user'));
            fetch('https://habitharmony.onrender.com/api/auth/update-stats', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                points: userPoints,
                streak: newStreak
              })
            });
          } catch (e) { /* ignore errors for now */ }
          return newStreak;
        });
        setLastStreakDate(today);
        localStorage.setItem(LAST_STREAK_DATE_KEY, today);
      }
    } else {
      if (lastStreakDate === today) {
        setUserStreak(prev => {
          const newStreak = Math.max(0, prev - 1);
          localStorage.setItem(STREAK_STORAGE_KEY, newStreak);
          return newStreak;
        });
        setLastStreakDate('');
        localStorage.setItem(LAST_STREAK_DATE_KEY, '');
      }
    }

    if (showCelebrate) {
      if (willHitStreak) {
        setJustHitStreak(true);
        setJustHitStreakValue(nextStreakValue);
      } else {
        setJustHitStreak(false);
      }
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  }

  // Add predefined habit
  function addPredefinedHabit(habit) {
    // Prevent duplicates by name
    if (habits.some(h => h.name === habit.name)) return;
    const newHabit = {
      ...habit,
      id: Date.now(),
      completed: false,
      streak: 0,
    };
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
  }

  // Remove habit from modal
  function removeHabitFromModal(habitId) {
    const updatedHabits = habits.filter(h => h.id !== habitId);
    setHabits(updatedHabits);
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
  }

  const week = getCurrentWeek();

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    // Get user's first name from localStorage
    const storedName = localStorage.getItem('habitharmony_user_name');
    if (storedName) {
      setUserName(storedName);
    } else {
      // Fallback to API call if name not in localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        fetch('https://habitharmony.onrender.com/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            setUserName((data.name || '').split(' ')[0]);
          })
          .catch(err => {
            console.error('Error fetching user data:', err);
            setUserName('');
          });
      }
    }
  }, []);

  // Auto rotate reminders like in ReminderComponent
  useEffect(() => {
    const interval = setInterval(() => {
      if (showReminder) {
        setCurrentReminderIndex((prev) => (prev + 1) % reminders.length);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [currentReminderIndex, showReminder]);

  // Helper to check if a date is today (local time)
  function isToday(dateStr) {
    return dateStr === new Date().toLocaleDateString('en-CA');
  }

  // Update MonthView to use dynamic coloring and today highlight
  const MonthView = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay(); // Monday=1, Sunday=7
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    // Fill in blanks for days before the 1st
    for (let i = 1; i < firstDayOfWeek; i++) days.push(null);
    // Fill in days of the month
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    // Fill to complete the last week
    while (days.length % 7 !== 0) days.push(null);
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="bg-white rounded-xl p-4 shadow-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">{now.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <button 
            onClick={() => setShowMonthView(false)}
            className="text-gray-500"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
            <div key={`header-${idx}`} className="text-xs text-gray-500">{day}</div>
          ))}
          {days.map((day, idx) => {
            if (!day) return <div key={idx} />;
            const cellDate = new Date(year, month, day);
            const dateStr = cellDate.toLocaleDateString('en-CA');
            const colorClass = getDayColor(dateStr);
            const todayClass = isToday(dateStr) ? 'ring-2 ring-blue-500 ring-offset-2 font-bold' : '';
            return (
              <div
                key={idx}
                className={`h-8 rounded-full flex items-center justify-center text-sm cursor-pointer ${colorClass} ${todayClass}`}
                onClick={() => openDayDetails(dateStr)}
              >
                {day}
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  // Get current reminder and color
  const currentReminder = reminders[currentReminderIndex];
  const currentColor = colorVariants[currentReminder.color];

  // Update calendar history when habits are ticked/unticked
  useEffect(() => {
    const today = getTodayStr();
    const completedHabits = habits.filter(h => h.completed).map(h => h.id);
    setCalendarHistory(prev => {
      const updated = { ...prev, [today]: completedHabits };
      localStorage.setItem(CALENDAR_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [habits]);

  function getDayColor(dateStr) {
    const completed = calendarHistory[dateStr] || [];
    if (completed.length === habits.length && habits.length > 0) return 'bg-green-300 text-white';
    if (completed.length > 0) return 'bg-yellow-200 text-yellow-800';
    return 'bg-white text-gray-800';
  }

  useEffect(() => {
    if (selectedDay) {
      document.body.classList.add('celebration-blur');
    } else {
      document.body.classList.remove('celebration-blur');
    }
    return () => document.body.classList.remove('celebration-blur');
  }, [selectedDay]);

  // Sync habits state with localStorage whenever localStorage changes (e.g., after login/signup)
  useEffect(() => {
    const syncHabits = () => {
      const stored = localStorage.getItem('habitharmony_user_habits');
      if (stored) {
        setHabits(JSON.parse(stored).map(h => ({ ...h, completed: false, streak: h.streak || 0 })));
      }
    };
    window.addEventListener('storage', syncHabits);
    syncHabits();
    return () => window.removeEventListener('storage', syncHabits);
  }, []);

  useEffect(() => {
    // Re-sync completed state for today from calendarHistory
    const stored = localStorage.getItem('habitharmony_user_habits');
    let habitsArr = stored ? JSON.parse(stored) : habitsData;
    const calendarHistory = JSON.parse(localStorage.getItem(CALENDAR_HISTORY_KEY) || '{}');
    const today = getTodayStr();
    const completedIds = calendarHistory[today] || [];
    habitsArr = habitsArr.map(h => ({
      ...h,
      completed: completedIds.includes(h.id)
    }));
    setHabits(habitsArr);
  }, [location.pathname]);

  useEffect(() => {
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
      import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
        StatusBar.setBackgroundColor({ color: '#F8F3F3' });
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setNavigationBarColor({ color: '#FFFFFF' });
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#F8F3F3');
      });
    }
  }, []);

  return (
    <div className="min-h-screen font-display bg-[#F8F3F3] pb-24 relative overflow-y-auto">
      {/* Header - Sticky */}
      <div className="sticky top-0 bg-[#F8F3F3] z-10 pt-2 pb-3 px-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#F75836]">{greeting === "Good Morning" ? "☀️" : greeting === "Good Afternoon" ? "🌤️" : "🌙"}</span>
              <h1 className="font-bold text-lg">{greeting}, {userName}!</h1>
            </div>
            <p className="text-gray-500 text-sm mt-1">{
              new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })
            }</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white px-2 py-1 rounded-full border border-gray-200 shadow-sm whitespace-nowrap">
              <span className="text-sm font-medium flex items-center">
                <Zap size={14} className="text-yellow-500 mr-1" />
                {userPoints} pts
                <span className="mx-1.5 text-gray-300">|</span>
                <span className="text-red-500 mr-1">🔥</span>
                {userStreak}d
              </span>
            </div>
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="profile-menu-trigger size-10 rounded-full cursor-pointer border-2 border-[#F75836] overflow-hidden"
                onClick={() => setShowProfileMenu(v => !v)}
              >
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
                {isPremium && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow">Premium</span>
                )}
              </motion.div>
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="profile-menu-dropdown absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-2"
                  >
                    <MenuButton icon={<User size={18} className="mr-2 text-[#F75836]" />} label="View Profile" onClick={() => { setShowProfileMenu(false); navigate('/profile'); }} />
                    <MenuButton icon={<Edit size={18} className="mr-2 text-blue-500" />} label="Edit Profile" onClick={() => { setShowProfileMenu(false); localStorage.setItem('habitharmony_open_edit_profile', '1'); navigate('/profile'); }} />
                    <MenuButton
                      icon={currentTheme === 'dark' ? <Moon size={18} className="mr-2 text-indigo-500" /> : <Sun size={18} className="mr-2 text-yellow-500" />}
                      label={<span className="flex items-center">Theme: {currentTheme === 'dark' ? 'Dark' : 'Light'} {currentTheme === 'dark' ? <span className="ml-1">✔</span> : null}</span>}
                      onClick={() => { handleThemeToggle(); }}
                    />
                    {isPremium ? (
                      <MenuButton icon={<Award size={18} className="mr-2 text-green-600" />} label={<span className="flex items-center">Manage Subscription <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Premium</span></span>} onClick={() => { setShowProfileMenu(false); navigate('/profile?manage-sub=1'); }} />
                    ) : (
                      <MenuButton icon={<Trophy size={18} className="mr-2 text-orange-500" />} label={<span className="font-semibold text-orange-600">Upgrade to Premium</span>} onClick={() => { setShowProfileMenu(false); openRazorpay({ plan: 'monthly' }); }} />
                    )}
                    <div className="my-2 border-t border-gray-100" />
                    <MenuButton icon={<LogOut size={18} className="mr-2 text-red-500" />} label={<span className="text-red-500 font-semibold">Log Out</span>} onClick={() => { setShowProfileMenu(false); localStorage.clear(); navigate('/login'); }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      
      {/* Today's Habits Section */}
      <div className="mt-4 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Today's Habits</h2>
          <button
            className="ml-2 rounded-full border-2 border-gray-300 bg-white text-[#F75836] size-7 flex items-center justify-center transition-all hover:bg-orange-100 hover:text-orange-500"
            onClick={() => setShowEditHabits(true)}
            aria-label="Edit habits"
          >
            <Edit size={16} />
          </button>
        </div>
        {habits && habits.length > 0 ? (
          habits.map(habit => (
            <motion.div
              key={habit.id}
              whileHover={{ y: -1, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
              whileTap={{ scale: 0.99 }}
              className={`relative bg-white rounded-xl p-4 mb-3 border border-gray-100 flex items-center justify-between ${habit.completed ? 'opacity-60 line-through' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{habit.icon}</span>
                <h3 className="font-bold">{habit.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm flex items-center text-orange-500">
                  🔥 {habit.streak}d
                </span>
                <button
                  className={`ml-2 rounded-full border-2 ${habit.completed ? 'border-green-400 bg-green-100 text-green-600' : 'border-gray-300 bg-white text-gray-400'} size-8 flex items-center justify-center transition-all`}
                  onClick={() => toggleHabitCompleted(habit.id)}
                  aria-label="Toggle completed"
                >
                  {habit.completed ? (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  )}
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          // Show 3 skeletons if habits are not loaded
          <>
            <HabitSkeleton />
            <HabitSkeleton />
            <HabitSkeleton />
          </>
        )}
      </div>
      
      {/* Edit Habits Modal */}
      <AnimatePresence>
        {showEditHabits && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-96 max-w-full shadow-xl relative"
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowEditHabits(false)}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="font-bold text-lg mb-4">Edit Habits</h3>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Your Habits</h4>
                <ul>
                  {habits.map(habit => (
                    <li key={habit.id} className="flex items-center justify-between py-1">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{habit.icon}</span>
                        <span>{habit.name}</span>
                      </span>
                      <button
                        className="rounded-full border border-gray-200 bg-white text-gray-400 size-6 flex items-center justify-center transition-all hover:bg-red-100 hover:text-red-500"
                        onClick={() => removeHabitFromModal(habit.id)}
                        aria-label="Delete habit"
                      >
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Add Habit</h4>
                <ul>
                  {predefinedHabits.map((habit, idx) => (
                    <li key={idx} className="flex items-center justify-between py-1">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{habit.icon}</span>
                        <span>{habit.name}</span>
                      </span>
                      <button
                        className="rounded-full border border-gray-200 bg-white text-[#F75836] size-6 flex items-center justify-center transition-all hover:bg-orange-100 hover:text-orange-500"
                        onClick={() => addPredefinedHabit(habit)}
                        aria-label="Add habit"
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Habit Progress Modal */}
      <AnimatePresence>
        {habitModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-80 max-w-full shadow-xl relative"
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setHabitModal({ open: false, habit: null })}
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{habitModal.habit?.icon}</span>
                <h3 className="font-bold text-lg">{habitModal.habit?.name}</h3>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Progress ({habitModal.habit?.unit})</label>
                <input
                  type="number"
                  min="0"
                  max={habitModal.habit?.target}
                  value={habitProgress}
                  onChange={e => handleProgressChange(Number(e.target.value))}
                  className="w-full border rounded px-2 py-1 mb-2"
                />
                <input
                  type="range"
                  min="0"
                  max={habitModal.habit?.target}
                  value={habitProgress}
                  onChange={e => handleProgressChange(Number(e.target.value))}
                  className="w-full accent-[#F75836]"
                />
                <div className="text-xs text-gray-500 mt-1">Target: {habitModal.habit?.target} {habitModal.habit?.unit}</div>
              </div>
              <button
                className="w-full bg-[#F75836] text-white rounded-lg py-2 font-bold mt-2"
                onClick={handleProgressSubmit}
              >
                Update Progress
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Celebration Popup */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl"
            >
              <span className="text-5xl mb-2">🎉</span>
              <h2 className="font-bold text-xl mb-1">Congrats!</h2>
              {justHitStreak && (
                <div className="flex items-center text-lg font-semibold text-green-600 mb-1">
                  You hit streak day <span className="mr-1">🔥</span>{justHitStreakValue}!
                </div>
              )}
              {lastPointsEarned > 0 && (
                <div className="flex items-center text-lg font-semibold text-[#F75836] mb-1">
                  You earned {lastPointsEarned} <Zap size={20} className="inline ml-1" /> pts
                </div>
              )}
              <p className="text-gray-600 text-center">You checked off your habit. Keep it up!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Calendar Preview (Week View) */}
      <div className="mt-4 px-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg">Calendar</h2>
          <motion.span 
            className="text-[#F75836] text-sm font-medium cursor-pointer flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMonthView(!showMonthView)}
          >
            <CalendarIcon size={16} className="mr-1" /> Month View
          </motion.span>
        </div>
        <AnimatePresence>
          {showMonthView ? (
            <MonthView />
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-between overflow-x-auto py-2 gap-1"
            >
              {week.map((day, index) => {
                const colorClass = getDayColor(day.dateStr);
                const todayClass = isToday(day.dateStr) ? 'ring-2 ring-blue-500 ring-offset-2 font-bold' : '';
                return (
                  <motion.div
                    key={index}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 rounded-2xl w-12 h-16 flex flex-col items-center justify-center cursor-pointer ${colorClass} ${todayClass}`}
                    onClick={() => openDayDetails(day.dateStr)}
                  >
                    <span className="text-xs font-medium">{day.dayName}</span>
                    <span className="text-lg font-bold mt-1">{day.dayNum}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Calendar Day Details Modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-80 max-w-full shadow-xl relative"
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={closeDayDetails}
              >
                <X size={20} />
              </button>
              <h3 className="font-bold text-lg mb-4">Day Details</h3>
              <div className="mb-2 text-sm text-gray-500">{selectedDay}</div>
              <div className="mb-2">
                <span className="font-semibold">Completed Habits:</span>
                <ul className="list-disc ml-5 mt-1">
                  {calendarHistory[selectedDay] && calendarHistory[selectedDay].length > 0 ? (
                    habits
                      .filter(h => calendarHistory[selectedDay].includes(h.id))
                      .map(h => <li key={h.id}>{h.icon} {h.name}</li>)
                  ) : (
                    <li className="text-gray-400">None</li>
                  )}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Reminder Component (like ReminderComponent.jsx) */}
      {showReminder && (
        <div className="mt-4 px-4">
          <div className={`mx-auto ${currentColor.bg} rounded-lg p-3 relative shadow-sm overflow-hidden`}>
            {/* Background pattern for subtle visual interest */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-black -mr-8 -mt-8"></div>
              <div className="absolute left-0 bottom-0 w-16 h-16 rounded-full bg-black -ml-8 -mb-8"></div>
            </div>
            
            {/* Content with animation */}
            <div className="flex items-start">
              <div className={`${currentColor.text} mr-3 text-xl mt-1`}>
                {currentReminder.icon}
              </div>
              <div className="flex-1 min-h-16">
                <motion.div
                  key={currentReminderIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center">
                    <Bell className={`${currentColor.text} mr-2`} size={16} />
                    <h3 className="font-semibold">Reminder!</h3>
                  </div>
                  <p className="text-sm mt-1">{currentReminder.message}</p>
                </motion.div>
              </div>
            </div>
            
            {/* Progress dots */}
            <div className="flex justify-center mt-3 space-x-1.5">
              {reminders.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-1.5 rounded-full ${
                    index === currentReminderIndex 
                      ? currentColor.text
                      : 'bg-gray-300'
                  }`}
                  initial={{ width: index === currentReminderIndex ? 16 : 8 }}
                  animate={{ width: index === currentReminderIndex ? 16 : 8 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setCurrentReminderIndex(index)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Rewards & Streak Highlights */}
      <div className="mt-6 px-4">
        <h2 className="font-bold text-lg mb-3">Rewards & Streak Highlights</h2>
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-xl p-4 border border-gray-100"
        >
          <div className="flex items-center text-sm font-semibold text-[#F75836]">
            You earned {pointsToday} <Zap size={16} className="inline ml-1" /> pts today!
          </div>
          <p className="text-sm mt-2">
            {userStreak > 0 ? (
              <span className="inline-flex items-center whitespace-nowrap">
                You hit your <span className="text-red-500 mx-1">🔥</span>{userStreak}-day streak for completing all habits! <span className="ml-1">🎉</span>
              </span>
            ) : 'Complete all habits to start a streak!'}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeScreen;