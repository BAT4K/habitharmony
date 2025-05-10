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
          <div className="space-y-4">
            {requests.length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-semibold mb-2">Friend Requests</h3>
                <div className="space-y-2">
                  {requests.map((request) => (
                    <div
                      key={request._id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">
                          {request.fromUser.name} {request.fromUser.surname}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.fromUser.email}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => acceptRequest(request._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectRequest(request._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  className="bg-white rounded-lg p-4 shadow cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleFriendClick(friend)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xl font-semibold">
                        {friend.name[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {friend.name} {friend.surname}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {friend.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Points</p>
                      <p className="font-semibold">
                        {friend.points || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Streak</p>
                      <p className="font-semibold">
                        {friend.streak || 0} days
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'challenges':
        return (
          <div className="space-y-4">
            <button
              onClick={() => {
                // Create challenge logic
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create Challenge
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((challenge) => (
                <div
                  key={challenge._id}
                  className="bg-white rounded-lg p-4 shadow"
                >
                  <h3 className="font-semibold mb-2">{challenge.title}</h3>
                  <p className="text-gray-600 mb-4">{challenge.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {challenge.participants.find(
                          (p) => p.user === user?.id
                        )?.progress || 0}{' '}
                        / {challenge.goal} {challenge.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${
                            ((challenge.participants.find(
                              (p) => p.user === user?.id
                            )?.progress || 0) /
                              challenge.goal) *
                            100
                          }%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'leaderboard':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Global Leaderboard</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {globalLeaderboard.map((entry, index) => (
                  <div
                    key={entry._id}
                    className="flex items-center p-4 border-b last:border-b-0"
                  >
                    <div className="w-8 text-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {entry.user.name} {entry.user.surname}
                      </p>
                      <p className="text-sm text-gray-600">
                        {entry.points} points
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {entry.streak} days
                      </p>
                      <p className="text-sm text-gray-600">streak</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Friends Leaderboard</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {friendsLeaderboard.map((entry, index) => (
                  <div
                    key={entry._id}
                    className="flex items-center p-4 border-b last:border-b-0"
                  >
                    <div className="w-8 text-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {entry.user.name} {entry.user.surname}
                      </p>
                      <p className="text-sm text-gray-600">
                        {entry.points} points
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {entry.streak} days
                      </p>
                      <p className="text-sm text-gray-600">streak</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Your Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.type}
                    className="bg-white rounded-lg p-4 shadow"
                  >
                    <h4 className="font-semibold mb-2">
                      {achievement.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Unlocked{' '}
                      {formatDistanceToNow(
                        new Date(achievement.unlockedAt),
                        { addSuffix: true }
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'add':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-semibold mb-2">Search Results</h3>
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">
                          {user.name} {user.surname}
                        </p>
                        <p className="text-sm text-gray-600">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => sendRequest(user._id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Friends</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTab('friends')}
            className={`px-4 py-2 rounded ${
              tab === 'friends'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Friends
          </button>
          <button
            onClick={() => setTab('challenges')}
            className={`px-4 py-2 rounded ${
              tab === 'challenges'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Challenges
          </button>
          <button
            onClick={() => setTab('leaderboard')}
            className={`px-4 py-2 rounded ${
              tab === 'leaderboard'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setTab('add')}
            className={`px-4 py-2 rounded ${
              tab === 'add'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Add Friend
          </button>
        </div>
      </div>

      {renderContent()}

      {showFriendProfile && renderFriendProfile()}
      {showChat && renderChat()}
    </div>
  );
};

export default FriendsScreen;