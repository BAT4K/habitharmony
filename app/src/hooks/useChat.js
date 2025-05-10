import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
            const response = await fetch(`${API_URL}/chat`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch chats');
            const data = await response.json();
            setChats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Get or create chat with a user
    const getChat = async (otherUserId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/chat/${otherUserId}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch chat');
            const data = await response.json();
            setCurrentChat(data);
            return data;
        } catch (err) {
            setError(err.message);
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
            const response = await fetch(`${API_URL}/chat/${currentChat.participants.find(p => p._id !== userId)._id}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content, attachments })
            });
            if (!response.ok) throw new Error('Failed to send message');
            const data = await response.json();
            setCurrentChat(data);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Mark messages as read
    const markAsRead = async (otherUserId) => {
        try {
            const response = await fetch(`${API_URL}/chat/${otherUserId}/read`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to mark messages as read');
            const data = await response.json();
            setCurrentChat(data);
            await fetchUnreadCount();
        } catch (err) {
            setError(err.message);
        }
    };

    // Fetch unread message count
    const fetchUnreadCount = async () => {
        try {
            const response = await fetch(`${API_URL}/chat/unread/count`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch unread count');
            const data = await response.json();
            setUnreadCount(data.unreadCount);
        } catch (err) {
            setError(err.message);
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