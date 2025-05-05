import React, { useState } from 'react';

const SignupBasic = ({ onNext }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext(formData);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F3F3] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="mt-2 text-gray-600">Please enter your details</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-[#914938] focus:border-[#914938]`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-[#914938] focus:border-[#914938]`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({...formData, dob: e.target.value})}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.dob ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-[#914938] focus:border-[#914938]`}
            />
            {errors.dob && (
              <p className="mt-1 text-sm text-red-500">{errors.dob}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-[#914938] text-white rounded-md hover:bg-[#813928] transition-colors"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupBasic;