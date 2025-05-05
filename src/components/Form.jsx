import React from 'react'
import { ChevronLeft } from 'lucide-react'
const Form = () => {
  return (
    <div className='flex flex-col'>
        <div className='flex py-4 px-2 items-center gap-10'>
           <ChevronLeft size='40'/>
           <h1 className='text-2xl font-semibold'>Continue with E-mail</h1>
        </div>
        <br />
        <div className='flex flex-col gap-8 py-4 px-12 w-screen'>
            <div>
                <p className='text-[10px] font-bold'>EMAIL</p>
                <input type="text" className='py-2 border-b border-black/50 focus:border-green-400 outline-none text-sm font-semibold w-full' placeholder='Enter your Email'/>
            </div>
            <div>
                <p className='text-[10px] font-bold'>PASSWORD</p>
                <input type="text" className='py-2 border-b border-black/50 focus:border-green-400 outline-none text-sm font-semibold w-full' placeholder='Enter your password'/>
                <p className='text-[13px] text-black/50 mt-1'>I forgot my password</p>
            </div>
        </div>
        <div className='items-center flex flex-col mt-[120%] gap-2'>
            <button className='py-4 px-32 bg-[#914938] text-white rounded-4xl font-bold text-xl'>Next</button>
            <p className='text-[#914938] text-sm font-medium'>Don't have an account? Let's create!</p>
        </div>
    </div>
  )
}

export default Form