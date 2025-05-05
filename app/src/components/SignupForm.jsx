import React, { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Male from '../assets/Male.png'
import Female from '../assets/Female.png'
import Icon from '../assets/Icon Button.png'
import Icon1 from '../assets/Icon Button (1).png'
import Icon2 from '../assets/Icon Button (2).png'
import Icon3 from '../assets/Icon Button (3).png'
import Icon4 from '../assets/Icon Button (4).png'
import Icon5 from '../assets/Icon Button (5).png'
import Icon6 from '../assets/Icon Button (6).png'
import Icon7 from '../assets/Icon Button (7).png'
import { Eye, EyeOff } from 'lucide-react';
import api from '../services/api';


const SignupForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        birthdate: '',
        email: '',
        password: '',
        gender: '',
        habits: []
    });
    const [errors, setErrors] = useState({});

    const handleNext = async () => {
        if (step === 1) {
            if (!formData.name || !formData.surname || !formData.birthdate) {
                setErrors({
                    name: !formData.name ? 'Name is required' : '',
                    surname: !formData.surname ? 'Surname is required' : '',
                    birthdate: !formData.birthdate ? 'Birthdate is required' : ''
                });
                return;
            }
        } else if (step === 2) {
            // Email and password validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email) || !formData.password) {
                setErrors({
                    email: !emailRegex.test(formData.email) ? 'Please enter a valid email address' : '',
                    password: validatePassword(formData.password)
                });
                return;
            }
        } else if (step === 3) {
            if (!formData.gender) {
                setErrors({ gender: 'Please select a gender' });
                return;
            }
        } else if (step === 4) {
            if (formData.habits.length === 0) {
                setErrors({ habits: 'Please select at least one habit' });
                return;
            }
            try {
                await api.register({
                    name: formData.name,
                    surname: formData.surname,
                    birthdate: formData.birthdate,
                    email: formData.email,
                    password: formData.password,
                    gender: formData.gender,
                    habits: formData.habits
                });
                navigate('/homescreen');
            } catch (error) {
                setErrors({
                    submit: error.response?.data?.message || 'Registration failed'
                });
                return;
            }
        }
        setErrors({});
        setStep(step + 1);
    };

    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[A-Z])/.test(password)) return 'Include at least one uppercase letter';
        if (!/(?=.*[0-9])/.test(password)) return 'Include at least one number';
        if (!/(?=.*[!@#$%^&*])/.test(password)) return 'Include at least one special character';
        return '';
    };

    const handleGenderSelect = (gender) => {
        setFormData({ ...formData, gender });
        setErrors({});
    };

    const handleHabitSelect = (habit) => {
        const updatedHabits = formData.habits.includes(habit)
            ? formData.habits.filter(h => h !== habit)
            : [...formData.habits, habit];
        setFormData({ ...formData, habits: updatedHabits });
        setErrors({});
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
            setErrors({});
        } else {
            navigate(-1); // Go back to previous page if on first step
        }
    };

    if (step === 1) {
        return (
            <div className='flex flex-col'>
                <div className='flex py-4 px-2 items-center gap-18'>
                    <ChevronLeft size='40' onClick={handleBack} className="cursor-pointer"/>
                    <h1 className='text-2xl font-semibold'>Create Account</h1>
                </div>
                <br />
                <div className='flex flex-col gap-8 py-4 px-12 w-screen'>
                    <div>
                        <p className='text-[10px] font-bold'>NAME</p>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className={`py-2 border-b ${errors.name ? 'border-red-500' : 'border-black/50'} focus:border-green-400 outline-none text-sm font-semibold w-full`}
                            placeholder='Name'
                        />
                        {errors.name && <p className='text-red-500 text-xs mt-1'>{errors.name}</p>}
                    </div>
                    <div>
                        <p className='text-[10px] font-bold'>SURNAME</p>
                        <input 
                            type="text"
                            value={formData.surname}
                            onChange={(e) => setFormData({...formData, surname: e.target.value})}
                            className={`py-2 border-b ${errors.surname ? 'border-red-500' : 'border-black/50'} focus:border-green-400 outline-none text-sm font-semibold w-full`}
                            placeholder='Surname'
                        />
                        {errors.surname && <p className='text-red-500 text-xs mt-1'>{errors.surname}</p>}
                    </div>
                    <div>
                        <p className='text-[10px] font-bold'>BIRTHDATE</p>
                        <input 
                            type="date"
                            value={formData.birthdate}
                            onChange={(e) => setFormData({...formData, birthdate: e.target.value})}
                            className={`py-2 border-b ${errors.birthdate ? 'border-red-500' : 'border-black/50'} focus:border-green-400 outline-none text-sm font-semibold w-full`}
                        />
                        {errors.birthdate && <p className='text-red-500 text-xs mt-1'>{errors.birthdate}</p>}
                    </div>
                </div>
                <div className='items-center flex flex-col mt-[110%] gap-2'>
                    <button onClick={handleNext} className='py-4 px-32 bg-[#914938] text-white rounded-4xl font-bold text-xl'>Next</button>
                </div>
            </div>
        )
    }

    if (step === 2) {
        return (
            <div className='flex flex-col'>
                <div className='flex py-4 px-2 items-center gap-18'>
                    <ChevronLeft size='40' onClick={handleBack} className="cursor-pointer"/>
                    <h1 className='text-2xl font-semibold'>Create Account</h1>
                </div>
                <br />
                <div className='flex flex-col gap-8 py-4 px-12 w-screen'>
                    <div>
                        <p className='text-[10px] font-bold'>EMAIL</p>
                        <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className={`py-2 border-b ${errors.email ? 'border-red-500' : 'border-black/50'} focus:border-green-400 outline-none text-sm font-semibold w-full`}
                            placeholder='Email address'
                        />
                        {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
                    </div>
                    <div>
                        <p className='text-[10px] font-bold'>PASSWORD</p>
                        <div className="relative">
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className={`py-2 border-b ${errors.password ? 'border-red-500' : 'border-black/50'} focus:border-green-400 outline-none text-sm font-semibold w-full`}
                                placeholder='Create password'
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password}</p>}
                        <div className="mt-4 text-xs text-gray-500">
                            Password must have:
                            <ul className="list-disc pl-5 mt-1">
                                <li>At least 8 characters</li>
                                <li>One uppercase letter</li>
                                <li>One number</li>
                                <li>One special character (!@#$%^&*)</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className='items-center flex flex-col mt-[60%] gap-2'>
                    <button onClick={handleNext} className='py-4 px-32 bg-[#914938] text-white rounded-4xl font-bold text-xl'>Next</button>
                </div>
            </div>
        );
    }

    if (step === 3) {
        return (
            <div className='flex flex-col'>
                <div className='flex py-4 px-2 items-center gap-18'>
                    <ChevronLeft size='40' onClick={handleBack} className="cursor-pointer"/>
                    <h1 className='text-2xl font-semibold'>Create Account</h1>
                </div>
                <br />
                <div className='py-2 px-6'>
                    <p className='font-bold text-xl'>Choose your gender</p>
                </div>
                <div className='flex justify-between items-center mt-4 py-2 px-8'>
                    <img 
                        src={Male} 
                        alt="Male" 
                        onClick={() => handleGenderSelect('male')}
                        className={`cursor-pointer ${formData.gender === 'male' ? 'border-2 border-[#914938] rounded-lg' : ''}`}
                    />
                    <img 
                        src={Female} 
                        alt="Female" 
                        onClick={() => handleGenderSelect('female')}
                        className={`cursor-pointer ${formData.gender === 'female' ? 'border-2 border-[#914938] rounded-lg' : ''}`}
                    />
                </div>
                {errors.gender && <p className='text-red-500 text-center mt-4'>{errors.gender}</p>}
                <div className='items-center flex flex-col mt-[110%] gap-2'>
                    <button onClick={handleNext} className='py-4 px-32 bg-[#914938] text-white rounded-4xl font-bold text-xl'>Next</button>
                </div>
            </div>
        )
    }

    if (step === 4) {
        return (
            <div className='flex flex-col'>
                <div className='flex py-4 px-2 items-center gap-18'>
                    <ChevronLeft size='40' onClick={handleBack} className="cursor-pointer"/>
                    <h1 className='text-2xl font-semibold'>Create Account</h1>
                </div>
                <br />
                <div className='py-2 px-6'>
                    <p className='font-bold text-xl'>Choose your first habits</p>
                    <p className='text-sm text-black/50'>You may add more habits later</p>
                </div>
                <div className='grid grid-cols-2 py-2 px-8 gap-4'>
                    {[Icon, Icon1, Icon2, Icon3, Icon4, Icon5, Icon6, Icon7].map((icon, index) => (
                        <img 
                            key={index}
                            src={icon} 
                            alt={`Habit ${index + 1}`}
                            onClick={() => handleHabitSelect(`habit${index + 1}`)}
                            className={`cursor-pointer ${formData.habits.includes(`habit${index + 1}`) ? 'border-2 border-[#914938] rounded-lg' : ''}`}
                        />
                    ))}
                </div>
                {errors.habits && <p className='text-red-500 text-center mt-4'>{errors.habits}</p>}
                <div className='items-center flex flex-col mt-[10%] gap-2'>
                    <button onClick={handleNext} className='py-4 px-32 bg-[#914938] text-white rounded-4xl font-bold text-xl'>Next</button>
                </div>
            </div>
        )
    }
};

export default SignupForm