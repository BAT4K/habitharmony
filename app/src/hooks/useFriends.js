import { useState, useEffect } from 'react';
import { apiInstance } from '../services/api';

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
            const response = await apiInstance.get('/friends');
            setFriends(response.data.friends);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to fetch friends');
        } finally {
            setLoading(false);
        }
    };

    // Fetch friend requests
    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await apiInstance.get('/friends/requests');
            setRequests(response.data.requests);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to fetch requests');
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
            const response = await apiInstance.get(`/friends/search?q=${encodeURIComponent(query)}`);
            setSearchResults(response.data.users);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to search users');
        } finally {
            setLoading(false);
        }
    };

    // Send friend request
    const sendRequest = async (toUserId) => {
        try {
            setLoading(true);
            await apiInstance.post('/friends/request', { toUserId });
            await fetchRequests(); // Refresh requests
            return true;
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to send request');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Accept friend request
    const acceptRequest = async (requestId) => {
        try {
            setLoading(true);
            await apiInstance.post('/friends/accept', { requestId });
            await Promise.all([fetchFriends(), fetchRequests()]); // Refresh both lists
            return true;
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to accept request');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Reject friend request
    const rejectRequest = async (requestId) => {
        try {
            setLoading(true);
            await apiInstance.post('/friends/reject', { requestId });
            await fetchRequests(); // Refresh requests
            return true;
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to reject request');
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