import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { auth } from '../firebase'; // Assuming firebase.js is in src/
import { GoogleAuthProvider, signInWithPopup, signInWithCredential } from 'firebase/auth';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [checkingToken, setCheckingToken] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldFocus, setFieldFocus] = useState({ email: false, password: false });

    // Clear all data when component mounts
    useEffect(() => {
        const clearAllData = () => {
            localStorage.clear();
            sessionStorage.clear();
        };
        clearAllData();
        setCheckingToken(false);
    }, []);

    const handleBack = () => {
        // Clear all data when going back
        localStorage.clear();
        sessionStorage.clear();
        navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        
        try {
            console.log("[Login Component] Attempting login with:", formData);
            const response = await api.login(formData);
            console.log("[Login Component] Login successful, response:", response);
            
            // Extract token and user data
            let token, userData;
            
            if (response.token) {
                token = response.token;
                userData = response.user;
            } else if (response.data) {
                token = response.data.token;
                userData = response.data.user;
            } else {
                throw new Error("Invalid server response - no token found");
            }

            // Clear any existing data
            localStorage.clear();
            sessionStorage.clear();
            
            // Save token and user data
            localStorage.setItem('token', token);
            if (userData) {
                localStorage.setItem('habitharmony_user', JSON.stringify(userData));
                localStorage.setItem('habitharmony_user_name', userData.name || userData.firstName);
                if (userData.points !== undefined) {
                    localStorage.setItem('habitharmony_points', userData.points.toString());
                }
                // Store habits if they exist in user data
                if (userData.habits) {
                    // Map backend habits (strings) to full objects
                    const predefinedHabits = [
                        { id: 'habit1', name: 'Drink Water', icon: '🚰', unit: 'cups', target: 8 },
                        { id: 'habit2', name: 'Exercise', icon: '🏋️', unit: 'min', target: 30 },
                        { id: 'habit3', name: 'Reading', icon: '📚', unit: 'min', target: 30 },
                        { id: 'habit4', name: 'Studying', icon: '📖', unit: 'min', target: 60 },
                        { id: 'habit5', name: 'Cooking', icon: '🍳', unit: 'meals', target: 1 },
                        { id: 'habit6', name: 'Gardening', icon: '🌱', unit: 'min', target: 20 },
                        { id: 'habit7', name: 'Meditation', icon: '🧘', unit: 'min', target: 10 },
                        { id: 'habit8', name: 'Coding', icon: '💻', unit: 'min', target: 45 }
                    ];
                    const userHabits = userData.habits.map(habitNameOrId =>
                        predefinedHabits.find(h => h.id === habitNameOrId || h.name === habitNameOrId)
                    ).filter(Boolean);
                    localStorage.setItem('habitharmony_user_habits', JSON.stringify(userHabits));
                }
            }
            
            // Add success animation before navigating
            setTimeout(() => {
                navigate('/homescreen');
            }, 500);
            
        } catch (error) {
            console.error("[Login Component] Login failed:", error);
            setError(error.response?.data?.message || error.message || 'Invalid email or password');
            setIsSubmitting(false);
        }
    };

    if (checkingToken) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#914938] rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleFocus = (field) => {
        setFieldFocus({ ...fieldFocus, [field]: true });
    };

    const handleBlur = (field) => {
        setFieldFocus({ ...fieldFocus, [field]: false });
    };

    const handleGoogleLogin = async () => {
        try {
            if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
                // Native: Use Capacitor plugin, then sign in to Firebase
                const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
                // Initialize Google Auth
                await GoogleAuth.initialize({
                    clientId: '939583883917-emkkjlmbiu2e6bdii7tt24av0pn8t1ri.apps.googleusercontent.com', // This is your Android client ID
                    scopes: ['profile', 'email'],
                    serverClientId: '939583883917-ptb0pqultsvt15r5080iseg2jjnqunp3.apps.googleusercontent.com', // This is your Web client ID
                    forceCodeForRefreshToken: true
                });
                const result = await GoogleAuth.signIn();
                const idToken = result.authentication.idToken;
                const credential = GoogleAuthProvider.credential(idToken);
                await signInWithCredential(auth, credential);
                // User is now signed in to Firebase, you can redirect or store user info
                navigate('/homescreen');
            } else {
                // Web: Use Firebase popup
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
                // User is now signed in to Firebase, you can redirect or store user info
                navigate('/homescreen');
            }
        } catch (error) {
            console.error('Google Sign-In error:', error);
            setError('Failed to sign in with Google. Please try again.');
        }
    };

    return (
        <div className='flex flex-col min-h-screen bg-white'>
            {/* Header */}
            <div className='flex items-center px-4 py-4 border-b border-gray-100'>
                <button 
                    onClick={handleBack}
                    className='p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200'
                >
                    <ChevronLeft size={28} className="text-gray-800" />
                </button>
                <h1 className='ml-3 text-xl font-bold text-gray-800'>Login</h1>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className='flex flex-col flex-grow px-6 pt-6'>
                <div className='space-y-5 mb-6'>
                    <div className={`transition-all duration-200 ${fieldFocus.email ? 'translate-y-[-4px]' : ''}`}>
                        <p className='text-xs font-semibold text-gray-500 mb-1'>EMAIL</p>
                        <div className={`relative border-b-2 ${fieldFocus.email ? 'border-[#914938]' : 'border-gray-200'} transition-colors duration-200`}>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                onFocus={() => handleFocus('email')}
                                onBlur={() => handleBlur('email')}
                                className='py-2 w-full outline-none text-base text-gray-800 font-medium'
                                placeholder='Email address'
                                required
                            />
                        </div>
                    </div>
                    
                    <div className={`transition-all duration-200 ${fieldFocus.password ? 'translate-y-[-4px]' : ''}`}>
                        <p className='text-xs font-semibold text-gray-500 mb-1'>PASSWORD</p>
                        <div className={`relative border-b-2 ${fieldFocus.password ? 'border-[#914938]' : 'border-gray-200'} transition-colors duration-200`}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                onFocus={() => handleFocus('password')}
                                onBlur={() => handleBlur('password')}
                                className='py-2 w-full outline-none text-base text-gray-800 font-medium pr-10'
                                placeholder='Enter password'
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-[#914938] font-medium self-end mb-8">Forgot password?</p>
                
                {error && (
                    <div className='py-3 px-4 bg-red-50 rounded-lg mb-6'>
                        <p className='text-red-600 text-sm'>{error}</p>
                    </div>
                )}

                <div className='mt-auto mb-8 space-y-4'>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-full font-bold text-lg text-white shadow-md transition-all duration-300 overflow-hidden relative
                            ${isSubmitting ? 'bg-gray-400' : 'bg-[#914938] hover:bg-[#7d3e30] active:scale-[0.98]'}`}
                    >
                        <span className={`inline-block transition-all duration-300 ${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
                            Login
                        </span>
                        {isSubmitting && (
                            <span className="absolute inset-0 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </span>
                        )}
                    </button>
                    
                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full py-3.5 rounded-full border border-gray-300 flex items-center justify-center gap-3 font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20">
                            <path
                                d="M19.8 10.2c0-.63-.06-1.25-.16-1.86H10v3.52h5.52a4.7 4.7 0 01-2.05 3.12v2.6h3.32c1.95-1.8 3.07-4.45 3.07-7.38z"
                                fill="#4285F4"
                            />
                            <path
                                d="M10 20c2.77 0 5.1-.92 6.8-2.48l-3.32-2.6c-.92.62-2.1.98-3.48.98-2.66 0-4.92-1.8-5.72-4.22H.85v2.68A10 10 0 0010 20z"
                                fill="#34A853"
                            />
                            <path
                                d="M4.28 11.68A6 6 0 014 10c0-.58.1-1.15.28-1.68V5.64H.85A10 10 0 000 10c0 1.6.3 3.14.85 4.5l3.43-2.82z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M10 3.98c1.5 0 2.84.52 3.9 1.54l2.95-2.95C15.16.97 12.84 0 10 0A10 10 0 00.85 5.64l3.43 2.68C5.08 5.8 7.34 3.98 10 3.98z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </button>
                    
                    <p className='text-center text-gray-600'>
                        Don't have an account?{' '}
                        <button 
                            type="button"
                            onClick={() => navigate('/signup')}
                            className='text-[#914938] font-medium'
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Login;