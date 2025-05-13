import React, { useState, useEffect } from "react";
import { 
  User, Search, UserPlus, Users, Trophy, 
  Check, X, MessageCircle, Zap as ZapIcon, Target,
  Plus, Edit, Moon, Sun, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFriends } from "../hooks/useFriends";
import { useChallenges } from '../hooks/useChallenges';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useChat } from '../hooks/useChat';
import { useActivity } from '../hooks/useActivity';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';
import { ProgressRing } from '../components/ProgressRing';
import { formatDistanceToNow } from 'date-fns';
import maradImg from '../assets/marad.png';
import { useNavigate } from 'react-router-dom';

const tabClasses = (active) =>
  `px-4 py-2 rounded-xl font-semibold transition-colors duration-150 text-base focus:outline-none min-w-[110px] whitespace-nowrap ${
    active
      ? 'bg-[#F75836] text-white shadow'
      : 'bg-white text-gray-700 hover:bg-orange-100 border border-gray-200'
  }`;

const FriendsScreen = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFriendProfile, setShowFriendProfile] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [currentChat, setCurrentChat] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [avatar, setAvatar] = useState(() => localStorage.getItem('habitharmony_avatar') || maradImg);
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('habitharmony_theme') || 'light');
  const isPremium = localStorage.getItem('habitharmony_premium') === 'true';
  const navigate = useNavigate();
  const [userPoints, setUserPoints] = useState(() => parseInt(localStorage.getItem('habitharmony_points') || '0', 10));
  const [userStreak, setUserStreak] = useState(() => parseInt(localStorage.getItem('habitharmony_streak') || '0', 10));

  const {
    friends,
    requests,
    searchResults,
    loading,
    error,
    searchUsers,
    sendRequest,
    acceptRequest,
    rejectRequest,
    fetchRequests,
    fetchFriends
  } = useFriends();

  const {
    challenges,
    loading: challengesLoading,
    error: challengesError,
    createChallenge,
    joinChallenge,
    updateProgress
  } = useChallenges();

  const {
    globalLeaderboard,
    friendsLeaderboard,
    achievements,
    loading: leaderboardLoading,
    error: leaderboardError,
    updateStats
  } = useLeaderboard();

  const {
    chats,
    currentChat: chatCurrentChat,
    loading: chatLoading,
    error: chatError,
    sendMessage,
    markAsRead,
    getChat
  } = useChat(user?.id);

  const {
    activities,
    loading: activityLoading,
    error: activityError,
    fetchActivityFeed
  } = useActivity(user?.id);

  const socket = useSocket(user?.id);

  // Sync userPoints and userStreak with localStorage in real time
  useEffect(() => {
    const syncStats = () => {
      setUserPoints(parseInt(localStorage.getItem('habitharmony_points') || '0', 10));
      setUserStreak(parseInt(localStorage.getItem('habitharmony_streak') || '0', 10));
    };
    window.addEventListener('storage', syncStats);
    syncStats();
    return () => window.removeEventListener('storage', syncStats);
  }, []);

  // Handle search input with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  // Handle friend request notifications
  useEffect(() => {
    if (!user?.id) return;

    const cleanup = socket.onFriendRequest(() => {
      fetchRequests();
    });

    return () => cleanup();
  }, [user?.id, socket, fetchRequests]);

  // Handle friend request responses
  useEffect(() => {
    if (!user?.id) return;

    const cleanup = socket.onFriendRequestResponse(() => {
      fetchFriends();
      fetchRequests();
    });

    return () => cleanup();
  }, [user?.id, socket, fetchFriends, fetchRequests]);

  // Handle new activities
  useEffect(() => {
    if (!user?.id) return;

    const cleanup = socket.onNewActivity(() => {
      fetchActivityFeed();
    });

    return () => cleanup();
  }, [user?.id, socket, fetchActivityFeed]);

  const handleFriendClick = async (friend) => {
    setSelectedFriend(friend);
    setShowFriendProfile(true);
    await getChat(friend._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessage(message);
    setMessage('');
  };

  const handleThemeToggle = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('habitharmony_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  function MenuButton({ icon, label, onClick }) {
    return (
      <button
        className="w-full flex items-center px-4 py-3 rounded-xl transition-all duration-150 active:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-[#F75836] text-base font-medium group"
        onClick={onClick}
        tabIndex={0}
        type="button"
      >
        {icon}
        <span className="flex-1 text-left transition-colors">{label}</span>
      </button>
    );
  }

  const renderFriendProfile = () => {
    if (!selectedFriend) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold">
                {selectedFriend.name} {selectedFriend.surname}
              </h3>
              <p className="text-gray-600">{selectedFriend.email}</p>
            </div>
            <button
              onClick={() => setShowFriendProfile(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Habits</h4>
              <div className="space-y-2">
                {selectedFriend.habits?.map((habit, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{habit}</span>
                    <ProgressRing
                      progress={Math.random() * 100}
                      size={24}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Points</p>
                  <p className="text-xl font-semibold">
                    {selectedFriend.points || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Streak</p>
                  <p className="text-xl font-semibold">
                    {selectedFriend.streak || 0} days
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowChat(true);
                  setShowFriendProfile(false);
                }}
                className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Message
              </button>
              <button
                onClick={() => {
                  // Create challenge logic
                }}
                className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Challenge
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChat = () => {
    if (!currentChat) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              Chat with {currentChat.participants.find(p => p._id !== user?.id)?.name}
            </h3>
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {currentChat.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.sender === user?.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {formatDistanceToNow(new Date(msg.createdAt), {
                      addSuffix: true
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading || challengesLoading || leaderboardLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error || challengesError || leaderboardError) {
      return (
        <div className="text-center text-red-500 p-4">
          {error || challengesError || leaderboardError}
        </div>
      );
    }

    switch (tab) {
      case 'friends':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Your Friends</h2>
            <div className="space-y-3">
              {friends.length === 0 && !loading && (
                <p className="text-gray-500 text-center py-6">No friends yet. Add some!</p>
              )}
              {friends.map((friend, index) => (
                <motion.div
                  key={friend._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center bg-white rounded-xl shadow-sm p-3 space-x-3 hover:bg-blue-50 transition-all duration-200 cursor-pointer border border-gray-100"
                  onClick={() => handleFriendClick(friend)}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-500">
                    {`${friend.name?.[0] || ''}${friend.surname?.[0] || ''}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{friend.name} {friend.surname}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="flex items-center mr-2">
                        <Trophy size={12} className="mr-1 text-orange-500" />
                        {friend.points}
                      </span>
                      <span className="flex items-center">
                        <div className="w-3 h-3 mr-1 rounded-full bg-orange-500" />
                        {friend.streak} days
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center"
                    onClick={e => {
                      e.stopPropagation();
                      handleFriendClick(friend);
                    }}
                  >
                    <span className="sr-only">View Profile</span>
                    <User size={16} />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'challenges':
        return (
          <div className="space-y-4 flex flex-col items-center w-full">
            <div className="flex justify-between items-center mb-1 w-full">
              <h2 className="text-lg font-bold text-gray-800">Active Challenges</h2>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => alert("Create new challenge")}
                className="bg-[#F75836] text-white p-2 rounded-full text-sm font-medium shadow hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-[#F75836] flex items-center justify-center"
                aria-label="Create challenge"
              >
                <Plus size={16} />
              </motion.button>
            </div>
            <div className="space-y-3 w-full flex flex-col items-center">
              {challengesLoading ? (
                <div className="flex items-center justify-center min-h-[80px] text-center py-6 w-full"><span>Loading...</span></div>
              ) : challenges.length === 0 ? (
                <p className="text-gray-400 text-center py-6 w-full">No active challenges. Create one!</p>
              ) : (
                challenges.map((challenge, index) => (
                  <motion.div
                    key={challenge._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-orange-100 w-full max-w-full md:max-w-xl mx-auto flex flex-col items-center"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                        {challenge.icon || '🏆'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base md:text-lg">{challenge.title}</h3>
                        <p className="text-xs md:text-sm text-orange-500 font-medium">{challenge.daysLeft || '--'} days left</p>
                      </div>
                    </div>
                    <div className="space-y-3 w-full">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">
                          {challenge.participants?.find(p => p.user === user?.id)?.progress || 0} / {challenge.goal} {challenge.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${((challenge.participants?.find(p => p.user === user?.id)?.progress || 0) / (challenge.goal || 1)) * 100}%` 
                          }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          className="bg-[#F75836] h-2.5 rounded-full"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                        <Users size={14} />
                        <span>{challenge.participants?.length || 0} participants</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );

      case 'leaderboard':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Global Leaderboard</h2>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-200 w-full max-w-full md:max-w-2xl mx-auto">
              {leaderboardLoading ? (
                <div className="flex items-center justify-center min-h-[80px] text-center py-6"><span>Loading...</span></div>
              ) : globalLeaderboard.length === 0 ? (
                <div className="flex items-center justify-center min-h-[80px] text-center py-6"><span>No leaderboard data.</span></div>
              ) : (
                <div className="flex flex-col w-full">
                  {globalLeaderboard.map((entry, index) => (
                    <motion.div
                      key={entry._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center p-3 md:p-5 w-full max-w-full ${
                        entry.user?._id === user?.id ? 'bg-orange-50' : ''
                      } ${index !== globalLeaderboard.length - 1 ? 'border-b border-orange-100' : ''}`}
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#F75836] flex items-center justify-center text-base md:text-lg font-bold text-white mr-3 md:mr-4">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-base md:text-lg">
                          {entry.user?.name} {entry.user?.surname}
                          {entry.user?._id === user?.id && <span className="text-[#F75836] ml-1">(You)</span>}
                        </p>
                        <div className="flex items-center text-sm md:text-base">
                          <Trophy size={14} className="mr-1 text-orange-500" />
                          <span className="text-gray-700">{entry.points} points</span>
                        </div>
                      </div>
                      <div className="text-right min-w-[60px] md:min-w-[80px]">
                        <div className="flex items-center text-xs md:text-base">
                          <div className="w-3 h-3 md:w-4 md:h-4 mr-1 rounded-full bg-orange-500" />
                          <span className="font-medium text-gray-900">{entry.streak}</span>
                        </div>
                        <p className="text-xs text-gray-600">days streak</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-800 mt-6 mb-1">Friends Leaderboard</h2>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-200 w-full max-w-full md:max-w-2xl mx-auto">
              {leaderboardLoading ? (
                <div className="flex items-center justify-center min-h-[80px] text-center py-6"><span>Loading...</span></div>
              ) : friendsLeaderboard.length === 0 ? (
                <div className="flex items-center justify-center min-h-[80px] text-center py-6"><span>No friends leaderboard data.</span></div>
              ) : (
                <div className="flex flex-col w-full">
                  {friendsLeaderboard.map((entry, index) => (
                    <motion.div
                      key={entry._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className={`flex items-center p-3 md:p-5 w-full max-w-full ${
                        entry.user?._id === user?.id ? 'bg-orange-50' : ''
                      } ${index !== friendsLeaderboard.length - 1 ? 'border-b border-orange-100' : ''}`}
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#F75836] flex items-center justify-center text-base md:text-lg font-bold text-white mr-3 md:mr-4">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-base md:text-lg">
                          {entry.user?.name} {entry.user?.surname}
                          {entry.user?._id === user?.id && <span className="text-[#F75836] ml-1">(You)</span>}
                        </p>
                        <div className="flex items-center text-sm md:text-base">
                          <Trophy size={14} className="mr-1 text-orange-500" />
                          <span className="text-gray-700">{entry.points} points</span>
                        </div>
                      </div>
                      <div className="text-right min-w-[60px] md:min-w-[80px]">
                        <div className="flex items-center text-xs md:text-base">
                          <div className="w-3 h-3 md:w-4 md:h-4 mr-1 rounded-full bg-orange-500" />
                          <span className="font-medium text-gray-900">{entry.streak}</span>
                        </div>
                        <p className="text-xs text-gray-600">days streak</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-800 mt-6 mb-1">Your Achievements</h2>
            <div className="space-y-3">
              {leaderboardLoading ? (
                <div className="flex items-center justify-center min-h-[80px] text-center py-6"><span>Loading...</span></div>
              ) : achievements.length === 0 ? (
                <div className="flex items-center justify-center min-h-[80px] text-center py-6"><span>No achievements yet.</span></div>
              ) : (
                achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className="bg-white rounded-xl p-4 shadow-md border border-orange-100"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#F75836] flex items-center justify-center text-xl text-white">
                        {achievement.icon || '🏆'}
                      </div>
                      <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <p className="text-xs text-gray-500">
                      Unlocked {formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );

      case 'add':
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Add a Friend</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-10 py-3 rounded-xl border border-orange-200 focus:border-[#F75836] focus:outline-none shadow-sm"
              />
            </div>
            {loading && (
              <div className="flex items-center justify-center min-h-[80px] text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-[#F75836]"></div>
              </div>
            )}
            {searchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 shadow-md border border-orange-100"
              >
                <h3 className="font-semibold mb-3 text-gray-800">Search Results</h3>
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between bg-orange-50 rounded-xl p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#F75836] flex items-center justify-center text-lg font-bold text-white">
                          {`${user.name?.[0] || ''}${user.surname?.[0] || ''}`}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name} {user.surname}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      {user.requestSent ? (
                        <div className="text-sm text-gray-500 font-medium px-3 py-1 bg-gray-200 rounded-lg">
                          Requested
                        </div>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => sendRequest(user._id)}
                          className="bg-[#F75836] text-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-[#F75836]"
                        >
                          Add Friend
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen font-display bg-[#F8F3F3] pb-24 relative overflow-y-auto w-full flex justify-center">
      <div className="w-full md:max-w-screen-sm mx-auto pt-6 md:pt-8">
        <div className="flex justify-between items-center mb-6 px-2 md:px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Friends</h1>
          <div className="flex items-center gap-2 md:gap-4 px-1 md:px-0">
            <div className="flex items-center bg-white px-2 py-1 rounded-full border border-gray-200 shadow-sm whitespace-nowrap">
              <span className="text-sm font-medium flex items-center">
                <ZapIcon size={14} className="text-yellow-500 mr-1" />
                {userPoints} pts
                <span className="mx-1.5 text-gray-300">|</span>
                <span className="text-red-500 mr-1">🔥</span>
                {userStreak}d
              </span>
            </div>
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="profile-menu-trigger w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#F75836] cursor-pointer overflow-hidden"
                onClick={() => setShowProfileMenu(v => !v)}
              >
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                {isPremium && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow">Premium</span>
                )}
              </motion.div>
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="profile-menu-dropdown absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-2"
                  >
                    <MenuButton icon={<User size={18} className="mr-2 text-[#F75836]" />} label="View Profile" onClick={() => { setShowProfileMenu(false); navigate('/profile'); }} />
                    <MenuButton icon={<Edit size={18} className="mr-2 text-blue-500" />} label="Edit Profile" onClick={() => { setShowProfileMenu(false); localStorage.setItem('habitharmony_open_edit_profile', '1'); navigate('/profile'); }} />
                    <MenuButton
                      icon={currentTheme === 'dark' ? <Moon size={18} className="mr-2 text-indigo-500" /> : <Sun size={18} className="mr-2 text-yellow-500" />}
                      label={<span className="flex items-center">Theme: {currentTheme === 'dark' ? 'Dark' : 'Light'} {currentTheme === 'dark' ? <span className="ml-1">✔</span> : null}</span>}
                      onClick={() => { handleThemeToggle(); }}
                    />
                    {isPremium ? (
                      <MenuButton icon={<Award size={18} className="mr-2 text-green-600" />} label={<span className="flex items-center">Manage Subscription <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Premium</span></span>} onClick={() => { setShowProfileMenu(false); navigate('/profile?manage-sub=1'); }} />
                    ) : (
                      <MenuButton icon={<Trophy size={18} className="mr-2 text-orange-500" />} label={<span className="font-semibold text-orange-600">Upgrade to Premium</span>} onClick={() => { setShowProfileMenu(false); /* openRazorpay({ plan: 'monthly' }); */ }} />
                    )}
                    <div className="my-2 border-t border-gray-100" />
                    <MenuButton icon={<LogOut size={18} className="mr-2 text-red-500" />} label={<span className="text-red-500 font-semibold">Log Out</span>} onClick={() => { setShowProfileMenu(false); localStorage.clear(); navigate('/login'); }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="flex space-x-2 px-2 pr-2 mb-6 overflow-x-auto scrollbar-hide w-full no-scrollbar">
          <button onClick={() => setTab('friends')} className={tabClasses(tab === 'friends') + ' min-w-[100px] flex-shrink-0'}>Friends</button>
          <button onClick={() => setTab('challenges')} className={tabClasses(tab === 'challenges') + ' min-w-[100px] flex-shrink-0'}>Challenges</button>
          <button onClick={() => setTab('leaderboard')} className={tabClasses(tab === 'leaderboard') + ' min-w-[100px] flex-shrink-0'}>Leaderboard</button>
          <button onClick={() => setTab('add')} className={tabClasses(tab === 'add') + ' min-w-[100px] flex-shrink-0'}>Add Friend</button>
        </div>
        <div className="px-2 md:px-4 w-full">
          <div className="bg-white rounded-2xl shadow p-4 min-h-[400px] w-full overflow-x-hidden border border-orange-100">
            {renderContent()}
          </div>
        </div>
      </div>
      {showFriendProfile && renderFriendProfile()}
      {showChat && renderChat()}
    </div>
  );
};

export default FriendsScreen;