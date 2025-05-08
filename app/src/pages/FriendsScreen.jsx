import React, { useState, useEffect } from "react";
import { 
  User, Search, UserPlus, Users, Trophy, 
  Check, X, MessageCircle, Zap as ZapIcon, Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock data for the demo
const friendRequests = [
  { id: 1, name: "Taylor", avatar: "/api/placeholder/40/40", sent: false },
  { id: 2, name: "Jordan", avatar: "/api/placeholder/40/40", sent: true }
];

const friendsList = [
  { id: 1, name: "Emma", avatar: "/api/placeholder/40/40", topHabit: "Reading", streak: 12, lastActive: "2h" },
  { id: 2, name: "Mike", avatar: "/api/placeholder/40/40", topHabit: "Walking", streak: 8, lastActive: "5m" },
  { id: 3, name: "Sarah", avatar: "/api/placeholder/40/40", topHabit: "Meditation", streak: 15, lastActive: "1d" },
  { id: 4, name: "John", avatar: "/api/placeholder/40/40", topHabit: "Hydration", streak: 5, lastActive: "3h" },
  { id: 5, name: "Lisa", avatar: "/api/placeholder/40/40", topHabit: "Exercise", streak: 9, lastActive: "7h" }
];

const challengesData = [
  { 
    id: 1, 
    title: "Water Challenge", 
    icon: "🚰", 
    participants: [
      { name: "You", days: 5 },
      { name: "Emma", days: 3 }
    ],
    daysLeft: 4
  },
  { 
    id: 2, 
    title: "Reading Club", 
    icon: "📚", 
    participants: [
      { name: "You", days: 2 },
      { name: "Mike", days: 4 },
      { name: "Sarah", days: 3 }
    ],
    daysLeft: 7
  }
];

const leaderboardData = [
  { id: 1, name: "Sarah", avatar: "/api/placeholder/40/40", points: 2300, rank: 1 },
  { id: 2, name: "You", avatar: "/api/placeholder/40/40", points: 1800, rank: 2 },
  { id: 3, name: "Mike", avatar: "/api/placeholder/40/40", points: 1650, rank: 3 },
  { id: 4, name: "Emma", avatar: "/api/placeholder/40/40", points: 1400, rank: 4 },
  { id: 5, name: "John", avatar: "/api/placeholder/40/40", points: 1200, rank: 5 }
];

const suggestedFriends = [
  { id: 1, name: "Olivia", avatar: "/api/placeholder/40/40", commonHabits: 2 },
  { id: 2, name: "Daniel", avatar: "/api/placeholder/40/40", commonHabits: 1 }
];

const FriendsScreen = () => {
  const [userPoints, setUserPoints] = useState(1420);
  const [userStreak, setUserStreak] = useState(7);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [tab, setTab] = useState("friends"); // "friends", "challenges", "leaderboard", "add"
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingRequests, setPendingRequests] = useState(friendRequests);
  const [friends, setFriends] = useState(friendsList);
  const [challenges, setChallenges] = useState(challengesData);
  const [leaderboard, setLeaderboard] = useState(leaderboardData);
  const [showFriendProfile, setShowFriendProfile] = useState(false);

  // Progress ring component (reused from HomeScreen)
  const ProgressRing = ({ progress, size = 40, strokeWidth = 3, color = "#F75836" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    return (
      <svg height={size} width={size} className="absolute top-0 left-0">
        <circle
          stroke="#E5E7EB"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      </svg>
    );
  };

  // Handle friend request actions
  const handleFriendRequest = (id, accept) => {
    setPendingRequests(pendingRequests.filter(req => req.id !== id));
    if (accept) {
      const newFriend = pendingRequests.find(req => req.id === id);
      if (newFriend && !newFriend.sent) {
        setFriends([...friends, {...newFriend, topHabit: "New User", streak: 0, lastActive: "Just now"}]);
      }
    }
  };

  // Open friend profile modal
  const openFriendProfile = (friend) => {
    setSelectedFriend(friend);
    setShowFriendProfile(true);
  };

  // Search functionality
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen font-display bg-[#F8F3F3] pb-24 relative overflow-y-auto">
      {/* Header - Sticky */}
      <div className="sticky top-0 bg-[#F8F3F3] z-10 pt-6 pb-3 px-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-bold text-lg">Friends</h1>
            <p className="text-gray-500 text-sm mt-1">Connect & Challenge</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white px-2 py-1 rounded-full border border-gray-200 shadow-sm whitespace-nowrap">
              <span className="text-sm font-medium flex items-center">
                <ZapIcon size={14} className="text-yellow-500 mr-1" />
                {userPoints} pts
                <span className="mx-1.5 text-gray-300">|</span>
                <span className="text-red-500 mr-1">🔥</span>
                {userStreak}d
              </span>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative size-10 rounded-full cursor-pointer border-2 border-[#F75836] overflow-hidden"
            >
              <img src="/api/placeholder/40/40" alt="Profile" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="px-4 pt-2">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm"
          />
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex justify-between px-4 mt-4 border-b border-gray-200">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`pb-2 px-1 ${tab === "friends" ? "border-b-2 border-[#F75836] text-[#F75836] font-medium" : "text-gray-500"}`}
          onClick={() => setTab("friends")}
        >
          <Users size={18} className="inline mr-1" /> Friends
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`pb-2 px-1 ${tab === "challenges" ? "border-b-2 border-[#F75836] text-[#F75836] font-medium" : "text-gray-500"}`}
          onClick={() => setTab("challenges")}
        >
          <Target size={18} className="inline mr-1" /> Challenges
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`pb-2 px-1 ${tab === "leaderboard" ? "border-b-2 border-[#F75836] text-[#F75836] font-medium" : "text-gray-500"}`}
          onClick={() => setTab("leaderboard")}
        >
          <Trophy size={18} className="inline mr-1" /> Leaderboard
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`pb-2 px-1 ${tab === "add" ? "border-b-2 border-[#F75836] text-[#F75836] font-medium" : "text-gray-500"}`}
          onClick={() => setTab("add")}
        >
          <UserPlus size={18} className="inline mr-1" /> Add
        </motion.button>
      </div>
      
      {/* Friend Requests Section - Only show if there are any */}
      {pendingRequests.filter(req => !req.sent).length > 0 && (
        <div className="mt-4 px-4">
          <h2 className="font-bold text-md mb-2">Friend Requests</h2>
          {pendingRequests
            .filter(req => !req.sent)
            .map(request => (
              <motion.div
                key={request.id}
                whileHover={{ y: -1, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                className="bg-white rounded-xl p-3 mb-2 border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="relative size-10 rounded-full overflow-hidden">
                    <img src={request.avatar} alt={request.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-medium">{request.name}</span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="rounded-full bg-green-100 text-green-600 size-8 flex items-center justify-center"
                    onClick={() => handleFriendRequest(request.id, true)}
                  >
                    <Check size={16} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="rounded-full bg-red-100 text-red-600 size-8 flex items-center justify-center"
                    onClick={() => handleFriendRequest(request.id, false)}
                  >
                    <X size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
        </div>
      )}
      
      {/* Main Content Area - Based on selected tab */}
      <AnimatePresence mode="wait">
        {/* Friends Tab */}
        {tab === "friends" && (
          <motion.div
            key="friends-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-4 px-4"
          >
            {filteredFriends.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users size={40} className="mx-auto mb-2 text-gray-400" />
                <p>No friends found</p>
                <p className="text-sm text-gray-400 mt-1">Try adding some friends!</p>
              </div>
            ) : (
              filteredFriends.map(friend => (
                <motion.div
                  key={friend.id}
                  whileHover={{ y: -1, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                  whileTap={{ scale: 0.99 }}
                  className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
                  onClick={() => openFriendProfile(friend)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 rounded-full overflow-hidden">
                        <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold">{friend.name}</h3>
                        <p className="text-xs text-gray-500">Active {friend.lastActive} ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-orange-500">
                      <span>🔥 {friend.streak}d</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Top habit: <span className="font-medium">{friend.topHabit}</span>
                    </span>
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-500 hover:text-blue-500"
                      >
                        <MessageCircle size={16} />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-500 hover:text-orange-500"
                      >
                        <ZapIcon size={16} /> 
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-500 hover:text-purple-500"
                      >
                        <Target size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
        
        {/* Challenges Tab */}
        {tab === "challenges" && (
          <motion.div
            key="challenges-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-4 px-4"
          >
            <h2 className="font-bold text-md mb-3">Active Challenges</h2>
            {challenges.map(challenge => (
              <motion.div
                key={challenge.id}
                whileHover={{ y: -1, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                whileTap={{ scale: 0.99 }}
                className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{challenge.icon}</span>
                  <h3 className="font-bold">{challenge.title}</h3>
                  <span className="ml-auto text-sm text-gray-500">{challenge.daysLeft}d left</span>
                </div>
                
                <div className="space-y-2">
                  {challenge.participants.map((participant, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className={`text-sm ${participant.name === "You" ? "font-medium" : ""}`}>
                        {participant.name}
                      </span>
                      <div className="flex items-center">
                        <span className="text-orange-500 text-sm mr-2">🔥 {participant.days}d</span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#F75836] rounded-full"
                            style={{ width: `${(participant.days / 7) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end mt-3 pt-2 border-t border-gray-100">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="text-sm text-[#F75836] font-medium"
                  >
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            ))}
            
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-white border border-[#F75836] text-[#F75836] rounded-xl py-3 font-medium mt-2 flex items-center justify-center"
            >
              <Plus size={18} className="mr-1" /> Create New Challenge
            </motion.button>
          </motion.div>
        )}
        
        {/* Leaderboard Tab */}
        {tab === "leaderboard" && (
          <motion.div
            key="leaderboard-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-4 px-4"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-md">Weekly Leaderboard</h2>
              <span className="text-sm text-gray-500">2 days left</span>
            </div>
            
            {leaderboard.map((user, index) => (
              <motion.div
                key={user.id}
                whileHover={{ y: -1, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                className={`bg-white rounded-xl p-3 mb-2 border ${index < 3 ? 'border-yellow-200' : 'border-gray-100'} flex items-center`}
              >
                <span className={`w-6 text-center font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-amber-700' : 'text-gray-400'}`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                </span>
                
                <div className="relative size-10 rounded-full overflow-hidden mx-3">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  {index < 3 && (
                    <div className="absolute inset-0 border-2 rounded-full border-yellow-300"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <span className={`font-medium ${user.name === "You" ? "text-[#F75836]" : ""}`}>{user.name}</span>
                </div>
                
                <div className="flex items-center">
                  <ZapIcon size={16} className="text-yellow-500 mr-1" />
                  <span className="font-medium">{user.points}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Add Friends Tab */}
        {tab === "add" && (
          <motion.div
            key="add-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-4 px-4"
          >
            <h2 className="font-bold text-md mb-3">Suggested Friends</h2>
            
            {suggestedFriends.map(friend => (
              <motion.div
                key={friend.id}
                whileHover={{ y: -1, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                className="bg-white rounded-xl p-3 mb-2 border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="relative size-10 rounded-full overflow-hidden">
                    <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-medium">{friend.name}</span>
                    <p className="text-xs text-gray-500">{friend.commonHabits} habits in common</p>
                  </div>
                </div>
                
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="rounded-full bg-[#F75836] text-white size-8 flex items-center justify-center"
                >
                  <UserPlus size={16} />
                </motion.button>
              </motion.div>
            ))}
            
            <div className="mt-6">
              <h2 className="font-bold text-md mb-3">Invite Friends</h2>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-white border border-[#F75836] text-[#F75836] rounded-xl py-3 font-medium flex items-center justify-center"
              >
                <UserPlus size={18} className="mr-1" /> Invite via Email
              </motion.button>
              
              <div className="mt-4 bg-white rounded-xl p-4 border border-gray-100 text-center">
                <h3 className="font-medium mb-2">Share Your Invite Link</h3>
                <div className="p-2 bg-gray-100 rounded text-xs text-gray-700 font-mono mb-2">
                  habitharmony.app/invite/user123
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="text-sm text-[#F75836] font-medium"
                >
                  Copy Link
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Friend Profile Modal */}
      <AnimatePresence>
        {showFriendProfile && selectedFriend && (
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
                onClick={() => setShowFriendProfile(false)}
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center mb-4">
                <div className="relative size-16 rounded-full overflow-hidden mb-2">
                  <img src={selectedFriend.avatar} alt={selectedFriend.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-lg">{selectedFriend.name}</h3>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span className="mr-3">🔥 {selectedFriend.streak}d streak</span>
                  <span>⚡ ~{selectedFriend.streak * 200} points</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-3 mb-3">
                <h4 className="font-medium mb-2">Top Habits</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="text-lg mr-2">{selectedFriend.topHabit === "Reading" ? "📚" : selectedFriend.topHabit === "Walking" ? "🚶" : selectedFriend.topHabit === "Meditation" ? "🧘" : "💧"}</span>
                      <span>{selectedFriend.topHabit}</span>
                    </span>
                    <span className="text-orange-500 text-sm">🔥 {selectedFriend.streak}d</span>
                  </div>
                  <div className="flex items-center justify-between opacity-70">
                    <span className="flex items-center">
                      <span className="text-lg mr-2">💪</span>
                      <span>Exercise</span>
                    </span>
                    <span className="text-orange-500 text-sm">🔥 {Math.floor(selectedFriend.streak * 0.7)}d</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-[#F75836] bg-opacity-10 text-[#F75836] rounded-lg py-2 font-medium"
                >
                  <ZapIcon size={16} className="inline mr-1" /> Nudge
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-[#F75836] text-white rounded-lg py-2 font-medium"
                >
                  <Target size={16} className="inline mr-1" /> Challenge
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FriendsScreen;