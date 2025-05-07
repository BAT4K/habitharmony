import Calendar from "../components/Calendar";
import React, { useState } from "react";
import ActivitySection from "../components/ActivitySection";
import { Search, Bot, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import ReminderComponent from "../components/ReminderComponent";
import HabitSection from "../components/HabitSection";

const HomeScreen = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="min-h-screen font-display bg-[#F8F3F3] pb-24">
      {/* Header with Search and Assistant - sticky to keep visible while scrolling */}
      <div className="sticky top-0 bg-[#F8F3F3] z-10 pt-6 pb-3 px-3 shadow-sm">
        <div className="flex justify-between items-center mb-2 gap-3">
          <motion.div 
            className={`flex-grow border border-black/30 flex bg-white items-center px-3 py-2.5 rounded-xl transition-all ${isSearchFocused ? 'ring-2 ring-[#F75836]/40' : ''}`}
            animate={{ 
              boxShadow: isSearchFocused ? '0 2px 8px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
            }}
            transition={{ duration: 0.2 }}
          >
            <Search size={18} className={`transition-colors ${isSearchFocused ? 'text-[#F75836]' : 'text-gray-500'}`} />
            <input
              type="text"
              className="p-1 bg-white w-full outline-none ring-0 ml-2 text-sm"
              placeholder="Find a hobby"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchTerm && (
              <motion.button 
                onClick={() => setSearchTerm("")} 
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </motion.button>
            )}
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="size-11 bg-white rounded-full flex items-center justify-center border border-black/30 cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
            onClick={() => navigate('/assistant')}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            >
              <Bot size={22} className="text-[#F75836]" />
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      <div className="mt-4 px-3">
        {/* ReminderComponent with proper spacing */}
        <ReminderComponent />
      </div>
      
      {/* Calendar Component */}
      <div className="mt-4">
        <Calendar />
      </div>
      
      {/* For You Section */}
      <div className="flex justify-between p-4 mt-2 items-center">
        <p className="font-bold text-xl">For you</p>
        <a href="/" className="text-[#F75836] text-sm font-medium">
          View all
        </a>
      </div>
      <div className="px-3">
        <ActivitySection />
      </div>
      
      {/* Your Activity Section */}
      <div className="flex justify-between px-4 py-2 mt-4 items-center">
        <p className="font-bold text-xl">Your Activity</p>
        <a href="/" className="text-[#F75836] text-sm font-medium">
          View all
        </a>
      </div>
      <div className="px-3 mb-12">
        <HabitSection />
      </div>
    </div>
  );
};

export default HomeScreen;