import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Plus, Award, X } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import Walk from "../assets/Walk.png";
import Read from "../assets/Read.png";
import Swim from "../assets/Swim.png";

const ActivitySection = () => {
  // Sample initial activities data
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('activityData');
    return saved ? JSON.parse(saved) : [
      { 
        id: 1, 
        image: Walk, 
        activity: "Walk", 
        goal: "10km", 
        current: "2.5km", 
        background: "bg-[#FCDCD3]", 
        streak: 3, 
        completed: false,
        category: "Fitness" 
      },
      { 
        id: 2, 
        image: Swim, 
        activity: "Swim", 
        goal: "10min", 
        current: "5min", 
        background: "bg-[#D7D9FF]", 
        streak: 7, 
        completed: false,
        category: "Fitness" 
      },
      { 
        id: 3, 
        image: Read, 
        activity: "Read", 
        goal: "30min", 
        current: "15min", 
        background: "bg-[#D5ECE0]", 
        streak: 5, 
        completed: false,
        category: "Personal Growth" 
      }
    ];
  });

  // For activity addition modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivity, setNewActivity] = useState({ 
    activity: "", 
    goal: "", 
    background: "bg-[#FCDCD3]",
    category: "Fitness" 
  });
  
  // For tracking celebrations
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratedActivity, setCelebratedActivity] = useState("");
  
  // For scrolling controls
  const scrollContainer = React.useRef(null);

  // Save activities to localStorage
  useEffect(() => {
    localStorage.setItem('activityData', JSON.stringify(activities));
  }, [activities]);

  // Progress calculation helper
  const calculateProgress = (current, goal) => {
    const currentNum = parseFloat(current);
    const goalNum = parseFloat(goal);
    if (isNaN(currentNum) || isNaN(goalNum) || goalNum === 0) return 0;
    return Math.min(100, (currentNum / goalNum) * 100);
  };

  // Scroll left/right handlers
  const scroll = (direction) => {
    if (scrollContainer.current) {
      const scrollAmount = 250; // Approximate width of a card + gap
      const newPosition = scrollContainer.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainer.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  // Add new activity
  const handleAddActivity = () => {
    if (newActivity.activity && newActivity.goal) {
      const id = activities.length ? Math.max(...activities.map(a => a.id)) + 1 : 1;
      
      // Extract numeric value and unit from goal
      const goalValue = newActivity.goal.match(/[0-9.]+/)?.[0] || "0";
      const goalUnit = newActivity.goal.match(/[a-zA-Z]+/)?.[0] || "";
      
      setActivities([...activities, { 
        ...newActivity, 
        id, 
        image: Walk, // Default image
        streak: 0, 
        current: `0${goalUnit}`, 
        completed: false 
      }]);
      setNewActivity({ 
        activity: "", 
        goal: "", 
        background: "bg-[#FCDCD3]",
        category: "Fitness" 
      });
      setShowAddModal(false);
    }
  };

  // Update progress for an activity
  const updateProgress = (id, increment) => {
    setActivities(activities.map(activity => {
      if (activity.id === id) {
        const current = parseFloat(activity.current);
        const goal = parseFloat(activity.goal);
        const unit = activity.goal.replace(/[0-9.]/g, '');
        
        let newCurrent = current + increment;
        // Ensure it doesn't go below 0
        newCurrent = Math.max(0, newCurrent);
        
        // Check if completed and wasn't before
        const wasCompleted = activity.completed;
        const nowCompleted = newCurrent >= goal;
        
        // If newly completed, show celebration
        if (nowCompleted && !wasCompleted) {
          setShowCelebration(true);
          setCelebratedActivity(activity.activity);
          setTimeout(() => setShowCelebration(false), 2000);
        }
        
        return {
          ...activity,
          current: `${newCurrent}${unit}`,
          completed: nowCompleted
        };
      }
      return activity;
    }));
  };

  // Toggle completion
  const toggleCompletion = (id) => {
    setActivities(activities.map(activity => {
      if (activity.id === id) {
        const newCompleted = !activity.completed;
        
        // Update streak
        const streak = newCompleted ? activity.streak + 1 : Math.max(0, activity.streak - 1);
        
        // Show celebration if newly completed
        if (newCompleted && !activity.completed) {
          setShowCelebration(true);
          setCelebratedActivity(activity.activity);
          setTimeout(() => setShowCelebration(false), 2000);
        }
        
        return { 
          ...activity, 
          completed: newCompleted, 
          streak 
        };
      }
      return activity;
    }));
  };

  // Color options for new activities
  const colorOptions = [
    "bg-[#FCDCD3]",
    "bg-[#D7D9FF]",
    "bg-[#D5ECE0]",
    "bg-[#FFE8B2]",
    "bg-[#D0F0FD]",
    "bg-[#FFD6E8]"
  ];

  // Category options
  const categoryOptions = [
    "Fitness",
    "Health",
    "Personal Growth",
    "Productivity",
    "Mindfulness"
  ];

  // Get the color in hex format from bg class
  const getBgColor = (bgClass) => {
    switch(bgClass) {
      case "bg-[#FCDCD3]": return "#FCDCD3";
      case "bg-[#D7D9FF]": return "#D7D9FF";
      case "bg-[#D5ECE0]": return "#D5ECE0";
      case "bg-[#FFE8B2]": return "#FFE8B2";
      case "bg-[#D0F0FD]": return "#D0F0FD";
      case "bg-[#FFD6E8]": return "#FFD6E8";
      default: return "#FCDCD3";
    }
  };

  // Extract darker color from bg for progress bar
  const getDarkerColor = (bgClass) => {
    switch(bgClass) {
      case "bg-[#FCDCD3]": return "#F75836";
      case "bg-[#D7D9FF]": return "#6366F1";
      case "bg-[#D5ECE0]": return "#10B981";
      case "bg-[#FFE8B2]": return "#F59E0B";
      case "bg-[#D0F0FD]": return "#0EA5E9";
      case "bg-[#FFD6E8]": return "#EC4899";
      default: return "#F75836";
    }
  };

  // Individual activity card component
  const ActivityCard = ({ id, image, activity, goal, current, background, streak, completed, category }) => {
    const progress = calculateProgress(current, goal);
    const progressColor = getDarkerColor(background);
    
    return (
      <motion.div 
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={`flex flex-col shadow-sm border border-gray-100 px-4 py-4 w-60 rounded-xl ${background}`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="rounded-full bg-white/50 p-2 mr-2">
              <img src={image} alt={activity} className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-black">{activity}</p>
              <p className="text-black/50 text-xs">{category}</p>
            </div>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleCompletion(id)}
            className={`rounded-full w-7 h-7 flex items-center justify-center transition-colors ${
              completed ? 'bg-green-500 text-white' : 'bg-white/70 text-black/30'
            }`}
          >
            <Check size={16} />
          </motion.button>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-white/50 rounded-full h-2 mb-3">
          <div 
            className="h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%`, backgroundColor: progressColor }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">{current}</span>
            <span className="text-black/50"> / {goal}</span>
          </div>
          <div className="flex items-center">
            <Award size={14} className="text-amber-500 mr-1" />
            <span className="text-xs font-medium">{streak} day streak</span>
          </div>
        </div>
        
        {/* Controls to update progress */}
        <div className="flex justify-between mt-4 gap-2">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => updateProgress(id, -1)}
            className="bg-white/70 hover:bg-white rounded-full w-full h-8 flex items-center justify-center transition shadow-sm"
          >
            <ChevronLeft size={16} />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => updateProgress(id, 1)}
            className="bg-white/70 hover:bg-white rounded-full w-full h-8 flex items-center justify-center transition shadow-sm"
          >
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Add new activity card
  const AddActivityCard = () => (
    <motion.div 
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={() => setShowAddModal(true)}
      className="flex flex-col justify-center items-center shadow-sm border border-gray-100 px-4 py-4 w-48 h-48 rounded-xl bg-white cursor-pointer hover:bg-gray-50 transition-all duration-300"
    >
      <div className="rounded-full bg-[#F75836] p-3 mb-4">
        <Plus size={24} className="text-white" />
      </div>
      <p className="text-black font-semibold">Add New Activity</p>
      <p className="text-black/50 text-xs text-center mt-1">Track a new daily habit</p>
    </motion.div>
  );

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4 px-4">
        <p className="font-bold text-xl">Activities</p>
        <div className="flex gap-2">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll('left')}
            className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition"
          >
            <ChevronLeft size={18} />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll('right')}
            className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition"
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>
      
      <div 
        ref={scrollContainer}
        className="flex overflow-x-auto scrollbar-hide pb-4 pt-2 px-4 gap-4 snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {activities.map((activity) => (
          <div key={activity.id} className="snap-center">
            <ActivityCard {...activity} />
          </div>
        ))}
        <div className="snap-center">
          <AddActivityCard />
        </div>
      </div>

      {/* Add New Activity Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl p-5 w-full max-w-sm shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Add New Activity</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Activity Name</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2.5"
                  value={newActivity.activity}
                  onChange={(e) => setNewActivity({...newActivity, activity: e.target.value})}
                  placeholder="E.g., Meditation"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Daily Goal</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2.5"
                  value={newActivity.goal}
                  onChange={(e) => setNewActivity({...newActivity, goal: e.target.value})}
                  placeholder="E.g., 20min or 5km"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
                  value={newActivity.category}
                  onChange={(e) => setNewActivity({...newActivity, category: e.target.value})}
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Color Theme</label>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map((color) => (
                    <div 
                      key={color}
                      className={`w-8 h-8 rounded-full ${color} cursor-pointer border-2 ${newActivity.background === color ? 'border-blue-500' : 'border-transparent'}`}
                      onClick={() => setNewActivity({...newActivity, background: color})}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2.5 bg-[#F75836] text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
                  onClick={handleAddActivity}
                >
                  Add Activity
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl p-8 text-center shadow-xl"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5 }}
              >
                <Award size={48} className="text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-xl font-bold mb-2">Great job!</h2>
              <p>You completed your {celebratedActivity} activity!</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg font-medium"
                onClick={() => setShowCelebration(false)}
              >
                Continue
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Style for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ActivitySection;