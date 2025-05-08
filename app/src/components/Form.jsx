import React, { useState } from 'react'
import { ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

const Form = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldFocus, setFieldFocus] = useState({ email: false, password: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      // Simulate loading for better UX
      setTimeout(() => {
        // After real login API call, store user._id in localStorage:
        // localStorage.setItem('habitharmony_user_id', response.data.user._id);
        navigate('/homescreen');
      }, 800);
    }
  };

  const handleFocus = (field) => {
    setFieldFocus({ ...fieldFocus, [field]: true });
  };

  const handleBlur = (field) => {
    setFieldFocus({ ...fieldFocus, [field]: false });
  };

  const handleGoogleSignup = () => {
    // This would implement Google OAuth
    console.log("Google signup clicked - implementation needed");
  };

  return (
    <div className='flex flex-col min-h-screen bg-white'>
      {/* Header with back button */}
      <div className='flex items-center px-4 py-4 border-b border-gray-100'>
        <button 
          onClick={() => navigate('/', { state: { slide: 2 } })}
          className='p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200'
        >
          <ChevronLeft size={28} className="text-gray-800" />
        </button>
        <h1 className='ml-3 text-xl font-bold text-gray-800'>Create Account</h1>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className='flex flex-col flex-grow px-6 pt-6'>
        <div className='space-y-5 mb-6'>
          {/* Email Field */}
          <div className={`transition-all duration-200 ${fieldFocus.email ? 'translate-y-[-4px]' : ''}`}>
            <p className='text-xs font-semibold text-gray-500 mb-1'>EMAIL</p>
            <div className={`relative border-b-2 ${errors.email ? 'border-red-500' : fieldFocus.email ? 'border-[#914938]' : 'border-gray-200'} transition-colors duration-200`}>
              <input 
                type="email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
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
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
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
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-2 mb-6">
          By creating an account, you agree to our <span className="text-[#914938] font-medium">Terms</span> and <span className="text-[#914938] font-medium">Privacy Policy</span>
        </p>

        {/* Buttons */}
        <div className='mt-auto mb-8 space-y-4'>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-full font-bold text-lg text-white shadow-md transition-all duration-300 overflow-hidden relative
              ${isSubmitting ? 'bg-gray-400' : 'bg-[#914938] hover:bg-[#7d3e30] active:scale-[0.98]'}`}
          >
            <span className={`inline-block transition-all duration-300 ${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
              Create Account
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
      </form>
    </div>
  )
}

export default Form