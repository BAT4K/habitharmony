import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, User, Plus } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items with their routes, icons, and labels
  const navItems = [
    {
      path: "/homescreen",
      icon: Home,
      label: "Home"
    },
    {
      path: "/add-habit",
      icon: Plus,
      label: "Add"
    },
    {
      path: "/calendar",
      icon: Calendar,
      label: "Calendar"
    },
    {
      path: "/profile",
      icon: User,
      label: "Profile"
    }
  ];

  // Check if a path is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg rounded-t-3xl overflow-hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isItemActive = isActive(item.path);
          
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center h-full relative"
              style={{ width: `${100 / navItems.length}%` }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Persistent visible background for active state */}
              <div 
                className={`absolute inset-0 ${
                  isItemActive ? "bg-red-700" : "bg-transparent"
                } transition-colors duration-300 ease-in-out`}
              />

              {/* Icon with animation */}
              <motion.div
                animate={{ 
                  y: isItemActive ? -2 : 0,
                  scale: isItemActive ? 1.1 : 1
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="relative z-10"
              >
                <item.icon 
                  size={24} 
                  className={`transition-colors duration-300 ${
                    isItemActive ? "text-white" : "text-gray-600"
                  }`} 
                />
              </motion.div>

              {/* Label */}
              <span 
                className={`text-xs font-semibold mt-1 relative z-10 transition-colors duration-300 ${
                  isItemActive ? "text-white" : "text-gray-600"
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      {/* Bottom Safe Area for iPhone */}
      <div className="h-6 bg-white w-full" />
    </div>
  );
};

export default Navbar;