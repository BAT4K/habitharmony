import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import apiInstance from '../services/api';

export const useActivity = (userId) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const socket = useSocket(userId);

    // Fetch activity feed
    const fetchActivityFeed = async () => {
        try {
            setLoading(true);
            const response = await apiInstance.get('/activity/feed');
            setActivities(response.data);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to fetch activity feed');
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's activities
    const fetchUserActivities = async (targetUserId) => {
        try {
            setLoading(true);
            const response = await apiInstance.get(`/activity/user/${targetUserId}`);
            setActivities(response.data);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to fetch user activities');
        } finally {
            setLoading(false);
        }
    };

    // Create a new activity
    const createActivity = async (activityData) => {
        try {
            setLoading(true);
            const response = await apiInstance.post('/activity', activityData);
            setActivities(prev => [response.data, ...prev]);
            return response.data;
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to create activity');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Update activity visibility
    const updateActivityVisibility = async (activityId, visibility) => {
        try {
            setLoading(true);
            const response = await apiInstance.patch(`/activity/${activityId}/visibility`, { visibility });
            setActivities(prev => prev.map(a => a._id === activityId ? response.data : a));
            return response.data;
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to update activity visibility');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Delete activity
    const deleteActivity = async (activityId) => {
        try {
            setLoading(true);
            await apiInstance.delete(`/activity/${activityId}`);
            setActivities(prev => prev.filter(a => a._id !== activityId));
            return true;
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to delete activity');
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