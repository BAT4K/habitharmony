import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useFriends = () => {
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch friends
    const fetchFriends = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/friends`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch friends');
            const data = await response.json();
            setFriends(data.friends);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch friend requests
    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/friends/requests`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch requests');
            const data = await response.json();
            setRequests(data.requests);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Search users
    const searchUsers = async (query) => {
        if (!query) {
            setSearchResults([]);
            return;
        }
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/friends/search?q=${encodeURIComponent(query)}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to search users');
            const data = await response.json();
            setSearchResults(data.users);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Send friend request
    const sendRequest = async (toUserId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/friends/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ toUserId })
            });
            if (!response.ok) throw new Error('Failed to send request');
            await fetchRequests(); // Refresh requests
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Accept friend request
    const acceptRequest = async (requestId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/friends/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ requestId })
            });
            if (!response.ok) throw new Error('Failed to accept request');
            await Promise.all([fetchFriends(), fetchRequests()]); // Refresh both lists
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Reject friend request
    const rejectRequest = async (requestId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/friends/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ requestId })
            });
            if (!response.ok) throw new Error('Failed to reject request');
            await fetchRequests(); // Refresh requests
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchFriends();
        fetchRequests();
    }, []);

    return {
        friends,
        requests,
        searchResults,
        loading,
        error,
        fetchFriends,
        fetchRequests,
        searchUsers,
        sendRequest,
        acceptRequest,
        rejectRequest
    };
}; 