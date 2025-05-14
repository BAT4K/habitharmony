import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, User, Bot, Users } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if a path is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg rounded-t-3xl overflow-visible z-50">
      {/* AI Coach Button - Absolutely positioned with inset centering */}
      <div className="absolute top-0 left-0 right-0 transform -translate-y-8 mx-auto w-fit">
        <motion.button
          onClick={() => navigate('/assistant')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center focus:outline-none"
        >
          <motion.div
            animate={{ 
              y: isActive("/assistant") ? -2 : 0,
              scale: isActive("/assistant") ? 1.1 : 1,
              rotate: isActive("/assistant") ? 0 : [0, -10, 10, -10, 0]
            }}
            transition={isActive("/assistant") ? 
              { type: "spring", stiffness: 300, damping: 15 } : 
              { duration: 2, repeat: Infinity, repeatDelay: 5 }}
            className={`rounded-full flex items-center justify-center size-14 bg-white border-2 ${
              isActive("/assistant") ? "border-[#F75836]" : "border-[#F75836]/70"
            } shadow-md`}
          >
            <Bot 
              size={24} 
              className={`${isActive("/assistant") ? "text-[#F75836]" : "text-[#F75836]/70"}`} 
            />
          </motion.div>
          <span 
            className={`text-xs font-medium mt-2 transition-colors duration-300 ${
              isActive("/assistant") ? "text-[#F75836]" : "text-gray-500"
            }`}
          >
            AI Coach
          </span>
        </motion.button>
      </div>

      {/* Navigation bar with three equal sections */}
      <div className="flex h-16 max-w-md mx-auto">
        {/* Left section - Home and Friends */}
        <div className="flex-1 flex justify-around">
          {/* Home */}
          <motion.button
            onClick={() => navigate("/homescreen")}
            className="flex flex-col items-center justify-center focus:outline-none"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ 
                y: isActive("/homescreen") ? -2 : 0,
                scale: isActive("/homescreen") ? 1.1 : 1
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Home 
                size={22} 
                className={`transition-colors duration-300 ${
                  isActive("/homescreen") ? "text-[#F75836]" : "text-gray-500"
                }`} 
              />
            </motion.div>
            <span 
              className={`text-xs font-medium mt-1 transition-colors duration-300 ${
                isActive("/homescreen") ? "text-[#F75836]" : "text-gray-500"
              }`}
            >
              Home
            </span>
          </motion.button>
          
          {/* Friends */}
          <motion.button
            onClick={() => navigate("/friends")}
            className="flex flex-col items-center justify-center focus:outline-none"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ 
                y: isActive("/friends") ? -2 : 0,
                scale: isActive("/friends") ? 1.1 : 1
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Users 
                size={22} 
                className={`transition-colors duration-300 ${
                  isActive("/friends") ? "text-[#F75836]" : "text-gray-500"
                }`} 
              />
            </motion.div>
            <span 
              className={`text-xs font-medium mt-1 transition-colors duration-300 ${
                isActive("/friends") ? "text-[#F75836]" : "text-gray-500"
              }`}
            >
              Friends
            </span>
          </motion.button>
        </div>
        
        {/* Middle section - Empty space for AI Coach */}
        <div className="flex-1 flex justify-center">
          <div className="opacity-0">Placeholder</div>
        </div>
        
        {/* Right section - Calendar and Profile */}
        <div className="flex-1 flex justify-around">
          {/* Calendar */}
          <motion.button
            onClick={() => navigate("/calendar")}
            className="flex flex-col items-center justify-center focus:outline-none"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ 
                y: isActive("/calendar") ? -2 : 0,
                scale: isActive("/calendar") ? 1.1 : 1
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Calendar 
                size={22} 
                className={`transition-colors duration-300 ${
                  isActive("/calendar") ? "text-[#F75836]" : "text-gray-500"
                }`} 
              />
            </motion.div>
            <span 
              className={`text-xs font-medium mt-1 transition-colors duration-300 ${
                isActive("/calendar") ? "text-[#F75836]" : "text-gray-500"
              }`}
            >
              Calendar
            </span>
          </motion.button>
          
          {/* Profile */}
          <motion.button
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center justify-center focus:outline-none"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ 
                y: isActive("/profile") ? -2 : 0,
                scale: isActive("/profile") ? 1.1 : 1
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <User 
                size={22} 
                className={`transition-colors duration-300 ${
                  isActive("/profile") ? "text-[#F75836]" : "text-gray-500"
                }`} 
              />
            </motion.div>
            <span 
              className={`text-xs font-medium mt-1 transition-colors duration-300 ${
                isActive("/profile") ? "text-[#F75836]" : "text-gray-500"
              }`}
            >
              Profile
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;