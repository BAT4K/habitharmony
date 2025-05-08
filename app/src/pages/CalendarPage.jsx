import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, ChevronRight, X, Calendar as CalendarIcon,
  BarChart3, MessageSquareText, Edit, ArrowLeft, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock data for the demo - will be replaced with real data from your app
const initialHabits = [
  { id: 1, name: "Drink Water", icon: "🚰", color: "#3B82F6" },
  { id: 2, name: "Read", icon: "📚", color: "#8B5CF6" },
  { id: 3, name: "Exercise", icon: "🏃", color: "#F75836" },
  { id: 4, name: "Meditate", icon: "🧘", color: "#10B981" }
];

// Colors for the completion status
const completionColors = {
  completed: "bg-green-100 border-green-400 text-green-800",
  partial: "bg-yellow-100 border-yellow-400 text-yellow-800",
  missed: "bg-red-100 border-red-400 text-red-800",
  none: "bg-white border-gray-200 text-gray-800",
  today: "ring-2 ring-blue-400 font-bold"
};

// Mock habit completion data - in real app, this would come from your database
const initialCompletionData = {
  "2025-05-01": { 1: true, 2: true, 3: false, 4: true }, // partial
  "2025-05-02": { 1: true, 2: true, 3: true, 4: true },  // completed
  "2025-05-03": { 1: false, 2: false, 3: false, 4: false }, // missed
  "2025-05-04": { 1: true, 2: false, 3: true, 4: false }, // partial
  "2025-05-05": { 1: true, 2: true, 3: true, 4: true },  // completed
  "2025-05-06": { 1: true, 2: true, 3: true, 4: true },  // completed
  "2025-05-07": { 1: true, 2: false, 3: true, 4: true },  // partial
};

// Mock streak data
const streakData = {
  "2025-05-01": false,
  "2025-05-02": true,
  "2025-05-03": false,
  "2025-05-04": false,
  "2025-05-05": true,
  "2025-05-06": true,
  "2025-05-07": true
};

// Mock AI tips
const aiTipsData = {
  "2025-05-01": "You seem to struggle with exercise on Mondays. Try scheduling it earlier in the day.",
  "2025-05-03": "Missing all habits on weekends? Create a special weekend routine that's more flexible.",
  "2025-05-06": "Great job on your 2-day streak! Keep it going tomorrow."
};

const pad = n => n.toString().padStart(2, '0');

const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month"); // "month", "week", "heatmap"
  const [selectedDate, setSelectedDate] = useState(null);
  const [habitFilter, setHabitFilter] = useState("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedHabitData, setEditedHabitData] = useState({});
  const [allHabits, setAllHabits] = useState(initialHabits);
  const [completionData, setCompletionData] = useState(initialCompletionData);
  
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
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week of first day (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDay.getDay();
    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const daysInMonth = lastDay.getDate();
    const days = [];
    
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, month: 'prev' });
    }
    
    // Add days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const dateStr = dayDate.toLocaleDateString('en-CA');
      
      days.push({
        day: i,
        month: 'current',
        date: dateStr,
        isToday: isToday(dateStr),
        completionStatus: getCompletionStatus(dateStr),
        hasStreak: streakData[dateStr],
        hasAiTip: aiTipsData[dateStr] ? true : false
      });
    }
    
    // Add empty cells for days after the last day of the month (to complete the grid)
    const remainingCells = 42 - days.length; // 6 rows * 7 columns = 42
    for (let i = 0; i < remainingCells; i++) {
      days.push({ day: null, month: 'next' });
    }
    
    return days;
  };
  
  // Function to get week view days
  const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Calculate days from Monday
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const dateStr = day.toLocaleDateString('en-CA');
      
      days.push({
        date: dateStr,
        day: day.getDate(),
        weekday: day.toLocaleString('default', { weekday: 'short' }),
        isToday: isToday(dateStr),
        completionStatus: getCompletionStatus(dateStr),
        hasStreak: streakData[dateStr],
        hasAiTip: aiTipsData[dateStr] ? true : false
      });
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
    const data = completionData[dateStr];
    if (!data) return 'none';
    
    const habitIds = habitFilter === 'all' 
      ? allHabits.map(h => h.id)
      : [parseInt(habitFilter)];
    
    const relevantHabits = habitIds.filter(id => data[id] !== undefined);
    if (relevantHabits.length === 0) return 'none';
    
    const completed = relevantHabits.filter(id => data[id] === true).length;
    if (completed === relevantHabits.length) return 'completed';
    if (completed === 0) return 'missed';
    return 'partial';
  };
  
  // Get habits completion for a specific date
  const getHabitsForDate = (dateStr) => {
    const data = completionData[dateStr] || {};
    return allHabits.map(habit => ({
      ...habit,
      completed: data[habit.id] === true
    }));
  };
  
  // Handle day click
  const handleDayClick = (day) => {
    if (!day.date) return;
    setSelectedDate(day.date);
    setEditedHabitData(completionData[day.date] || {});
  };
  
  // Open edit modal for a specific date
  const openEditModal = () => {
    if (!selectedDate) return;
    setEditModalOpen(true);
  };
  
  // Update habit completion status
  const toggleHabitCompletion = (habitId) => {
    if (!selectedDate) return;
    
    setEditedHabitData(prev => {
      const newData = { ...prev };
      newData[habitId] = !newData[habitId];
      return newData;
    });
  };
  
  // Save habit data changes
  const saveHabitChanges = () => {
    setCompletionData(prev => ({
      ...prev,
      [selectedDate]: editedHabitData
    }));
    setEditModalOpen(false);
  };
  
  // Get heat map data
  const getHeatMapData = () => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const days = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayCopy = new Date(d);
      const dateStr = dayCopy.toLocaleDateString('en-CA');
      const status = getCompletionStatus(dateStr);
      let intensity = 0;
      if (status === 'completed') intensity = 3;
      else if (status === 'partial') intensity = 2;
      else if (status === 'missed') intensity = 1;
      days.push({
        date: dateStr,
        day: dayCopy.getDate(),
        intensity,
        dayOfWeek: dayCopy.getDay()
      });
    }
    
    return days;
  };
  
  // Render calendar
  const renderCalendar = () => {
    if (currentView === 'month') {
      const days = getCalendarDays();
      return (
        <div className="grid grid-cols-7 gap-2 mt-6">
          {/* Day headers */}
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
            <div key={`header-${idx}`} className="text-center text-base font-semibold text-gray-600 mb-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, idx) => {
            if (day.day === null) {
              return <div key={`empty-${idx}`} className="h-16 bg-gray-50 rounded-xl"></div>;
            }
            
            const statusClass = day.isToday 
              ? completionColors.today 
              : completionColors[day.completionStatus];
            
            return (
              <motion.div
                key={`day-${idx}`}
                whileHover={{ y: -2, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.95 }}
                className={`relative h-16 rounded-xl border flex flex-col items-center justify-center cursor-pointer ${statusClass}`}
                onClick={() => handleDayClick(day)}
              >
                <span className="text-lg font-bold">{day.day}</span>
                
                {/* Indicators container */}
                <div className="flex items-center mt-2 space-x-2">
                  {/* Streak indicator */}
                  {day.hasStreak && (
                    <span className="text-base text-red-500">🔥</span>
                  )}
                  
                  {/* AI tip indicator */}
                  {day.hasAiTip && (
                    <span className="text-base text-blue-500">💬</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      );
    }
    
    if (currentView === 'week') {
      const weekDays = getWeekDays();
      return (
        <div className="flex justify-between space-x-2 mt-4 overflow-x-auto py-2">
          {weekDays.map((day, idx) => {
            const statusClass = day.isToday 
              ? completionColors.today 
              : completionColors[day.completionStatus];
            
            return (
              <motion.div
                key={`weekday-${idx}`}
                whileHover={{ y: -2, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 w-16 h-20 rounded-lg border ${statusClass} flex flex-col items-center justify-center cursor-pointer`}
                onClick={() => handleDayClick(day)}
              >
                <span className="text-xs font-medium">{day.weekday}</span>
                <span className="text-lg font-bold mt-1">{day.day}</span>
                
                {/* Indicators */}
                <div className="flex mt-1 space-x-1">
                  {day.hasStreak && (
                    <span className="text-xs text-red-500">🔥</span>
                  )}
                  {day.hasAiTip && (
                    <span className="text-xs text-blue-500">💬</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      );
    }
    
    if (currentView === 'heatmap') {
      const heatMapData = getHeatMapData();
      return (
        <div className="mt-4">
          <h3 className="font-medium text-sm mb-2">Completion Heatmap</h3>
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={`hm-header-${i}`} className="text-center text-xs text-gray-500 mb-1">
                {day}
              </div>
            ))}
            
            {Array(Math.ceil(heatMapData.length / 7)).fill(0).map((_, weekIdx) => {
              const weekStart = weekIdx * 7;
              const weekData = heatMapData.slice(weekStart, weekStart + 7);
              
              return weekData.map((day, dayIdx) => {
                let intensityClass = 'bg-gray-100';
                if (day.intensity === 1) intensityClass = 'bg-red-100';
                if (day.intensity === 2) intensityClass = 'bg-yellow-100';
                if (day.intensity === 3) intensityClass = 'bg-green-200';
                
                return (
                  <motion.div
                    key={`hm-${weekIdx}-${dayIdx}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`aspect-square rounded-md ${intensityClass} flex items-center justify-center cursor-pointer text-xs border border-transparent hover:border-gray-300`}
                    onClick={() => handleDayClick({ date: day.date })}
                  >
                    {day.day}
                  </motion.div>
                );
              });
            })}
          </div>
        </div>
      );
    }
    
    return null;
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
    const aiTip = aiTipsData[selectedDate];
    
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
              onClick={openEditModal}
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
        
        {streakData[selectedDate] && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center space-x-2">
              <span className="text-red-500 text-lg">🔥</span>
              <span className="font-medium">Streak day!</span>
            </div>
            <p className="text-sm mt-1 text-gray-600">Part of your habit streak. Keep it going!</p>
          </div>
        )}
        
        {aiTip && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-2">
              <span className="text-blue-500 text-lg">💬</span>
              <span className="font-medium">AI Coach Note</span>
            </div>
            <p className="text-sm mt-1 text-gray-600">{aiTip}</p>
          </div>
        )}
      </motion.div>
    );
  };
  
  // Render AI suggestions
  const renderAiSuggestions = () => {
    // Most relevant AI tip based on recent trends
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
      >
        <div className="flex items-center space-x-2 mb-2">
          <MessageSquareText className="text-blue-500" size={18} />
          <h3 className="font-semibold">AI Coach Insight</h3>
        </div>
        <p className="text-sm text-gray-600">
          Based on your habits this month, you're most consistent with drinking water. 
          Your meditation practice could use some attention - try setting a specific time each day.
        </p>
      </motion.div>
    );
  };
  
  useEffect(() => {
    if (editModalOpen) {
      document.body.classList.add('celebration-blur');
    } else {
      document.body.classList.remove('celebration-blur');
    }
    return () => document.body.classList.remove('celebration-blur');
  }, [editModalOpen]);
  
  return (
    <div className={`min-h-screen bg-[#F8F3F3] pb-24 relative overflow-y-auto${editModalOpen ? ' celebration-blur' : ''}`}>
      {/* Header - Sticky */}
      <div className="sticky top-0 bg-[#F8F3F3] z-10 pt-7 pb-4 px-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h1 className="font-bold text-2xl tracking-tight">Calendar</h1>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-1 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200 text-base font-semibold"
              onClick={() => setCurrentView(currentView === 'month' ? 'week' : 'month')}
            >
              {currentView === 'month' ? 
                <span>Week</span> : 
                <span>Month</span>
              }
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-1 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200 text-base font-semibold"
              onClick={() => setCurrentView(currentView === 'heatmap' ? 'month' : 'heatmap')}
            >
              <BarChart3 size={18} className="text-gray-600" />
            </motion.button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.96 }}
            className="p-2 rounded-full bg-white shadow-sm"
            onClick={prevMonth}
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </motion.button>
          <h2 className="font-bold text-lg tracking-tight">
            {currentMonth} {currentYear}
          </h2>
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.96 }}
            className="p-2 rounded-full bg-white shadow-sm"
            onClick={nextMonth}
          >
            <ChevronRight size={20} className="text-gray-600" />
          </motion.button>
        </div>
      </div>
      
      {/* Habit filter */}
      <div className="px-4 mt-4 overflow-x-auto flex space-x-2 py-1">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={`px-3 py-1.5 rounded-lg ${habitFilter === 'all' ? 'bg-[#F75836] text-white' : 'bg-white border border-gray-200 text-gray-600'} text-sm font-medium whitespace-nowrap`}
          onClick={() => setHabitFilter('all')}
        >
          All Habits
        </motion.button>
        
        {allHabits.map(habit => (
          <motion.button
            key={`filter-${habit.id}`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${habitFilter === String(habit.id) ? 'bg-[#F75836] text-white' : 'bg-white border border-gray-200 text-gray-600'} text-sm font-medium whitespace-nowrap`}
            onClick={() => setHabitFilter(String(habit.id))}
          >
            <span>{habit.icon}</span>
            <span>{habit.name}</span>
          </motion.button>
        ))}
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
      
      {/* AI Coach Suggestions */}
      <div className="px-4">
        {renderAiSuggestions()}
      </div>
      
      {/* Edit Modal */}
      <AnimatePresence>
        {editModalOpen && selectedDate && (
          <>
            {/* Blurred, darkened background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
            />
            {/* Centered modal */}
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
                  {allHabits.map(habit => (
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
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${editedHabitData[habit.id] ? 'bg-green-500 text-white' : 'bg-white border border-gray-300 text-gray-300'}`}
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
    </div>
  );
};

export default CalendarScreen;