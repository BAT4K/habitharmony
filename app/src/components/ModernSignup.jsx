import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import maradImg from '../assets/marad.webp';
import auratImg from '../assets/aurat.webp';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

// Add this after the imports and before the habits array:
const customDatePickerStyles = {
  '.react-datepicker': {
    fontFamily: 'inherit',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  '.react-datepicker__header': {
    backgroundColor: '#F8F3F3',
    borderBottom: 'none',
    borderRadius: '12px 12px 0 0',
  },
  '.react-datepicker__day--selected': {
    backgroundColor: '#914938',
    borderRadius: '50%',
  },
  '.react-datepicker__day:hover': {
    backgroundColor: '#f8f1ef',
    borderRadius: '50%',
  },
  '.react-datepicker__day--keyboard-selected': {
    backgroundColor: '#914938',
    borderRadius: '50%',
  },
  '.react-datepicker__navigation': {
    top: '12px',
  },
  '.react-datepicker__navigation-icon::before': {
    borderColor: '#914938',
  },
  '.react-datepicker__current-month': {
    color: '#914938',
    fontWeight: '600',
  },
  '.react-datepicker__day-name': {
    color: '#666',
  },
};

// Define habits array at the top level so it's accessible everywhere
const habits = [
  { id: 'habit1', name: 'Drink Water', icon: '🚰' },
  { id: 'habit2', name: 'Exercise', icon: '🏋️' },
  { id: 'habit3', name: 'Reading', icon: '📚' },
  { id: 'habit4', name: 'Studying', icon: '📖' },
  { id: 'habit5', name: 'Cooking', icon: '🍳' },
  { id: 'habit6', name: 'Gardening', icon: '🌱' },
  { id: 'habit7', name: 'Meditation', icon: '🧘' },
  { id: 'habit8', name: 'Coding', icon: '💻' }
];

const ModernSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthdate: '',
    email: '',
    password: '',
    gender: '',
    habits: []
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Track which fields are focused for animation
  const [fieldFocus, setFieldFocus] = useState({
    firstName: false,
    lastName: false,
    birthdate: false,
    email: false,
    password: false
  });
  
  // Handle field focus for animation
  const handleFocus = (field) => {
    setFieldFocus({ ...fieldFocus, [field]: true });
  };
  
  // Handle field blur for animation
  const handleBlur = (field) => {
    setFieldFocus({ ...fieldFocus, [field]: false });
  };
  
  // Update form data
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error for this field when typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };
  
  // Validate personal info (step 1)
  const validatePersonalInfo = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.birthdate) {
      newErrors.birthdate = 'Date of birth is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate credentials (step 2)
  const validateCredentials = () => {
    const newErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Include at least one uppercase letter';
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = 'Include at least one number';
    } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = 'Include at least one special character';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate gender (step 3)
  const validateGender = () => {
    if (!formData.gender) {
      setErrors({ gender: 'Please select a gender' });
      return false;
    }
    return true;
  };
  
  // Validate habits (step 4)
  const validateHabits = () => {
    if (formData.habits.length === 0) {
      setErrors({ habits: 'Please select at least one habit' });
      return false;
    }
    return true;
  };
  
  // Handle next step
  const handleNext = () => {
    let isValid = false;
    
    // Validate current step
    switch (step) {
      case 1:
        isValid = validatePersonalInfo();
        break;
      case 2:
        isValid = validateCredentials();
        break;
      case 3:
        isValid = validateGender();
        break;
      case 4:
        isValid = validateHabits();
        if (isValid) {
          // Submit the form
          handleSubmit();
          return;
        }
        break;
      default:
        break;
    }
    
    // Move to next step if valid
    if (isValid) {
      setStep(step + 1);
    }
  };
  
  // Handle back button
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/', { state: { slide: 2 } }); // Navigate to the previous screen
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName?.trim()) {
        errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName?.trim()) {
        errors.lastName = 'Last name is required';
    }
    
    if (!formData.email?.trim()) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
        errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.birthdate) {
        errors.birthdate = 'Date of birth is required';
    }
    
    if (!formData.gender) {
        errors.gender = 'Gender is required';
    }
    
    if (!formData.habits?.length) {
        errors.habits = 'Please select at least one habit';
    }
    
    return errors;
  };
  
  // Handle form submission (final step)
  const handleSubmit = async () => {
    // Validate form first
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }

    setIsSubmitting(true);
    try {
        // Format the data exactly as the server expects
        const signupData = {
            name: formData.firstName.trim(),
            surname: formData.lastName.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            gender: formData.gender,
            birthdate: formData.birthdate,
            habits: formData.habits // Just send the habit IDs as strings
        };

        console.log('Sending signup data:', signupData);

        // Call your backend API
        const response = await axios.post('https://habitharmony.onrender.com/api/auth/register', signupData);

        // Clear any existing data
        localStorage.clear();
        
        // Store the token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('habitharmony_user', JSON.stringify(response.data.user));
        
        // Save selected habits to localStorage with full habit data
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
        const userHabits = response.data.user.habits.map(habitNameOrId =>
            predefinedHabits.find(h => h.id === habitNameOrId || h.name === habitNameOrId)
        ).filter(Boolean);
        localStorage.setItem('habitharmony_user_habits', JSON.stringify(userHabits));
        
        // Set initial user data
        localStorage.setItem('habitharmony_user_name', formData.firstName);
        localStorage.setItem('habitharmony_points', response.data.user.points.toString());
        localStorage.setItem('habitharmony_streak', '0');
        localStorage.setItem('habitharmony_points_today', JSON.stringify({ date: '', points: 0 }));
        localStorage.setItem('habitharmony_last_streak_date', '');
        localStorage.setItem('habitharmony_calendar_history', '{}');
        localStorage.setItem('habitharmony_habitPoints', '{}');
        
        // Navigate to homescreen
        navigate('/homescreen');
    } catch (error) {
        console.error('Registration error:', error);
        console.error('Error details:', error.response?.data);
        alert(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  // Gender selection handler
  const handleGenderSelect = (gender) => {
    setFormData({ ...formData, gender });
    if (errors.gender) {
      setErrors({ ...errors, gender: '' });
    }
    // Save avatar to localStorage
    const avatar = gender === 'male' ? maradImg : auratImg;
    localStorage.setItem('habitharmony_avatar', avatar);
  };
  
  // Habit selection handler
  const handleHabitSelect = (habit) => {
    const updatedHabits = formData.habits.includes(habit)
      ? formData.habits.filter(h => h !== habit)
      : [...formData.habits, habit];
      
    setFormData({ ...formData, habits: updatedHabits });
    if (errors.habits) {
      setErrors({ ...errors, habits: '' });
    }
  };
  
  // Google sign up handler
  const handleGoogleSignup = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Initialize Google Auth
        await GoogleAuth.initialize({
          clientId: 'YOUR_WEB_CLIENT_ID', // Replace with your web client ID from Google Cloud Console
          scopes: ['profile', 'email'],
          serverClientId: 'YOUR_SERVER_CLIENT_ID', // Replace with your server client ID if you have one
        });

        // Sign in with Google
        const user = await GoogleAuth.signIn();
        console.log('Google Sign-In successful:', user);

        // Format the data for your backend
        const signupData = {
          name: user.givenName,
          surname: user.familyName,
          email: user.email,
          password: '', // You might want to generate a random password or handle this differently
          gender: '', // You'll need to get this from the user later
          birthdate: '', // You'll need to get this from the user later
          habits: [] // You'll need to get this from the user later
        };

        // Call your backend API
        const response = await axios.post('https://habitharmony.onrender.com/api/auth/google', signupData);

        // Store the token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('habitharmony_user', JSON.stringify(response.data.user));
        
        // Navigate to homescreen
        navigate('/homescreen');
      } else {
        // Handle web platform differently if needed
        console.log('Google Sign-In not available on web platform');
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      alert('Failed to sign in with Google. Please try again.');
    }
  };
  
  // Render step 1: Personal Info
  const renderPersonalInfo = () => (
    <div className='flex flex-col flex-grow px-6 pt-6'>
      <div className='space-y-5 mb-6'>
        {/* First Name Field */}
        <div className={`transition-all duration-200 ${fieldFocus.firstName ? 'translate-y-[-4px]' : ''}`}>
          <p className='text-xs font-semibold text-gray-500 mb-1'>FIRST NAME</p>
          <div className={`relative border-b-2 ${errors.firstName ? 'border-red-500' : fieldFocus.firstName ? 'border-[#914938]' : 'border-gray-200'} transition-colors duration-200`}>
            <input 
              type="text" 
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              onFocus={() => handleFocus('firstName')}
              onBlur={() => handleBlur('firstName')}
              className='py-2 w-full outline-none text-base text-gray-800 font-medium'
              placeholder='Enter your first name'
            />
          </div>
          {errors.firstName && (
            <p className='text-red-500 text-xs mt-1 ml-1 transition-opacity duration-200'>{errors.firstName}</p>
          )}
        </div>
        
        {/* Last Name Field */}
        <div className={`transition-all duration-200 ${fieldFocus.lastName ? 'translate-y-[-4px]' : ''}`}>
          <p className='text-xs font-semibold text-gray-500 mb-1'>LAST NAME</p>
          <div className={`relative border-b-2 ${errors.lastName ? 'border-red-500' : fieldFocus.lastName ? 'border-[#914938]' : 'border-gray-200'} transition-colors duration-200`}>
            <input 
              type="text" 
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              onFocus={() => handleFocus('lastName')}
              onBlur={() => handleBlur('lastName')}
              className='py-2 w-full outline-none text-base text-gray-800 font-medium'
              placeholder='Enter your last name'
            />
          </div>
          {errors.lastName && (
            <p className='text-red-500 text-xs mt-1 ml-1 transition-opacity duration-200'>{errors.lastName}</p>
          )}
        </div>
        
        {/* Date of Birth Field */}
        <div className={`transition-all duration-200 relative z-10 ${fieldFocus.birthdate ? 'translate-y-[-4px]' : ''}`}>
          <p className='text-xs font-semibold text-gray-500 mb-1'>DATE OF BIRTH</p>
          <div className={`relative border-b-2 ${errors.birthdate ? 'border-red-500' : fieldFocus.birthdate ? 'border-[#914938]' : 'border-gray-200'} transition-colors duration-200`}>
            <DatePicker
              selected={formData.birthdate ? new Date(formData.birthdate) : null}
              onChange={(date) => handleChange('birthdate', date ? date.toISOString().split('T')[0] : '')}
              onFocus={() => handleFocus('birthdate')}
              onBlur={() => handleBlur('birthdate')}
              dateFormat="yyyy-MM-dd"
              maxDate={new Date()}
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              className='py-2 w-full outline-none text-base text-gray-800 font-medium'
              placeholderText="Select your date of birth"
              popperClassName="datepicker-popper"
              popperModifiers={[
                {
                  name: 'offset',
                  options: {
                    offset: [0, 8],
                  },
                },
              ]}
              calendarClassName="custom-datepicker"
              wrapperClassName="w-full"
              styles={customDatePickerStyles}
            />
          </div>
          {errors.birthdate && (
            <p className='text-red-500 text-xs mt-1 ml-1 transition-opacity duration-200'>{errors.birthdate}</p>
          )}
        </div>
      </div>
      
      <div className='mt-auto mb-8 space-y-4'>
        <button
          type="button"
          onClick={handleNext}
          className='w-full py-4 rounded-full font-bold text-lg text-white shadow-md bg-[#914938] hover:bg-[#7d3e30] active:scale-[0.98] transition-all duration-300'
        >
          Next
        </button>
        
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        
        <button
          type="button"
          onClick={handleGoogleSignup}
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
          Sign up with Google
        </button>
        
        <p className='text-center text-gray-600'>
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className='text-[#914938] font-medium'
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
  
  // Render step 2: Credentials
  const renderCredentials = () => (
    <div className='flex flex-col flex-grow px-6 pt-6'>
      <div className='space-y-5 mb-6'>
        {/* Email Field */}
        <div className={`transition-all duration-200 ${fieldFocus.email ? 'translate-y-[-4px]' : ''}`}>
          <p className='text-xs font-semibold text-gray-500 mb-1'>EMAIL</p>
          <div className={`relative border-b-2 ${errors.email ? 'border-red-500' : fieldFocus.email ? 'border-[#914938]' : 'border-gray-200'} transition-colors duration-200`}>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onFocus={() => handleFocus('email')}
              onBlur={() => handleBlur('email')}
              className='py-2 w-full outline-none text-base text-gray-800 font-medium'
              placeholder='Enter your email'
            />
          </div>
          {errors.email && (
            <p className='text-red-500 text-xs mt-1 ml-1 transition-opacity duration-200'>{errors.email}</p>
          )}
        </div>
        
        {/* Password Field */}
        <div className={`transition-all duration-200 ${fieldFocus.password ? 'translate-y-[-4px]' : ''}`}>
          <p className='text-xs font-semibold text-gray-500 mb-1'>PASSWORD</p>
          <div className={`relative border-b-2 ${errors.password ? 'border-red-500' : fieldFocus.password ? 'border-[#914938]' : 'border-gray-200'} transition-colors duration-200`}>
            <input 
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onFocus={() => handleFocus('password')}
              onBlur={() => handleBlur('password')}
              className='py-2 w-full outline-none text-base text-gray-800 font-medium pr-10'
              placeholder='Create a password'
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className='text-red-500 text-xs mt-1 ml-1 transition-opacity duration-200'>{errors.password}</p>
          )}
          
          {/* Password requirements */}
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
      
      <p className="text-sm text-gray-500 mt-2 mb-6">
        By creating an account, you agree to our <span className="text-[#914938] font-medium">Terms</span> and <span className="text-[#914938] font-medium">Privacy Policy</span>
      </p>
      
      <div className='mt-auto mb-8'>
        <div className='flex gap-4'>
          <button
            type="button"
            onClick={handleBack}
            className='w-1/2 py-4 rounded-full font-bold text-lg border border-[#914938] text-[#914938] hover:bg-[#f8f1ef] active:scale-[0.98] transition-all duration-300'
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            className='w-1/2 py-4 rounded-full font-bold text-lg text-white shadow-md bg-[#914938] hover:bg-[#7d3e30] active:scale-[0.98] transition-all duration-300'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
  
  // Render step 3: Gender Selection
  const renderGenderSelection = () => (
    <div className='flex flex-col flex-grow px-6 pt-6'>
      <div className='mb-6'>
        <h2 className='text-xl font-bold text-gray-800 mb-2'>Choose your gender</h2>
        <p className='text-sm text-gray-600'>Select the option that best represents you</p>
      </div>
      
      <div className='flex justify-center gap-6 mt-4'>
        <div 
          className={`w-32 h-48 flex flex-col items-center justify-center rounded-lg border-2 transition-all cursor-pointer
            ${formData.gender === 'male' 
              ? 'border-[#914938] bg-[#f8f1ef]' 
              : 'border-gray-200 hover:border-gray-300'}`}
          onClick={() => handleGenderSelect('male')}
        >
          <div className='w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden'>
            <img src={maradImg} alt="Male avatar" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <span className='font-medium'>Male</span>
        </div>
        
        <div 
          className={`w-32 h-48 flex flex-col items-center justify-center rounded-lg border-2 transition-all cursor-pointer
            ${formData.gender === 'female' 
              ? 'border-[#914938] bg-[#f8f1ef]' 
              : 'border-gray-200 hover:border-gray-300'}`}
          onClick={() => handleGenderSelect('female')}
        >
          <div className='w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden'>
            <img src={auratImg} alt="Female avatar" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <span className='font-medium'>Female</span>
        </div>
      </div>
      
      {errors.gender && (
        <p className='text-red-500 text-sm text-center mt-4'>{errors.gender}</p>
      )}
      
      <div className='mt-auto mb-8'>
        <div className='flex gap-4'>
          <button
            type="button"
            onClick={handleBack}
            className='w-1/2 py-4 rounded-full font-bold text-lg border border-[#914938] text-[#914938] hover:bg-[#f8f1ef] active:scale-[0.98] transition-all duration-300'
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            className='w-1/2 py-4 rounded-full font-bold text-lg text-white shadow-md bg-[#914938] hover:bg-[#7d3e30] active:scale-[0.98] transition-all duration-300'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
  
  // Render step 4: Habits Selection
  const renderHabitsSelection = () => {
    return (
      <div className='flex flex-col flex-grow px-6 pt-6'>
        <div className='mb-6'>
          <h2 className='text-xl font-bold text-gray-800 mb-2'>Choose your habits</h2>
          <p className='text-sm text-gray-600'>Select the habits you want to track. You can add more later.</p>
        </div>
        
        <div className='grid grid-cols-2 gap-4 mt-4'>
          {habits.map((habit) => (
            <div 
              key={habit.id}
              className={`p-4 rounded-lg border-2 flex flex-col items-center cursor-pointer transition-all
                ${formData.habits.includes(habit.id) 
                  ? 'border-[#914938] bg-[#f8f1ef]' 
                  : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => handleHabitSelect(habit.id)}
            >
              <div className='text-3xl mb-2'>{habit.icon}</div>
              <span className='font-medium text-sm'>{habit.name}</span>
            </div>
          ))}
        </div>
        
        {errors.habits && (
          <p className='text-red-500 text-sm text-center mt-4'>{errors.habits}</p>
        )}
        
        <div className='mt-auto mb-8'>
          <div className='flex gap-4'>
            <button
              type="button"
              onClick={handleBack}
              className='w-1/2 py-4 rounded-full font-bold text-lg border border-[#914938] text-[#914938] hover:bg-[#f8f1ef] active:scale-[0.98] transition-all duration-300'
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className={`w-1/2 py-4 rounded-full font-bold text-lg text-white shadow-md transition-all duration-300 overflow-hidden relative
                ${isSubmitting ? 'bg-gray-400' : 'bg-[#914938] hover:bg-[#7d3e30] active:scale-[0.98]'}`}
            >
              <span className={`inline-block transition-all duration-300 ${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
                Complete
              </span>
              {isSubmitting && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderCredentials();
      case 3:
        return renderGenderSelection();
      case 4:
        return renderHabitsSelection();
      default:
        return null;
    }
  };
  
  // Progress indicator
  const renderProgressIndicator = () => {
    const totalSteps = 4;
    const progressPercent = ((step - 1) / (totalSteps - 1)) * 100;
    
    return (
      <div className="w-full h-1 bg-gray-200 mt-2">
        <div 
          className="h-full bg-[#914938] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
    );
  };
  
  useEffect(() => {
    import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
      if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
        StatusBar.setBackgroundColor({ color: '#FFFFFF' });
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setNavigationBarColor({ color: '#FFFFFF' });
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#FFFFFF');
      }
    });
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header with back button and progress */}
      <div className='flex flex-col'>
        <div className='flex items-center px-4 py-4'>
          <button 
            onClick={handleBack}
            className='p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200'
          >
            <ChevronLeft size={28} className="text-gray-800" />
          </button>
          <h1 className='ml-3 text-xl font-bold text-gray-800'>Create Account</h1>
          <div className='ml-auto text-sm text-gray-500'>Step {step} of 4</div>
        </div>
        {renderProgressIndicator()}
      </div>
      
      {/* Form Content */}
      <form className='flex flex-col flex-grow' onSubmit={(e) => e.preventDefault()}>
        {renderStepContent()}
      </form>
    </div>
  );
};

export default ModernSignup;