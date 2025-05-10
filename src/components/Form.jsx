import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Form = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('https://habitharmony.onrender.com/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('habitharmony_user', JSON.stringify(response.data.user));
      navigate('/homescreen');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form className='flex flex-col' onSubmit={handleLogin}>
      <div className='flex py-4 px-2 items-center gap-10'>
        <ChevronLeft size='40'/>
        <h1 className='text-2xl font-semibold'>Continue with E-mail</h1>
      </div>
      <br />
      <div className='flex flex-col gap-8 py-4 px-12 w-screen'>
        <div>
          <p className='text-[10px] font-bold'>EMAIL</p>
          <input type="text" value={email} onChange={e => setEmail(e.target.value)} className='py-2 border-b border-black/50 focus:border-green-400 outline-none text-sm font-semibold w-full' placeholder='Enter your Email'/>
        </div>
        <div>
          <p className='text-[10px] font-bold'>PASSWORD</p>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className='py-2 border-b border-black/50 focus:border-green-400 outline-none text-sm font-semibold w-full' placeholder='Enter your password'/>
          <p className='text-[13px] text-black/50 mt-1'>I forgot my password</p>
        </div>
        {error && <div className='text-red-500 text-sm'>{error}</div>}
      </div>
      <div className='items-center flex flex-col mt-[120%] gap-2'>
        <button type='submit' className='py-4 px-32 bg-[#914938] text-white rounded-4xl font-bold text-xl'>Next</button>
        <p className='text-[#914938] text-sm font-medium'>Don't have an account? Let's create!</p>
      </div>
    </form>
  );
}

export default Form;