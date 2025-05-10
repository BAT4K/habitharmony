import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { apiInstance } from '../services/api';

export const useChat = (userId) => {
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const socket = useSocket(userId);

    // Fetch all chats
    const fetchChats = async () => {
        try {
            setLoading(true);
            const response = await apiInstance.get('/chat');
            setChats(response.data);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to fetch chats');
        } finally {
            setLoading(false);
        }
    };

    // Get or create chat with a user
    const getChat = async (otherUserId) => {
        try {
            setLoading(true);
            const response = await apiInstance.get(`/chat/${otherUserId}`);
            setCurrentChat(response.data);
            return response.data;
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to fetch chat');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Send a message
    const sendMessage = async (content, attachments = []) => {
        if (!currentChat) return null;

        try {
            setLoading(true);
            const otherUserId = currentChat.participants.find(p => p._id !== userId)._id;
            const response = await apiInstance.post(`/chat/${otherUserId}/message`, { content, attachments });
            setCurrentChat(response.data);
            return response.data;
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to send message');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Mark messages as read
    const markAsRead = async (otherUserId) => {
        try {
            const response = await apiInstance.post(`/chat/${otherUserId}/read`);
            setCurrentChat(response.data);
            await fetchUnreadCount();
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to mark messages as read');
        }
    };

    // Fetch unread message count
    const fetchUnreadCount = async () => {
        try {
            const response = await apiInstance.get('/chat/unread/count');
            setUnreadCount(response.data.unreadCount);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to fetch unread count');
        }
    };

    // Handle new messages
    const handleNewMessage = useCallback(({ chatId, message }) => {
        setChats(prevChats => {
            const updatedChats = prevChats.map(chat => {
                if (chat._id === chatId) {
                    return {
                        ...chat,
                        messages: [...chat.messages, message],
                        lastMessage: new Date()
                    };
                }
                return chat;
            });
            return updatedChats;
        });

        if (currentChat?._id === chatId) {
            setCurrentChat(prev => ({
                ...prev,
                messages: [...prev.messages, message],
                lastMessage: new Date()
            }));
        }

        fetchUnreadCount();
    }, [currentChat]);

    // Set up socket listeners
    useEffect(() => {
        if (!userId) return;

        const cleanup = socket.onNewMessage(handleNewMessage);
        return () => cleanup();
    }, [userId, handleNewMessage]);

    // Initial fetch
    useEffect(() => {
        if (userId) {
            fetchChats();
            fetchUnreadCount();
        }
    }, [userId]);

    return {
        chats,
        currentChat,
        loading,
        error,
        unreadCount,
        fetchChats,
        getChat,
        sendMessage,
        markAsRead,
        fetchUnreadCount
    };
}; 