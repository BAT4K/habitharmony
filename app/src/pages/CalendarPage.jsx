import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, ChevronRight, X, Calendar as CalendarIcon,
  BarChart3, MessageSquareText, Edit, ArrowLeft, ArrowRight, Zap, Sun, Moon, LogOut, Award, Trophy, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import maradImg from '../assets/marad.png';

// Constants from HomeScreen
const HABITS_STORAGE_KEY = 'habitharmony_user_habits';
const POINTS_STORAGE_KEY = 'habitharmony_points';
const STREAK_STORAGE_KEY = 'habitharmony_streak';
const POINTS_TODAY_STORAGE_KEY = 'habitharmony_points_today';
const LAST_STREAK_DATE_KEY = 'habitharmony_last_streak_date';
const CALENDAR_HISTORY_KEY = 'habitharmony_calendar_history';

// Predefined habits from HomeScreen
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

// Colors for the completion status
const completionColors = {
  completed: "bg-green-300 text-white rounded-xl",
  partial: "bg-yellow-200 text-yellow-800 rounded-xl",
  none: "bg-white text-gray-800 rounded-xl",
  today: "ring-2 ring-blue-400 font-bold"
};

const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [selectedDate, setSelectedDate] = useState(null);
  const [habitFilter, setHabitFilter] = useState("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedHabitData, setEditedHabitData] = useState({});
  const [habits, setHabits] = useState(() => {
    const stored = localStorage.getItem(HABITS_STORAGE_KEY);
    if (stored) return JSON.parse(stored).map(h => ({ ...h, completed: false, streak: 0 }));
    return [];
  });
  const [calendarHistory, setCalendarHistory] = useState(() => {
    const stored = localStorage.getItem(CALENDAR_HISTORY_KEY);
    return stored ? JSON.parse(stored) : {};
  });
  const [userPoints, setUserPoints] = useState(() => {
    const stored = localStorage.getItem(POINTS_STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });
  const [userStreak, setUserStreak] = useState(() => {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });
  const [pointsToday, setPointsToday] = useState(() => {
    const stored = localStorage.getItem(POINTS_TODAY_STORAGE_KEY);
    const today = new Date().toLocaleDateString('en-CA');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) return parsed.points;
    }
    return 0;
  });
  const [lastStreakDate, setLastStreakDate] = useState(() => {
    return localStorage.getItem(LAST_STREAK_DATE_KEY) || '';
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('habitharmony_theme') || 'light');
  const isPremium = localStorage.getItem('habitharmony_premium') === 'true';
  const [avatar, setAvatar] = useState(() =>
    localStorage.getItem('habitharmony_avatar') || maradImg
  );
  const navigate = useNavigate();

  // Get the current month and year
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  // Function to navigate to previous month
  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  // Function to navigate to next month
  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // Function to get calendar days for the current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const daysInMonth = lastDay.getDate();
    const days = [];
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, month: 'prev' });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const dateStr = dayDate.toLocaleDateString('en-CA');
      
      days.push({
        day: i,
        month: 'current',
        date: dateStr,
        isToday: isToday(dateStr),
        completionStatus: getCompletionStatus(dateStr),
        hasStreak: calendarHistory[dateStr]?.length === habits.length && habits.length > 0
      });
    }
    
    const remainingCells = 42 - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push({ day: null, month: 'next' });
    }
    
    return days;
  };

  // Function to check if a date is today
  const isToday = (dateStr) => {
    const today = new Date().toLocaleDateString('en-CA');
    return dateStr === today;
  };

  // Function to get completion status for a date
  const getCompletionStatus = (dateStr) => {
    const completedHabits = calendarHistory[dateStr] || [];
    if (completedHabits.length === 0) return 'none';
    if (completedHabits.length === habits.length && habits.length > 0) return 'completed';
    return 'partial';
  };

  // Get habits completion for a specific date
  const getHabitsForDate = (dateStr) => {
    const completedHabits = calendarHistory[dateStr] || [];
    return habits.map(habit => ({
      ...habit,
      completed: completedHabits.includes(habit.id)
    }));
  };

  // Handle day click
  const handleDayClick = (day) => {
    if (!day.date) return;
    setSelectedDate(day.date);
    setEditedHabitData(calendarHistory[day.date] || []);
  };

  // Toggle habit completion
  const toggleHabitCompletion = (habitId) => {
    if (!selectedDate) return;
    
    setEditedHabitData(prev => {
      const newData = [...prev];
      const index = newData.indexOf(habitId);
      if (index === -1) {
        newData.push(habitId);
      } else {
        newData.splice(index, 1);
      }
      return newData;
    });
  };

  // Save habit changes
  const saveHabitChanges = () => {
    setCalendarHistory(prev => {
      const updated = { ...prev, [selectedDate]: editedHabitData };
      localStorage.setItem(CALENDAR_HISTORY_KEY, JSON.stringify(updated));
      // If editing today, also update HomeScreen's habits completed property in localStorage
      const today = new Date().toLocaleDateString('en-CA');
      if (selectedDate === today) {
        const stored = localStorage.getItem(HABITS_STORAGE_KEY);
        if (stored) {
          let habitsArr = JSON.parse(stored);
          habitsArr = habitsArr.map(h => ({ ...h, completed: editedHabitData.includes(h.id) }));
          localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habitsArr));
        }
      }
      return updated;
    });
    // Update streak and points
    const today = new Date().toLocaleDateString('en-CA');
    if (selectedDate === today) {
      const allCompleted = editedHabitData.length === habits.length && habits.length > 0;
      if (allCompleted && lastStreakDate !== today) {
        const newStreak = userStreak + 1;
        setUserStreak(newStreak);
        localStorage.setItem(STREAK_STORAGE_KEY, newStreak);
        setLastStreakDate(today);
        localStorage.setItem(LAST_STREAK_DATE_KEY, today);
      }
    }
    setEditModalOpen(false);
  };

  // Add predefined habit
  const addPredefinedHabit = (habit) => {
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
  };

  // Remove habit
  const removeHabit = (habitId) => {
    const updatedHabits = habits.filter(h => h.id !== habitId);
    setHabits(updatedHabits);
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(updatedHabits));
  };

  // Render calendar
  const renderCalendar = () => {
    const days = getCalendarDays();
    return (
      <div className="grid grid-cols-7 gap-2 mt-6">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
          <div key={`header-${idx}`} className="text-center text-base font-semibold text-gray-600 mb-2">
            {day}
          </div>
        ))}
        {days.map((day, idx) => {
          if (day.day === null) {
            return <div key={`empty-${idx}`} className="h-12"></div>;
          }
          let statusClass = '';
          if (habitFilter === 'all') {
            statusClass = day.isToday 
              ? completionColors.today + ' ' + completionColors[day.completionStatus]
              : completionColors[day.completionStatus];
          } else {
            // Only check if the selected habit was completed on this day
            const completed = (calendarHistory[day.date] || []).includes(Number(habitFilter));
            statusClass = day.isToday
              ? completionColors.today + ' ' + (completed ? completionColors.completed : completionColors.none)
              : (completed ? completionColors.completed : completionColors.none);
          }
          return (
            <motion.div
              key={`day-${idx}`}
              whileHover={{ y: -2, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
              whileTap={{ scale: 0.95 }}
              className={`relative h-12 w-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 ${statusClass}`}
              onClick={() => handleDayClick(day)}
            >
              <span className="text-base font-bold">{day.day}</span>
              <div className="flex items-center mt-1 space-x-2">
                {day.hasStreak && habitFilter === 'all' && (
                  <span className="text-base text-red-500">🔥</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Render selected day details
  const renderDayDetails = () => {
    if (!selectedDate) return null;
    
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    };
    
    const habits = getHabitsForDate(selectedDate);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-2xl p-8 shadow-lg mt-4 border border-gray-100"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl">{formatDate(selectedDate)}</h3>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              onClick={() => setSelectedDate(null)}
            >
              <X size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-white border border-gray-200 text-[#F75836] hover:bg-orange-50"
              onClick={() => setEditModalOpen(true)}
            >
              <Edit size={16} />
            </motion.button>
          </div>
        </div>
        
        <div className="space-y-3">
          {habits.map(habit => (
            <div 
              key={`detail-${habit.id}`}
              className={`flex items-center justify-between p-3 rounded-lg ${habit.completed ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{habit.icon}</span>
                <span className="font-medium">{habit.name}</span>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${habit.completed ? 'bg-green-500 text-white' : 'bg-white border border-gray-300'}`}>
                {habit.completed && (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {calendarHistory[selectedDate]?.length === habits.length && habits.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center space-x-2">
              <span className="text-red-500 text-lg">🔥</span>
              <span className="font-medium">Streak day!</span>
            </div>
            <p className="text-sm mt-1 text-gray-600">All habits completed for this day!</p>
          </div>
        )}
      </motion.div>
    );
  };

  // Add AI Coach suggestion below the calendar
  function getAiCoachSuggestion() {
    if (!habits.length) return "Add some habits to get personalized suggestions!";
    const today = new Date().toLocaleDateString('en-CA');
    const habitCounts = {};
    const missedCounts = {};
    const streaks = {};
    const daysThisMonth = Object.keys(calendarHistory).filter(date => date.slice(0, 7) === today.slice(0, 7));
    habits.forEach(h => { habitCounts[h.id] = 0; missedCounts[h.id] = 0; streaks[h.id] = 0; });
    daysThisMonth.forEach(date => {
      const completed = calendarHistory[date] || [];
      habits.forEach(h => {
        if (completed.includes(h.id)) habitCounts[h.id]++;
        else missedCounts[h.id]++;
      });
    });
    // Find most/least consistent, most missed, and new habits
    let most = null, least = null, mostMissed = null, newest = null;
    habits.forEach(h => {
      if (most === null || habitCounts[h.id] > habitCounts[most.id]) most = h;
      if (least === null || habitCounts[h.id] < habitCounts[least.id]) least = h;
      if (mostMissed === null || missedCounts[h.id] > missedCounts[mostMissed.id]) mostMissed = h;
    });
    // Find newest habit (by id, assuming higher id = newer)
    newest = habits.reduce((a, b) => (a.id > b.id ? a : b), habits[0]);
    // Personalized tips
    if (mostMissed && missedCounts[mostMissed.id] > 2) {
      return `You've missed ${mostMissed.name} on ${missedCounts[mostMissed.id]} days this month. Try setting a reminder or scheduling a specific time!`;
    } else if (most && habitCounts[most.id] >= daysThisMonth.length - 1) {
      return `Amazing consistency with ${most.name}! Keep up the great work!`;
    } else if (newest && habitCounts[newest.id] === 0) {
      return `Welcome to your new habit, ${newest.name}! Start strong this week.`;
    } else if (least && most && most.id !== least.id) {
      return `You're most consistent with ${most.name}. Try focusing on ${least.name} this week!`;
    } else if (most) {
      return `Great job on your ${most.name} habit! Keep it up!`;
    } else {
      return "Start tracking your habits to get personalized tips!";
    }
  }

  // Add MenuButton component (reuse from HomeScreen)
  function MenuButton({ icon, label, onClick }) {
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
  }

  // Sync avatar with localStorage changes
  useEffect(() => {
    const syncAvatar = () => {
      setAvatar(localStorage.getItem('habitharmony_avatar') || maradImg);
    };
    window.addEventListener('storage', syncAvatar);
    return () => window.removeEventListener('storage', syncAvatar);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F3F3] pb-24 relative overflow-y-auto">
      {/* Header - Sticky */}
      <div className="sticky top-0 bg-[#F8F3F3] z-10 pt-4 pb-2 px-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h1 className="font-bold text-2xl tracking-tight">Calendar</h1>
          {/* Points, streak, and profile picture row (top right) */}
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
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
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
                      onClick={() => {
                        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                        setCurrentTheme(newTheme);
                        localStorage.setItem('habitharmony_theme', newTheme);
                        document.documentElement.classList.toggle('dark', newTheme === 'dark');
                      }}
                    />
                    {isPremium ? (
                      <MenuButton icon={<Award size={18} className="mr-2 text-green-600" />} label={<span className="flex items-center">Manage Subscription <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Premium</span></span>} onClick={() => { setShowProfileMenu(false); navigate('/profile?manage-sub=1'); }} />
                    ) : (
                      <MenuButton icon={<Trophy size={18} className="mr-2 text-orange-500" />} label={<span className="font-semibold text-orange-600">Upgrade to Premium</span>} onClick={() => { setShowProfileMenu(false); /* openRazorpay({ plan: 'monthly' }); */ }} />
                    )}
                    <div className="my-2 border-t border-gray-100" />
                    <MenuButton icon={<LogOut size={18} className="mr-2 text-red-500" />} label={<span className="text-red-500 font-semibold">Log Out</span>} onClick={() => { setShowProfileMenu(false); localStorage.clear(); navigate('/login'); }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        {/* Month/Year with arrows at corners */}
        <div className="relative flex items-center justify-center mb-2">
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.96 }}
            className="absolute left-0 p-2 rounded-full bg-white shadow-sm"
            onClick={prevMonth}
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </motion.button>
          <h2 className="font-bold text-lg tracking-tight mx-auto">
            {currentMonth} {currentYear}
          </h2>
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.96 }}
            className="absolute right-0 p-2 rounded-full bg-white shadow-sm"
            onClick={nextMonth}
          >
            <ChevronRight size={20} className="text-gray-600" />
          </motion.button>
        </div>
        {/* Filter bar below the line, above the calendar grid */}
        <div className="overflow-x-auto flex space-x-2 pb-1 border-b border-gray-200 mb-1">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-150 ${habitFilter === 'all' ? 'bg-[#F75836] text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
            onClick={() => setHabitFilter('all')}
          >
            All Habits
          </motion.button>
          {habits.map(habit => (
            <motion.button
              key={`filter-${habit.id}`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-150 ${habitFilter === String(habit.id) ? 'bg-[#F75836] text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
              onClick={() => setHabitFilter(String(habit.id))}
            >
              <span>{habit.icon}</span>
              <span>{habit.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
      {/* Calendar view */}
      <div className="px-4">
        {renderCalendar()}
      </div>
      {/* Selected day details */}
      <div className="px-4">
        <AnimatePresence>
          {selectedDate && renderDayDetails()}
        </AnimatePresence>
      </div>
      {/* Edit Modal */}
      <AnimatePresence>
        {editModalOpen && selectedDate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl p-6 w-[28rem] max-w-[90%] shadow-xl relative"
              >
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setEditModalOpen(false)}
                >
                  <X size={20} />
                </button>
                
                <h3 className="font-bold text-xl mb-4">Edit Habits for {selectedDate}</h3>
                
                <div className="space-y-3 mb-6">
                  {habits.map(habit => (
                    <div 
                      key={`edit-${habit.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{habit.icon}</span>
                        <span className="font-medium">{habit.name}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${editedHabitData.includes(habit.id) ? 'bg-green-500 text-white' : 'bg-white border border-gray-300 text-gray-300'}`}
                        onClick={() => toggleHabitCompletion(habit.id)}
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.button>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-2 bg-gray-200 rounded-lg text-gray-800 font-medium"
                    onClick={() => setEditModalOpen(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-2 bg-[#F75836] rounded-lg text-white font-medium"
                    onClick={saveHabitChanges}
                  >
                    Save
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
      {/* AI Coach suggestion styled as in screenshot */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-600"><MessageSquareText size={20} /></span>
            <span className="font-bold text-gray-800">AI Coach Insight</span>
          </div>
          <div className="text-gray-700 text-base">
            {getAiCoachSuggestion()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarScreen;