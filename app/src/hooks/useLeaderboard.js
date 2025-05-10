import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
            const response = await fetch(`${API_URL}/leaderboard/global`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch global leaderboard');
            const data = await response.json();
            setGlobalLeaderboard(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch friends leaderboard
    const fetchFriendsLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/leaderboard/friends`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch friends leaderboard');
            const data = await response.json();
            setFriendsLeaderboard(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Update user's stats
    const updateStats = async (stats) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/leaderboard/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(stats)
            });
            if (!response.ok) throw new Error('Failed to update stats');
            const data = await response.json();
            
            // Update both leaderboards
            await Promise.all([
                fetchGlobalLeaderboard(),
                fetchFriendsLeaderboard()
            ]);
            
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's achievements
    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/leaderboard/achievements`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch achievements');
            const data = await response.json();
            setAchievements(data.achievements);
        } catch (err) {
            setError(err.message);
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