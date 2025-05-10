import { useState, useEffect } from 'react';
import { apiInstance } from '../services/api';

export const useLeaderboard = () => {
    const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
    const [friendsLeaderboard, setFriendsLeaderboard] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch global leaderboard
    const fetchGlobalLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await apiInstance.get('/leaderboard/global');
            setGlobalLeaderboard(response.data);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to fetch global leaderboard');
        } finally {
            setLoading(false);
        }
    };

    // Fetch friends leaderboard
    const fetchFriendsLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await apiInstance.get('/leaderboard/friends');
            setFriendsLeaderboard(response.data);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to fetch friends leaderboard');
        } finally {
            setLoading(false);
        }
    };

    // Update user's stats
    const updateStats = async (stats) => {
        try {
            setLoading(true);
            const response = await apiInstance.post('/leaderboard/update', stats);
            await Promise.all([
                fetchGlobalLeaderboard(),
                fetchFriendsLeaderboard()
            ]);
            return response.data;
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to update stats');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's achievements
    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const response = await apiInstance.get('/leaderboard/achievements');
            setAchievements(response.data.achievements);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to fetch achievements');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchGlobalLeaderboard();
        fetchFriendsLeaderboard();
        fetchAchievements();
    }, []);

    return {
        globalLeaderboard,
        friendsLeaderboard,
        achievements,
        loading,
        error,
        fetchGlobalLeaderboard,
        fetchFriendsLeaderboard,
        updateStats,
        fetchAchievements
    };
}; 