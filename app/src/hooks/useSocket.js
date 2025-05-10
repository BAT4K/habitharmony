import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocket = (userId) => {
    const socket = useRef(null);

    useEffect(() => {
        if (!userId) return;

        // Initialize socket connection
        socket.current = io(API_URL, {
            withCredentials: true
        });

        // Join user's room
        socket.current.emit('join', userId);

        // Cleanup on unmount
        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [userId]);

    // Listen for friend requests
    const onFriendRequest = useCallback((callback) => {
        if (!socket.current) return;
        socket.current.on('newFriendRequest', callback);
        return () => socket.current.off('newFriendRequest', callback);
    }, []);

    // Listen for friend request responses
    const onFriendRequestResponse = useCallback((callback) => {
        if (!socket.current) return;
        socket.current.on('friendRequestUpdate', callback);
        return () => socket.current.off('friendRequestUpdate', callback);
    }, []);

    // Listen for new messages
    const onNewMessage = useCallback((callback) => {
        if (!socket.current) return;
        socket.current.on('newMessage', callback);
        return () => socket.current.off('newMessage', callback);
    }, []);

    // Listen for new activities
    const onNewActivity = useCallback((callback) => {
        if (!socket.current) return;
        socket.current.on('newActivity', callback);
        return () => socket.current.off('newActivity', callback);
    }, []);

    // Send friend request
    const sendFriendRequest = useCallback((data) => {
        if (!socket.current) return;
        socket.current.emit('friendRequest', data);
    }, []);

    // Send friend request response
    const sendFriendRequestResponse = useCallback((data) => {
        if (!socket.current) return;
        socket.current.emit('friendRequestResponse', data);
    }, []);

    // Send chat message
    const sendMessage = useCallback((data) => {
        if (!socket.current) return;
        socket.current.emit('sendMessage', data);
    }, []);

    // Send activity update
    const sendActivityUpdate = useCallback((data) => {
        if (!socket.current) return;
        socket.current.emit('activityUpdate', data);
    }, []);

    return {
        onFriendRequest,
        onFriendRequestResponse,
        onNewMessage,
        onNewActivity,
        sendFriendRequest,
        sendFriendRequestResponse,
        sendMessage,
        sendActivityUpdate
    };
}; 