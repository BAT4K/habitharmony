import React, { useState, useEffect } from "react";
import { 
  User, Search, UserPlus, Users, Trophy, 
  Check, X, MessageCircle, Zap as ZapIcon, Target,
  Plus
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

const tabClasses = (active) =>
  `px-4 py-2 rounded-xl font-semibold transition-colors duration-150 text-base focus:outline-none ${
    active
      ? 'bg-blue-500 text-white shadow'
      : 'bg-white text-gray-700 hover:bg-blue-100 border border-gray-200'
  }`;

const FriendsScreen = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFriendProfile, setShowFriendProfile] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");

  const {
    friends,
    requests,
    searchResults,
    loading: friendsLoading,
    error: friendsError,
    fetchFriends,
    fetchRequests,
    searchUsers,
    sendRequest,
    acceptRequest,
    rejectRequest
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
    currentChat,
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
    if (friendsLoading || challengesLoading || leaderboardLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (friendsError || challengesError || leaderboardError) {
      return (
        <div className="text-center text-red-500 p-4">
          {friendsError || challengesError || leaderboardError}
        </div>
      );
    }

    switch (tab) {
      case 'friends':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Your Friends</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {friends.length === 0 && (
                <p className="text-gray-500">No friends yet. Add some!</p>
              )}
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  className="flex items-center bg-white rounded-2xl shadow p-4 space-x-4 hover:bg-blue-50 transition cursor-pointer"
                  onClick={() => handleFriendClick(friend)}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-500">
                    {/* Avatar fallback: initials */}
                    {friend.avatar ? (
                      <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      `${friend.name?.[0] || ''}${friend.surname?.[0] || ''}`
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{friend.name} {friend.surname}</p>
                    <p className="text-sm text-gray-500 truncate">{friend.email}</p>
                  </div>
                  <button
                    className="ml-2 bg-blue-500 text-white rounded-full px-4 py-2 text-sm font-medium shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={e => { e.stopPropagation(); handleFriendClick(friend); }}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'challenges':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Active Challenges</h2>
              <button
                onClick={() => {/* Create challenge logic */}}
                className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
              >
                <Plus size={16} />
                New Challenge
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {challenges.length === 0 ? (
                <p className="text-gray-500">No active challenges. Create one!</p>
              ) : (
                challenges.map((challenge) => (
                  <div
                    key={challenge._id}
                    className="bg-white rounded-2xl p-4 shadow hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                        {challenge.icon || "🎯"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                        <p className="text-sm text-gray-600">{challenge.daysLeft} days left</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-900">
                          {challenge.participants.find(p => p.user === user?.id)?.progress || 0} / {challenge.goal} {challenge.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${((challenge.participants.find(p => p.user === user?.id)?.progress || 0) / challenge.goal) * 100}%`
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={16} />
                        <span>{challenge.participants.length} participants</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'leaderboard':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-800">Global Leaderboard</h2>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              {globalLeaderboard.map((entry, index) => (
                <div
                  key={entry._id}
                  className={`flex items-center p-4 ${
                    index !== globalLeaderboard.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-500 mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {entry.user.name} {entry.user.surname}
                    </p>
                    <p className="text-sm text-gray-600">{entry.points} points</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{entry.streak} days</p>
                    <p className="text-sm text-gray-600">streak</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-lg font-bold text-gray-800 mt-8">Friends Leaderboard</h2>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              {friendsLeaderboard.map((entry, index) => (
                <div
                  key={entry._id}
                  className={`flex items-center p-4 ${
                    index !== friendsLeaderboard.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-500 mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {entry.user.name} {entry.user.surname}
                    </p>
                    <p className="text-sm text-gray-600">{entry.points} points</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{entry.streak} days</p>
                    <p className="text-sm text-gray-600">streak</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-lg font-bold text-gray-800 mt-8">Your Achievements</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.type}
                  className="bg-white rounded-2xl p-4 shadow hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                      {achievement.icon || "🏆"}
                    </div>
                    <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  <p className="text-xs text-gray-500">
                    Unlocked {formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'add':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Add a Friend</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-400 focus:outline-none mb-4 shadow-sm"
            />
            {searchResults.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow">
                <h3 className="font-semibold mb-2 text-gray-800">Search Results</h3>
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between bg-gray-50 rounded-xl p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-500">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            `${user.name?.[0] || ''}${user.surname?.[0] || ''}`
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name} {user.surname}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => sendRequest(user._id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        Add Friend
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen font-display bg-[#F8F3F3] pb-24 relative overflow-y-auto w-full flex justify-center">
      <div className="w-full max-w-screen-sm mx-auto pt-8">
        <div className="flex justify-between items-center mb-6 px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Friends</h1>
        </div>
        <div className="flex space-x-2 px-2 mb-6 overflow-x-auto scrollbar-hide w-full">
          <button onClick={() => setTab('friends')} className={tabClasses(tab === 'friends') + ' min-w-[110px]'}>Friends</button>
          <button onClick={() => setTab('challenges')} className={tabClasses(tab === 'challenges') + ' min-w-[110px]'}>Challenges</button>
          <button onClick={() => setTab('leaderboard')} className={tabClasses(tab === 'leaderboard') + ' min-w-[110px]'}>Leaderboard</button>
          <button onClick={() => setTab('add')} className={tabClasses(tab === 'add') + ' min-w-[110px]'}>Add Friend</button>
        </div>
        <div className="px-2 md:px-4 w-full">
          <div className="bg-white rounded-2xl shadow p-4 min-h-[400px] w-full overflow-x-hidden">
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