import { useState, useEffect } from 'react';
import apiInstance from '../services/api';

export const useChallenges = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all challenges
    const fetchChallenges = async () => {
        try {
            setLoading(true);
            const response = await apiInstance.get('/challenges');
            setChallenges(response.data);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to fetch challenges');
        } finally {
            setLoading(false);
        }
    };

    // Create a new challenge
    const createChallenge = async (challengeData) => {
        try {
            setLoading(true);
            const response = await apiInstance.post('/challenges', challengeData);
            setChallenges(prev => [...prev, response.data]);
            return response.data;
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to create challenge');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Join a challenge
    const joinChallenge = async (challengeId) => {
        try {
            setLoading(true);
            const response = await apiInstance.post(`/challenges/${challengeId}/join`);
            setChallenges(prev => prev.map(c => c._id === challengeId ? response.data : c));
            return response.data;
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to join challenge');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Update challenge progress
    const updateProgress = async (challengeId, progress) => {
        try {
            setLoading(true);
            const response = await apiInstance.post(`/challenges/${challengeId}/progress`, { progress });
            setChallenges(prev => prev.map(c => c._id === challengeId ? response.data : c));
            return response.data;
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to update progress');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Get challenge details
    const getChallengeDetails = async (challengeId) => {
        try {
            setLoading(true);
            const response = await apiInstance.get(`/challenges/${challengeId}`);
            return response.data;
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to fetch challenge details');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchChallenges();
    }, []);

    return {
        challenges,
        loading,
        error,
        fetchChallenges,
        createChallenge,
        joinChallenge,
        updateProgress,
        getChallengeDetails
    };
}; 