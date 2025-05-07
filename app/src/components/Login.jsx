import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import React, { useState, useEffect } from 'react';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [staySignedIn, setStaySignedIn] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [checkingToken, setCheckingToken] = useState(true);
    const [isFromLogout, setIsFromLogout] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            console.log("[Login Component] Attempting login with:", formData);
            const response = await api.login(formData);
            console.log("[Login Component] Login successful, response:", response);
            
            // Extract token correctly based on your API response structure
            let token;
            
            // Check if token is directly in response
            if (response.token) {
                token = response.token;
            } 
            // Check if token is in response.data
            else if (response.data && response.data.token) {
                token = response.data.token;
            } 
            // Check if response itself is the token (string)
            else if (typeof response === 'string') {
                token = response;
            }
            // If we still don't have a token, throw an error
            else {
                console.error("[Login Component] Could not find token in response:", response);
                throw new Error("Invalid server response - no token found");
            }

            // Save token based on "stay signed in"
            if (staySignedIn) {
                localStorage.setItem('token', token);
                localStorage.setItem('staySignedIn', 'true');
                console.log("[Login Component] Token saved to localStorage");
            } else {
                sessionStorage.setItem('token', token);
                localStorage.removeItem('staySignedIn');
                console.log("[Login Component] Token saved to sessionStorage");
            }

            navigate('/homescreen');
        } catch (error) {
            console.error("[Login Component] Login failed:", error);
            setError(error.response?.data?.message || error.message || 'Invalid email or password');
        }
    };

    useEffect(() => {
        // Check if this login page was accessed after logout
        if (location.state && location.state.fromLogout) {
            setIsFromLogout(true);
            // Ensure we're not checking tokens if coming from logout
            setCheckingToken(false);
            return;
        }

        // Check both storage locations for tokens
        const localToken = localStorage.getItem('token');
        const sessionToken = sessionStorage.getItem('token');
        
        // Only redirect if we have a valid token
        if (localToken || sessionToken) {
            console.log("[Login Component] Token found, navigating to /homescreen");
            navigate('/homescreen');
        } else {
            console.log("[Login Component] No token found");
            setCheckingToken(false);
        }
    }, [navigate, location]);

    if (checkingToken) {
        console.log("[Login Component] Checking token, rendering null");
        return null; // or a loader/spinner
    }

    const handleBack = () => {
        // Always navigate to the Intro.jsx page
        navigate('/');
    };

    return (
        <div className='flex flex-col'>
            <div className='flex py-4 px-2 items-center gap-18'>
                <ChevronLeft size='40' onClick={handleBack} className="cursor-pointer" />
                <h1 className='text-2xl font-semibold'>Login</h1>
            </div>
            <br />
            <div className='flex flex-col gap-8 py-4 px-12 w-screen'>
                <div>
                    <p className='text-[10px] font-bold'>EMAIL</p>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className='py-2 border-b border-black/50 focus:border-green-400 outline-none text-sm font-semibold w-full'
                        placeholder='Email address'
                    />
                </div>
                <div>
                    <p className='text-[10px] font-bold'>PASSWORD</p>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className='py-2 border-b border-black/50 focus:border-green-400 outline-none text-sm font-semibold w-full'
                            placeholder='Enter password'
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="staySignedIn"
                        checked={staySignedIn}
                        onChange={() => setStaySignedIn(!staySignedIn)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="staySignedIn" className="text-sm font-medium">Stay signed in</label>
                </div>
                {error && (
                    <p className='text-red-500 text-sm text-center'>{error}</p>
                )}
            </div>
            <div className='items-center flex flex-col mt-[60%] gap-2'>
                <button
                    onClick={handleSubmit}
                    className='py-4 px-32 bg-[#914938] text-white rounded-4xl font-bold text-xl'
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default Login;