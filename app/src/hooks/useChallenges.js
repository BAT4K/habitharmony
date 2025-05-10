import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useChallenges = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all challenges
    const fetchChallenges = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/challenges`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch challenges');
            const data = await response.json();
            setChallenges(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Create a new challenge
    const createChallenge = async (challengeData) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/challenges`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(challengeData)
            });
            if (!response.ok) throw new Error('Failed to create challenge');
            const data = await response.json();
            setChallenges(prev => [...prev, data]);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Join a challenge
    const joinChallenge = async (challengeId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/challenges/${challengeId}/join`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to join challenge');
            const data = await response.json();
            setChallenges(prev => prev.map(c => 
                c._id === challengeId ? data : c
            ));
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Update challenge progress
    const updateProgress = async (challengeId, progress) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/challenges/${challengeId}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ progress })
            });
            if (!response.ok) throw new Error('Failed to update progress');
            const data = await response.json();
            setChallenges(prev => prev.map(c => 
                c._id === challengeId ? data : c
            ));
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Get challenge details
    const getChallengeDetails = async (challengeId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/challenges/${challengeId}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch challenge details');
            const data = await response.json();
            return data;
        } catch (err) {
            setError(err.message);
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