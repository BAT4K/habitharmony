import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Calendar = ({ onDateSelect, habitData }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleDates, setVisibleDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState('');
  const [showMonthView, setShowMonthView] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilter, setShowFilter] = useState(false);
  const scrollRef = useRef(null);

  // Sample categories - in a real app, these would be derived from your habits
  const categories = ['All', 'Health', 'Personal Growth', 'Work', 'Relationships'];

  // Generate dates centered around the selected date
  const generateVisibleDates = (date) => {
    const today = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const currentDate = date.getDate();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    
    // Create data for visible dates (showing a week centered around selected date)
    const visibleDays = [];
    
    // Start 3 days before selected date (or from the start of month)
    const startDay = Math.max(1, currentDate - 3);
    // End 3 days after selected date (or at the end of month)
    const endDay = Math.min(lastDayOfMonth, currentDate + 3);
    
    for (let i = startDay; i <= endDay; i++) {
      const dateObj = new Date(year, month, i);
      const isToday = dateObj.toDateString() === today.toDateString();
      const isSelected = i === date.getDate();
      
      // Check if this date has any habit completions
      const hasCompletions = habitData && habitData[dateObj.toISOString().split('T')[0]]?.length > 0;
      
      // Calculate completion percentage
      let completionPercentage = 0;
      if (hasCompletions) {
        const dateCompletions = habitData[dateObj.toISOString().split('T')[0]];
        const completedCount = dateCompletions.filter(h => h.completed).length;
        completionPercentage = completedCount / dateCompletions.length;
      }
      
      visibleDays.push({
        day: dateObj.toLocaleString('en-US', { weekday: 'short' }),
        date: i.toString(),
        fullDate: dateObj,
        isToday,
        isSelected,
        hasCompletions,
        completionPercentage
      });
    }
    
    // Update month display
    setCurrentMonth(date.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
    return visibleDays;
  };

  // Generate a full month calendar for the month view
  const generateMonthCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    // Get first day of month and last day
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get the day of week for the first day (0 = Sunday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Array for week day labels
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    
    // Create array to hold all calendar days
    const calendarDays = [];
    
    // Add empty slots for days before the 1st of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push({
        date: '',
        isCurrentMonth: false
      });
    }
    
    // Add all days in the month
    const today = new Date();
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const dateObj = new Date(year, month, i);
      const isToday = dateObj.toDateString() === today.toDateString();
      const isSelected = i === selectedDate.getDate();
      
      // Check if this date has any habit completions
      const hasCompletions = habitData && habitData[dateObj.toISOString().split('T')[0]]?.length > 0;
      
      calendarDays.push({
        date: i,
        fullDate: dateObj,
        isCurrentMonth: true,
        isToday,
        isSelected,
        hasCompletions
      });
    }
    
    return { weekDays, calendarDays };
  };

  // Update visible dates when selected date changes
  useEffect(() => {
    const dates = generateVisibleDates(selectedDate);
    setVisibleDates(dates);
    
    // Notify parent component if needed
    if (onDateSelect) {
      onDateSelect(selectedDate);
    }
    
    // Scroll to selected date
    setTimeout(() => {
      if (scrollRef.current) {
        const selectedElement = scrollRef.current.querySelector('.selected-date');
        if (selectedElement) {
          const scrollLeft = selectedElement.offsetLeft - scrollRef.current.clientWidth / 2 + selectedElement.clientWidth / 2;
          scrollRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
      }
    }, 100);
  }, [selectedDate, onDateSelect, habitData]);

  // Navigate through dates
  const goToPreviousDay = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(prevDate);
  };

  const goToNextDay = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(nextDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const goToPreviousMonth = () => {
    const prevMonth = new Date(selectedDate);
    prevMonth.setMonth(selectedDate.getMonth() - 1);
    setSelectedDate(prevMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(selectedDate);
    nextMonth.setMonth(selectedDate.getMonth() + 1);
    setSelectedDate(nextMonth);
  };

  // Handle date click
  const handleDateClick = (date) => {
    if (date.fullDate) {
      setSelectedDate(date.fullDate);
      
      // Close month view if open
      if (showMonthView) {
        setShowMonthView(false);
      }
    }
  };

  // Toggle filter visibility
  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowFilter(false);
    // In a real app, you would filter habits by category here
  };

  // Day Card Component with Animation
  const DayCard = ({ day, date, isToday, isSelected, hasCompletions, completionPercentage, onClick }) => {
    // Determine the progress color based on completion percentage
    let progressColor = "#10B981"; // default green
    if (completionPercentage < 0.5) {
      progressColor = "#F59E0B"; // yellow for less than 50%
    } else if (completionPercentage < 0.3) {
      progressColor = "#F75836"; // red for less than 30%
    }
    
    return (
      <motion.div 
        onClick={onClick}
        className={`relative flex flex-col justify-center items-center rounded-xl shadow-sm cursor-pointer p-3 mx-1 w-14 h-20 sm:w-16 sm:h-24 sm:mx-1.5
          ${isSelected ? 'bg-[#F75836] text-white selected-date' : isToday ? 'bg-white border-2 border-[#F75836]' : 'bg-white'}
          hover:shadow-md`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ scale: isSelected ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <p className="font-semibold text-xs">{day}</p>
        <h1 className="text-xl sm:text-2xl font-bold my-1">{date}</h1>
        
        {hasCompletions && !isSelected && (
          <motion.div 
            className="w-2 h-2 rounded-full bg-green-500 mt-1"
            initial={{ scale: 1 }}
            animate={{ scale: 1 }}
          />
        )}
        
        {hasCompletions && (
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
            style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.5)' : progressColor }}
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        )}
      </motion.div>
    );
  };

  // Month Calendar Day Component
  const MonthDay = ({ date, isCurrentMonth, isToday, isSelected, hasCompletions, onClick }) => {
    if (!isCurrentMonth) {
      return <div className="w-8 h-8" />;
    }
    
    return (
      <motion.div 
        onClick={onClick}
        className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer
          ${isSelected ? 'bg-[#F75836] text-white' : isToday ? 'border border-[#F75836]' : ''}
          ${isCurrentMonth ? hasCompletions ? 'font-bold' : '' : 'text-gray-300'}
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {date}
        {hasCompletions && !isSelected && (
          <div className="absolute bottom-0 w-1 h-1 rounded-full bg-green-500" />
        )}
      </motion.div>
    );
  };

  // Get month view data
  const { weekDays, calendarDays } = generateMonthCalendar();

  return (
    <div className="w-full bg-[#F8F3F3] rounded-lg overflow-hidden">
      <div className="px-3 py-4 sm:px-4 sm:py-6">
        {/* Header with Controls */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <motion.button
            className="flex items-center gap-1 sm:gap-2 font-semibold text-sm sm:text-base text-gray-700"
            onClick={() => setShowMonthView(!showMonthView)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CalendarIcon size={16} />
            <span>{showMonthView ? "Week View" : "Month View"}</span>
          </motion.button>
          
          <motion.div className="relative">
            <motion.button
              className="flex items-center gap-1 sm:gap-2 font-semibold text-sm sm:text-base text-gray-700"
              onClick={toggleFilter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter size={16} />
              <span>{selectedCategory}</span>
            </motion.button>
            
            <AnimatePresence>
              {showFilter && (
                <motion.div 
                  className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg z-10 w-40 py-2"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 0 }}
                >
                  {categories.map((category) => (
                    <motion.button
                      key={category}
                      className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-50"
                      onClick={() => handleCategorySelect(category)}
                      whileHover={{ x: 3 }}
                    >
                      {category === selectedCategory && (
                        <CheckCircle size={14} className="mr-2 text-green-500" />
                      )}
                      <span className={category === selectedCategory ? "font-semibold" : ""}>
                        {category}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        
        {/* Month Navigation */}
        <div className="flex justify-between items-center px-1 sm:px-2 mb-4 sm:mb-6">
          <motion.button 
            onClick={showMonthView ? goToPreviousMonth : goToPreviousDay}
            className="p-1 sm:p-2 rounded-full hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
          </motion.button>
          
          <div className="flex flex-col items-center">
            <h2 className="font-bold text-base sm:text-lg">{currentMonth}</h2>
            <motion.button 
              onClick={goToToday}
              className="text-xs text-[#F75836] font-semibold mt-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Today
            </motion.button>
          </div>
          
          <motion.button 
            onClick={showMonthView ? goToNextMonth : goToNextDay}
            className="p-1 sm:p-2 rounded-full hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={16} className="sm:w-5 sm:h-5" />
          </motion.button>
        </div>
        
        {/* Calendar View - Conditionally render Week or Month view */}
        <AnimatePresence mode="wait">
          {showMonthView ? (
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, index) => (
                  <div 
                    key={index} 
                    className="text-center text-xs font-semibold text-gray-500"
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div key={index} className="flex justify-center py-1">
                    {day.isCurrentMonth && (
                      <MonthDay 
                        date={day.date}
                        isCurrentMonth={day.isCurrentMonth}
                        isToday={day.isToday}
                        isSelected={day.isSelected}
                        hasCompletions={day.hasCompletions}
                        onClick={() => handleDateClick(day)}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="mt-3 sm:mt-4 flex justify-center gap-3 sm:gap-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#F75836] mr-1"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full border border-[#F75836] mr-1"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 mr-1"></div>
                  <span>Has Activities</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
              {/* Days scroll container */}
              <div 
                ref={scrollRef} 
                className="flex overflow-x-auto py-2 hide-scrollbar" 
                style={{ scrollBehavior: 'smooth' }}
              >
                <div className="flex px-1 sm:px-2">
                  {visibleDates.map((day, index) => (
                    <DayCard 
                      key={index} 
                      day={day.day} 
                      date={day.date} 
                      isToday={day.isToday}
                      isSelected={day.isSelected}
                      hasCompletions={day.hasCompletions}
                      completionPercentage={day.completionPercentage}
                      onClick={() => handleDateClick(day)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Selected Date Info - Simplified for Mobile */}
              <div className="mt-3 sm:mt-4 flex flex-wrap justify-center">
                <h3 className="text-sm sm:text-base font-semibold text-gray-600 w-full text-center mb-2">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </h3>
                
                {/* Stats for selected date */}
                {habitData && habitData[selectedDate.toISOString().split('T')[0]] && (
                  <div className="flex justify-center gap-3 sm:gap-4">
                    <div className="bg-blue-50 rounded-lg px-2 py-1 sm:px-3 sm:py-1 text-center">
                      <span className="text-xs text-gray-500">Done</span>
                      <p className="font-bold text-blue-600">
                        {habitData[selectedDate.toISOString().split('T')[0]].filter(h => h.completed).length}
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-lg px-2 py-1 sm:px-3 sm:py-1 text-center">
                      <span className="text-xs text-gray-500">Pending</span>
                      <p className="font-bold text-amber-600">
                        {habitData[selectedDate.toISOString().split('T')[0]].filter(h => !h.completed).length}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Add a CSS style to hide scrollbar but keep functionality */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Calendar;