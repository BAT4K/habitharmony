import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.login(formData);
            navigate('/homescreen');
        } catch (error) {
            setError(error.response?.data?.message || 'Invalid email or password');
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className='flex flex-col'>
            <div className='flex py-4 px-2 items-center gap-18'>
                <ChevronLeft size='40' onClick={handleBack} className="cursor-pointer"/>
                <h1 className='text-2xl font-semibold'>Login</h1>
            </div>
            <br />
            <div className='flex flex-col gap-8 py-4 px-12 w-screen'>
                <div>
                    <p className='text-[10px] font-bold'>EMAIL</p>
                    <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
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