import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Award, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HabitCard from "./HabitCard";
import bottle from "../assets/bottle.webp";
import trophy from "../assets/Trophy.webp";

const HabitSection = () => {
  // Use localStorage to persist habits
  const [habits, setHabits] = useState(() => {
    const savedHabits = localStorage.getItem('habits');
    return savedHabits ? JSON.parse(savedHabits) : [
      {
        id: 'h1',
        habit: "No cigarettes",
        streak: "5",
        action: "days",
        goal: "21",
        image: trophy,
        color: "#914938",
        category: "Health",
        completed: false
      },
      {
        id: 'h2',
        habit: "Water intake",
        streak: "2",
        action: "glasses",
        goal: "8",
        image: bottle,
        color: "#3B82F6",
        category: "Health",
        completed: false
      },
      {
        id: 'h3',
        habit: "Read daily",
        streak: "3",
        action: "minutes",
        goal: "30",
        image: bottle,
        color: "#10B981",
        category: "Personal Growth",
        completed: false
      }
    ];
  });
  
  // For category filtering
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  
  // For celebration toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // For scrolling
  const scrollContainer = useRef(null);
  
  // Save habits to localStorage
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);
  
  // Get all unique categories
  const categories = ["All", ...new Set(habits.map(habit => habit.category))];
  
  // Handle increment functionality
  const handleIncrement = (id) => {
    setHabits(prevHabits => prevHabits.map(habit => {
      if (habit.id === id) {
        const newStreak = parseInt(habit.streak) + 1;
        const goalReached = newStreak >= parseInt(habit.goal);
        
        // Show toast message if goal reached
        if (goalReached) {
          setToastMessage(`Congratulations! You've reached your goal for ${habit.habit}`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
        
        return { 
          ...habit, 
          streak: newStreak.toString(), 
          completed: goalReached || habit.completed
        };
      }
      return habit;
    }));
  };
  
  // Handle decrement functionality
  const handleDecrement = (id) => {
    setHabits(prevHabits => prevHabits.map(habit => {
      if (habit.id === id) {
        const newStreak = Math.max(0, parseInt(habit.streak) - 1);
        return { 
          ...habit, 
          streak: newStreak.toString(),
          completed: newStreak >= parseInt(habit.goal)
        };
      }
      return habit;
    }));
  };
  
  // Toggle completion status
  const toggleCompletion = (id) => {
    setHabits(prevHabits => prevHabits.map(habit => {
      if (habit.id === id) {
        const wasCompleted = habit.completed;
        
        // If marking as complete and wasn't completed before
        if (!wasCompleted) {
          setToastMessage(`Great job completing ${habit.habit}!`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
        
        return { 
          ...habit, 
          completed: !wasCompleted 
        };
      }
      return habit;
    }));
  };
  
  // Handle scrolling
  const scroll = (direction) => {
    if (scrollContainer.current) {
      const scrollAmount = 250;
      const newPosition = scrollContainer.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainer.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };
  
  // Filter habits based on category
  const filteredHabits = categoryFilter === "All" 
    ? habits 
    : habits.filter(habit => habit.category === categoryFilter);

  return (
    <div className="relative">
      {/* Section header with filter toggle */}
      <div className="flex justify-between items-center mb-4 px-4">
        <p className="font-bold text-xl">Your Habits</p>
        <div className="flex gap-2">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition"
            aria-label="Filter habits"
          >
            <Filter size={16} />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll('left')}
            className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll('right')}
            className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>
      
      {/* Filter chips */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 mb-4 overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map(category => (
                <motion.button
                  key={category}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategoryFilter(category)}
                  className={`py-1 px-3 rounded-full text-sm whitespace-nowrap ${
                    categoryFilter === category 
                      ? 'bg-[#F75836] text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Horizontal scrolling habit cards */}
      <div 
        ref={scrollContainer}
        className="flex overflow-x-auto no-scrollbar pb-4 pt-2 px-4 gap-3 snap-x"
      >
        {filteredHabits.length > 0 ? (
          filteredHabits.map((habit) => (
            <div key={habit.id} className="snap-center">
              <HabitCard
                habit={habit.habit}
                streak={habit.streak}
                action={habit.action}
                goal={habit.goal}
                image={habit.image}
                color={habit.color}
                category={habit.category}
                completed={habit.completed}
                onIncrement={() => handleIncrement(habit.id)}
                onDecrement={() => handleDecrement(habit.id)}
                onComplete={() => toggleCompletion(habit.id)}
              />
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center py-8 text-gray-500">
            No habits found in this category
          </div>
        )}
      </div>
      
      {/* Toast notification - adjusted position for mobile with nav bar */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center z-50 max-w-xs mx-auto"
          >
            <Award className="mr-2 flex-shrink-0" size={18} />
            <span className="text-sm">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Style for hiding scrollbar */}
      <style>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default HabitSection;