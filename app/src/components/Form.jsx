import React, { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Form = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      navigate('/homescreen');
    }
  };

  return (
    <div className='flex flex-col'>
        <div className='flex py-4 px-2 items-center gap-10'>
           <ChevronLeft size='40' onClick={() => navigate(-1)}/>
           <h1 className='text-2xl font-semibold'>Continue with E-mail</h1>
        </div>
        <br />
        <form onSubmit={handleSubmit} className='flex flex-col gap-8 py-4 px-12 w-screen'>
            <div>
                <p className='text-[10px] font-bold'>EMAIL</p>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`py-2 border-b ${errors.email ? 'border-red-500' : 'border-black/50'} focus:border-green-400 outline-none text-sm font-semibold w-full`}
                    placeholder='Enter your Email'
                />
                {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
            </div>
            <div>
                <p className='text-[10px] font-bold'>PASSWORD</p>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`py-2 border-b ${errors.password ? 'border-red-500' : 'border-black/50'} focus:border-green-400 outline-none text-sm font-semibold w-full`}
                    placeholder='Enter your password'
                />
                {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password}</p>}
                <p className='text-[13px] text-black/50 mt-1'>I forgot my password</p>
            </div>
            <div className='items-center flex flex-col mt-[120%] gap-2'>
                <button 
                    type="submit"
                    className='py-4 px-32 bg-[#914938] text-white rounded-4xl font-bold text-xl'
                >
                    Next
                </button>
                <p className='text-[#914938] text-sm font-medium' onClick={() => navigate('/signup')}>
                    Don't have an account? Let's create!
                </p>
            </div>
        </form>
    </div>
  )
}

export default Form