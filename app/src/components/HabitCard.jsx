import React from "react";
import { Plus, Minus, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const HabitCard = ({ 
  habit, 
  streak, 
  action, 
  goal, 
  image, 
  color, 
  category,
  onIncrement, 
  onDecrement,
  onComplete,
  completed = false
}) => {
  // Calculate progress as a percentage
  const progress = Math.min(100, (parseInt(streak) / parseInt(goal)) * 100);
  
  // Helper for lighter color variant
  const getLighterColor = (hex) => {
    // Simple way to create a lighter version for the background
    return `${hex}20`;
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl p-4 shadow-sm w-[200px] sm:w-[220px] border border-gray-100"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="mr-2">
          <h3 className="font-semibold text-sm sm:text-base truncate">{habit}</h3>
          <p className="text-xs text-gray-500">{category || "Habit"}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onComplete}
          className={`rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-colors flex-shrink-0 ${
            completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
          }`}
          aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
        >
          <CheckCircle size={16} />
        </motion.button>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-2 rounded-full" 
          style={{ backgroundColor: color }}
        ></motion.div>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="font-medium text-sm">{streak}</span>
          <span className="text-gray-500 text-sm"> / {goal} {action}</span>
        </div>
        
        {image && (
          <div 
            className="rounded-full p-2 flex-shrink-0" 
            style={{ backgroundColor: getLighterColor(color) }}
          >
            <img src={image} alt={habit} className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>
      
      {/* Interactive controls */}
      <div className="flex justify-between">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onDecrement}
          disabled={parseInt(streak) <= 0}
          className={`rounded-lg p-2 bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors ${
            parseInt(streak) <= 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Decrease streak"
        >
          <Minus size={14} className="sm:size-16" />
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onIncrement}
          className="rounded-lg p-1 sm:p-2 flex-grow mx-1 sm:mx-2 flex items-center justify-center transition-colors"
          style={{ backgroundColor: getLighterColor(color), color }}
          aria-label={`Track ${action}`}
        >
          <span className="font-medium text-xs sm:text-sm">{action}</span>
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onIncrement}
          className="rounded-lg p-2 bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          aria-label="Increase streak"
        >
          <Plus size={14} className="sm:size-16" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default HabitCard;