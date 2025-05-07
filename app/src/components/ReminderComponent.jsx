import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

const ReminderComponent = () => {
  const navigate = useNavigate();
  const [showReminder, setShowReminder] = useState(true);
  const [currentReminderIndex, setCurrentReminderIndex] = useState(0);
  
  // Sample reminders with different activities
  const reminders = [
    {
      activity: "cycling",
      message: "Pedal today, power your tomorrow! Add cycling to your schedule now.",
      color: "amber",
      icon: "🚲"
    },
    {
      activity: "meditation",
      message: "Take a moment for mindfulness. Just 5 minutes of meditation daily can reduce stress.",
      color: "blue",
      icon: "🧘"
    },
    {
      activity: "reading",
      message: "Feed your mind! Reading for 15 minutes a day builds knowledge over time.",
      color: "green",
      icon: "📚"
    },
    {
      activity: "hydration",
      message: "Stay hydrated! Track your daily water intake for better health and energy.",
      color: "cyan",
      icon: "💧"
    },
    {
      activity: "walking",
      message: "Steps add up! A daily walk improves mood and boosts your physical health.",
      color: "purple",
      icon: "🚶"
    }
  ];

  // Colors mapping for dynamic styling
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

  // Auto rotate reminders every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (showReminder) {
        nextReminder();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [currentReminderIndex, showReminder]);

  const dismissReminder = () => {
    setShowReminder(false);
    // In a real app, you might want to store this preference
    localStorage.setItem('reminderDismissed', 'true');
  };

  const nextReminder = () => {
    setCurrentReminderIndex((prev) => (prev + 1) % reminders.length);
  };

  const currentReminder = reminders[currentReminderIndex];
  const currentColor = colorVariants[currentReminder.color];

  if (!showReminder) return null;

  return (
    <div className={`mx-4 mt-3 mb-3 ${currentColor.bg} rounded-lg p-3 relative shadow-sm overflow-hidden`}>
      {/* Background pattern for subtle visual interest */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-black -mr-8 -mt-8"></div>
        <div className="absolute left-0 bottom-0 w-16 h-16 rounded-full bg-black -ml-8 -mb-8"></div>
      </div>
      
      {/* Close button */}
      <button 
        onClick={dismissReminder}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
      >
        <X size={16} />
      </button>
      
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
          />
        ))}
      </div>
    </div>
  );
};

export default ReminderComponent;