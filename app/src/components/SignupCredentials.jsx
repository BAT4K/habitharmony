import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const SignupCredentials = ({ onNext, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[0-9])/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext({ email, password });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F3F3] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="mt-2 text-gray-600">Please enter your credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-[#914938] focus:border-[#914938]`}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-[#914938] focus:border-[#914938]`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
            <div className="mt-2 text-sm text-gray-500">
              Password must contain:
              <ul className="list-disc pl-5 mt-1">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One number</li>
                <li>One special character (!@#$%^&*)</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="w-1/2 px-4 py-2 border border-[#914938] text-[#914938] rounded-md hover:bg-[#914938] hover:text-white transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-1/2 px-4 py-2 bg-[#914938] text-white rounded-md hover:bg-[#813928] transition-colors"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupCredentials;