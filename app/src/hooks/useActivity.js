import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useActivity = (userId) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const socket = useSocket(userId);

    // Fetch activity feed
    const fetchActivityFeed = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/activity/feed`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch activity feed');
            const data = await response.json();
            setActivities(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's activities
    const fetchUserActivities = async (targetUserId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/activity/user/${targetUserId}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch user activities');
            const data = await response.json();
            setActivities(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Create a new activity
    const createActivity = async (activityData) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/activity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(activityData)
            });
            if (!response.ok) throw new Error('Failed to create activity');
            const data = await response.json();
            setActivities(prev => [data, ...prev]);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Update activity visibility
    const updateActivityVisibility = async (activityId, visibility) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/activity/${activityId}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ visibility })
            });
            if (!response.ok) throw new Error('Failed to update activity visibility');
            const data = await response.json();
            setActivities(prev => prev.map(a => 
                a._id === activityId ? data : a
            ));
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Delete activity
    const deleteActivity = async (activityId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/activity/${activityId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to delete activity');
            setActivities(prev => prev.filter(a => a._id !== activityId));
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Handle new activities
    const handleNewActivity = useCallback(({ activity }) => {
        setActivities(prev => [activity, ...prev]);
    }, []);

    // Set up socket listeners
    useEffect(() => {
        if (!userId) return;

        const cleanup = socket.onNewActivity(handleNewActivity);
        return () => cleanup();
    }, [userId, handleNewActivity]);

    // Initial fetch
    useEffect(() => {
        if (userId) {
            fetchActivityFeed();
        }
    }, [userId]);

    return {
        activities,
        loading,
        error,
        fetchActivityFeed,
        fetchUserActivities,
        createActivity,
        updateActivityVisibility,
        deleteActivity
    };
}; 