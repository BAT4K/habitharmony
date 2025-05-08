import React, { useState, useEffect, useRef } from "react";
import { 
  User, Edit, ChevronRight, AlertCircle, LogOut, Moon, Sun, 
  Bell, Trophy, Zap, ArrowRight, Mail, ChevronDown, ChevronUp, 
  Camera, X, Smile, HelpCircle, Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import maradImg from '../assets/marad.png';
import auratImg from '../assets/aurat.png';
import { UPGRADE_FEATURES, UPGRADE_PRICES, UPGRADE_MESSAGE_LIMIT, getUserName, getRemainingMessages, openRazorpay } from '../utils/upgradeInfo';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(() => getUserName());
  const [avatar, setAvatar] = useState(() => localStorage.getItem('habitharmony_avatar') || maradImg);
  const [userBio, setUserBio] = useState(() => localStorage.getItem('habitharmony_user_bio') || 'Trying to build better habits daily!');
  const [userPoints, setUserPoints] = useState(() => parseInt(localStorage.getItem('habitharmony_points') || '0', 10));
  const [userStreak, setUserStreak] = useState(() => parseInt(localStorage.getItem('habitharmony_streak') || '0', 10));
  const [daysActive, setDaysActive] = useState(() => {
    const history = JSON.parse(localStorage.getItem('habitharmony_calendar_history') || '{}');
    return Object.keys(history).length;
  });
  const [totalHabitsCompleted, setTotalHabitsCompleted] = useState(() => {
    const history = JSON.parse(localStorage.getItem('habitharmony_calendar_history') || '{}');
    return Object.values(history).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
  });
  const [longestStreak, setLongestStreak] = useState(() => {
    // Calculate longest streak from habit data
    try {
      const habits = JSON.parse(localStorage.getItem('habitharmony_user_habits') || '[]');
      return habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    } catch { return 0; }
  });
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('habitharmony_theme') || 'light';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const stored = localStorage.getItem('habitharmony_notifications_enabled');
    return stored !== null ? stored === 'true' : true;
  });
  const [isProfilePublic, setIsProfilePublic] = useState(() => {
    const stored = localStorage.getItem('habitharmony_profile_public');
    return stored !== null ? stored === 'true' : false;
  });
  const [expandedSection, setExpandedSection] = useState(null);
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('habitharmony_premium') === 'true');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState(null);
  
  // Sync all data with localStorage
  useEffect(() => {
    const syncProfile = () => {
      setUserName(getUserName());
      setAvatar(localStorage.getItem('habitharmony_avatar') || maradImg);
      setUserBio(localStorage.getItem('habitharmony_user_bio') || 'Trying to build better habits daily!');
      setUserPoints(parseInt(localStorage.getItem('habitharmony_points') || '0', 10));
      setUserStreak(parseInt(localStorage.getItem('habitharmony_streak') || '0', 10));
      const history = JSON.parse(localStorage.getItem('habitharmony_calendar_history') || '{}');
      setDaysActive(Object.keys(history).length);
      setTotalHabitsCompleted(Object.values(history).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0));
      // Longest streak from habits
      try {
        const habits = JSON.parse(localStorage.getItem('habitharmony_user_habits') || '[]');
        setLongestStreak(habits.reduce((max, h) => Math.max(max, h.streak || 0), 0));
      } catch { setLongestStreak(0); }
      setIsPremium(localStorage.getItem('habitharmony_premium') === 'true');
    };
    window.addEventListener('storage', syncProfile);
    return () => window.removeEventListener('storage', syncProfile);
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme]);

  // BADGES: Data-driven, linked to real user data
  const userBadges = [
    { id: 1, name: "First Habit", icon: "🎉", unlocked: totalHabitsCompleted >= 1 },
    { id: 2, name: "7-Day Streak", icon: "🔥", unlocked: userStreak >= 7 },
    { id: 3, name: "30-Day Streak", icon: "🏆", unlocked: userStreak >= 30 },
    { id: 4, name: "50 Habits Done", icon: "✅", unlocked: totalHabitsCompleted >= 50 },
    { id: 5, name: "Consistency Champ", icon: "📅", unlocked: longestStreak >= 14 },
    { id: 6, name: "Early Bird", icon: "🌅", unlocked: (() => { try { const h = JSON.parse(localStorage.getItem('habitharmony_user_habits')||'[]'); return h.some(hb => hb.name && /morning|wake|early/i.test(hb.name)); } catch { return false; } })() },
    { id: 7, name: "Night Owl", icon: "🌙", unlocked: (() => { try { const h = JSON.parse(localStorage.getItem('habitharmony_user_habits')||'[]'); return h.some(hb => hb.name && /night|sleep|late/i.test(hb.name)); } catch { return false; } })() },
    { id: 8, name: "Hydration Hero", icon: "💧", unlocked: (() => { try { const h = JSON.parse(localStorage.getItem('habitharmony_user_habits')||'[]'); return h.some(hb => hb.name && /water|hydrate|drink/i.test(hb.name)); } catch { return false; } })() },
    { id: 9, name: "Meditation Master", icon: "🧘", unlocked: (() => { try { const h = JSON.parse(localStorage.getItem('habitharmony_user_habits')||'[]'); return h.some(hb => hb.name && /meditat/i.test(hb.name)); } catch { return false; } })() },
    { id: 10, name: "100 Habits Done", icon: "💪", unlocked: totalHabitsCompleted >= 100 },
    { id: 11, name: "Streak Saver", icon: "🛡️", unlocked: userStreak > 0 && longestStreak > 0 },
  ];

  // Save user settings when they change
  useEffect(() => {
    localStorage.setItem('habitharmony_theme', currentTheme);
    localStorage.setItem('habitharmony_notifications_enabled', notificationsEnabled);
    localStorage.setItem('habitharmony_profile_public', isProfilePublic);
  }, [currentTheme, notificationsEnabled, isProfilePublic]);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
  };

  const toggleExpand = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const logOut = () => {
    // Clear all user data
    localStorage.clear();
    // Redirect to login
    navigate('/login');
  };

  // Handle profile update
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    localStorage.setItem('habitharmony_user_name', userName);
    localStorage.setItem('habitharmony_user_bio', userBio);
    localStorage.setItem('habitharmony_avatar', avatar);
    setEditProfileOpen(false);
  };

  // Profile photo upload
  const fileInputRef = useRef();
  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target.result);
        localStorage.setItem('habitharmony_avatar', ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate fetching upgrade info from chatbot assistant
  const fetchUpgradeInfo = async () => {
    // In real app, fetch from backend or chatbot
    return {
      features: [
        'Unlimited AI Coaching',
        'Advanced Analytics',
        'Double Points',
        'Priority Support',
        'Early Access to New Features'
      ],
      priceMonthly: '₹199/mo',
      priceYearly: '₹1499/yr',
      description: 'Unlock your full potential with Habit Harmony Premium!'
    };
  };

  // On mount, fetch upgrade info
  useEffect(() => {
    fetchUpgradeInfo().then(setUpgradeInfo);
  }, []);

  // Open edit profile modal if flag is set (from HomeScreen)
  useEffect(() => {
    if (localStorage.getItem('habitharmony_open_edit_profile') === '1') {
      setEditProfileOpen(true);
      localStorage.removeItem('habitharmony_open_edit_profile');
    }
  }, []);

  // Premium modal component
  const PremiumModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl p-6 w-96 max-w-full shadow-xl relative"
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={() => setShowPremiumModal(false)}
        >
          <X size={20} />
        </button>
        <h3 className="font-bold text-lg mb-2">Upgrade to Premium</h3>
        <p className="mb-4 text-gray-600">Unlock your full potential with Habit Harmony Premium!</p>
        <div className="space-y-3 mb-4">
          {UPGRADE_FEATURES.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-green-600">
              <Award size={20} />
              <span>{f}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-orange-100 text-orange-700 rounded-lg p-2 text-center font-bold">
            ₹{UPGRADE_PRICES.monthly}/mo
          </div>
          <div className="flex-1 bg-indigo-100 text-indigo-700 rounded-lg p-2 text-center font-bold">
            ₹{UPGRADE_PRICES.yearly}/yr
          </div>
        </div>
        <div className="mt-2">
          <button
            onClick={() => openRazorpay({ plan: 'monthly', onSuccess: () => setShowPremiumModal(false) })}
            className="w-full bg-[#F75836] text-white rounded-lg py-2 font-bold mb-2"
          >
            Upgrade Monthly
          </button>
          <button
            onClick={() => openRazorpay({ plan: 'yearly', onSuccess: () => setShowPremiumModal(false) })}
            className="w-full bg-indigo-600 text-white rounded-lg py-2 font-bold"
          >
            Upgrade Yearly
          </button>
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          {`Free users: ${getRemainingMessages()}/${UPGRADE_MESSAGE_LIMIT} AI messages left today`}
        </div>
      </motion.div>
    </motion.div>
  );

  // About Us Modal
  const AboutModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl p-6 w-96 max-w-full shadow-xl relative"
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={() => setShowAboutModal(false)}
        >
          <X size={20} />
        </button>
        <h3 className="font-bold text-lg mb-2">About Us</h3>
        <p className="text-gray-600">Habit Harmony is your AI-powered companion for building better habits. Our mission is to help you achieve your goals with smart coaching, analytics, and a supportive community. Built with ❤️ by passionate developers and behavioral science experts.</p>
      </motion.div>
    </motion.div>
  );

  // Help & Support Modal
  const HelpModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl p-6 w-96 max-w-full shadow-xl relative"
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={() => setShowHelpModal(false)}
        >
          <X size={20} />
        </button>
        <h3 className="font-bold text-lg mb-2">Help & Support</h3>
        <p className="text-gray-600">Need help? Reach out to us at <a href="mailto:support@habitharmony.com" className="text-blue-600 underline">support@habitharmony.com</a> or check our FAQ in the app. We're here to help you succeed!</p>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen font-display bg-[#F8F3F3] pb-24 relative overflow-y-auto">
      {/* Header - Sticky */}
      <div className="sticky top-0 bg-[#F8F3F3] z-10 pt-6 pb-3 px-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-lg">Profile</h1>
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
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="mt-4 px-4">
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative size-20 rounded-full border-2 border-[#F75836] overflow-hidden mr-4 cursor-pointer"
              onClick={handleAvatarClick}
            >
              <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 right-0 bg-[#F75836] rounded-full p-1">
                <Camera size={12} className="text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="absolute inset-0 opacity-0 cursor-pointer"
                style={{ width: '100%', height: '100%' }}
                onChange={handleAvatarFileChange}
              />
            </motion.div>
            
            <div className="flex-1">
              <div className="flex items-center">
                <h2 className="font-bold text-xl">{userName}</h2>
                {isPremium && (
                  <span className="ml-2 inline-flex items-center bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">
                    <Award size={12} className="mr-1" /> Premium
                  </span>
                )}
                {userStreak >= 7 && (
                  <span className="ml-2 inline-flex items-center bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">
                    🔥 {userStreak}-Day Streak
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-1">{userBio}</p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setEditProfileOpen(true)}
                className="mt-2 text-[#F75836] text-sm font-medium flex items-center"
              >
                <Edit size={14} className="mr-1" /> Edit Profile
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="mt-4 px-4">
        <h2 className="font-bold text-lg mb-3">Stats & Achievements</h2>
        <div className="grid grid-cols-2 gap-3">
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center"
          >
            <span className="text-gray-400 text-xs">Total Habits</span>
            <span className="text-2xl font-bold">{totalHabitsCompleted}</span>
            <span className="text-xs text-gray-500">completed</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center"
          >
            <span className="text-gray-400 text-xs">Longest Streak</span>
            <div className="flex items-center">
              <span className="text-red-500 mr-1">🔥</span>
              <span className="text-2xl font-bold">{longestStreak}</span>
            </div>
            <span className="text-xs text-gray-500">days</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center"
          >
            <span className="text-gray-400 text-xs">Current Streak</span>
            <div className="flex items-center">
              <span className="text-red-500 mr-1">🔥</span>
              <span className="text-2xl font-bold">{userStreak}</span>
            </div>
            <span className="text-xs text-gray-500">days</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center"
          >
            <span className="text-gray-400 text-xs">Active For</span>
            <span className="text-2xl font-bold">{daysActive}</span>
            <span className="text-xs text-gray-500">days</span>
          </motion.div>
        </div>
      </div>

      {/* Badges & Achievements */}
      <div className="mt-4 px-4">
        <h2 className="font-bold text-lg mb-3">Badges</h2>
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {userBadges.map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-lg w-20 h-20 ${
                  badge.unlocked ? 'bg-orange-50' : 'bg-gray-100 opacity-50'
                }`}
              >
                <span className="text-2xl mb-1">{badge.icon}</span>
                <span className="text-xs text-center font-medium leading-tight">{badge.name}</span>
                {!badge.unlocked && (
                  <span className="text-[10px] text-gray-500">Locked</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Subscription */}
      <div className="mt-4 px-4">
        <h2 className="font-bold text-lg mb-3">Your Plan</h2>
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center">
                <span className={`rounded-full text-xs font-medium px-2 py-0.5 ${isPremium ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                  {isPremium ? '⭐ Premium' : 'Free Plan'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {isPremium 
                  ? 'Enjoy all premium features!' 
                  : '7 AI messages left today'}
              </p>
            </div>
            {!isPremium && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowPremiumModal(true)}
                className="bg-[#F75836] text-white text-sm font-medium px-3 py-1.5 rounded-lg"
              >
                Upgrade
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Settings Accordion */}
      <div className="mt-4 px-4">
        <h2 className="font-bold text-lg mb-3">Settings</h2>
        
        {/* Notifications */}
        <motion.div 
          whileHover={{ y: -1 }}
          className="bg-white rounded-xl mb-3 border border-gray-100 shadow-sm overflow-hidden"
        >
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleExpand('notifications')}
          >
            <div className="flex items-center">
              <Bell size={18} className="text-gray-600 mr-3" />
              <div>
                <h3 className="font-medium">Notifications</h3>
                <p className="text-xs text-gray-500">Reminders and alerts</p>
              </div>
            </div>
            {expandedSection === 'notifications' ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
          
          <AnimatePresence>
            {expandedSection === 'notifications' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 pb-4"
              >
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm">Enable notifications</span>
                  <div 
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                    onClick={e => { e.stopPropagation(); setNotificationsEnabled(!notificationsEnabled); }}
                  >
                    <motion.div 
                      className="w-4 h-4 bg-white rounded-full shadow"
                      animate={{ x: notificationsEnabled ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                  </div>
                </div>
                
                <div className="mt-2">
                  <label className="text-sm block mb-1">Reminder time</label>
                  <select 
                    className="w-full border rounded-lg p-2 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option>Morning (8:00 AM)</option>
                    <option>Afternoon (2:00 PM)</option>
                    <option>Evening (7:00 PM)</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Appearance */}
        <motion.div 
          whileHover={{ y: -1 }}
          className="bg-white rounded-xl mb-3 border border-gray-100 shadow-sm overflow-hidden"
        >
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleExpand('appearance')}
          >
            <div className="flex items-center">
              {currentTheme === 'light' ? (
                <Sun size={18} className="text-gray-600 mr-3" />
              ) : (
                <Moon size={18} className="text-gray-600 mr-3" />
              )}
              <div>
                <h3 className="font-medium">Appearance</h3>
                <p className="text-xs text-gray-500">Theme and display</p>
              </div>
            </div>
            {expandedSection === 'appearance' ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
          
          <AnimatePresence>
            {expandedSection === 'appearance' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 pb-4"
              >
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm">Dark mode</span>
                  <div 
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${currentTheme === 'dark' ? 'bg-indigo-500' : 'bg-gray-300'}`}
                    onClick={e => { e.stopPropagation(); toggleTheme(); }}
                  >
                    <motion.div 
                      className="w-4 h-4 bg-white rounded-full shadow"
                      animate={{ x: currentTheme === 'dark' ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Privacy */}
        <motion.div 
          whileHover={{ y: -1 }}
          className="bg-white rounded-xl mb-3 border border-gray-100 shadow-sm overflow-hidden"
        >
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => toggleExpand('privacy')}
          >
            <div className="flex items-center">
              <User size={18} className="text-gray-600 mr-3" />
              <div>
                <h3 className="font-medium">Privacy</h3>
                <p className="text-xs text-gray-500">Profile visibility</p>
              </div>
            </div>
            {expandedSection === 'privacy' ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
          
          <AnimatePresence>
            {expandedSection === 'privacy' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 pb-4"
              >
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm">Public profile</span>
                  <div 
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${isProfilePublic ? 'bg-green-500' : 'bg-gray-300'}`}
                    onClick={e => { e.stopPropagation(); setIsProfilePublic(!isProfilePublic); }}
                  >
                    <motion.div 
                      className="w-4 h-4 bg-white rounded-full shadow"
                      animate={{ x: isProfilePublic ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Support & About */}
      <div className="mt-1 px-4">
        <motion.div 
          whileHover={{ y: -1 }}
          className="bg-white rounded-xl mb-3 border border-gray-100 shadow-sm"
        >
          <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setShowHelpModal(true)}>
            <div className="flex items-center">
              <HelpCircle size={18} className="text-gray-600 mr-3" />
              <span className="font-medium">Help & Support</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -1 }}
          className="bg-white rounded-xl mb-3 border border-gray-100 shadow-sm"
        >
          <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setShowAboutModal(true)}>
            <div className="flex items-center">
              <AlertCircle size={18} className="text-gray-600 mr-3" />
              <span className="font-medium">About</span>
            </div>
            <div className="text-xs text-gray-400">v1.0.1</div>
          </div>
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.99 }}
          onClick={logOut}
          className="w-full bg-white rounded-xl mb-3 p-4 border border-gray-100 shadow-sm flex items-center justify-center text-red-500 font-medium"
        >
          <LogOut size={18} className="mr-2" />
          Log Out
        </motion.button>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editProfileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-80 max-w-full shadow-xl relative"
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setEditProfileOpen(false)}
              >
                <X size={20} />
              </button>
              <h3 className="font-bold text-lg mb-4">Edit Profile</h3>
              
              <form onSubmit={handleProfileUpdate}>
                <div className="flex justify-center mb-4">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative size-20 rounded-full border-2 border-[#F75836] overflow-hidden cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 right-0 bg-[#F75836] rounded-full p-1">
                      <Camera size={12} className="text-white" />
                    </div>
                  </motion.div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Your Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 h-20 resize-none"
                    placeholder="Share a short bio or goal"
                  ></textarea>
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 font-bold"
                    onClick={() => setEditProfileOpen(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="flex-1 bg-[#F75836] text-white rounded-lg py-2 font-bold"
                  >
                    Save
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Modal */}
      <AnimatePresence>
        {showPremiumModal && <PremiumModal />}
      </AnimatePresence>

      {/* Modals for About and Help */}
      <AnimatePresence>{showAboutModal && <AboutModal />}</AnimatePresence>
      <AnimatePresence>{showHelpModal && <HelpModal />}</AnimatePresence>
    </div>
  );
};

export default ProfilePage;