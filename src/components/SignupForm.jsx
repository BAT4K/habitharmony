import React, { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
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


const SignupForm = () => {
    const [step, setStep] = useState(1)
    const handleNext = () => {
        setStep(step+1)
    }
    console.log(step)
    if (step === 1){
        return (
            <div className='flex flex-col'>
                <div className='flex py-4 px-2 items-center gap-18'>
                   <ChevronLeft size='40'/>
                   <h1 className='text-2xl font-semibold'>Create Account</h1>
                </div>
                <br />
                <div className='flex flex-col gap-8 py-4 px-12 w-screen'>
                    <div>
                        <p className='text-[10px] font-bold'>NAME</p>
                        <input type="text" className='py-2 border-b border-black/50 focus:border-green-400 outline-none text-sm font-semibold w-full' placeholder='Name'/>
                    </div>
                    <div>
                        <p className='text-[10px] font-bold'>SURNAME</p>
                        <input type="text" className='py-2 border-b border-black/50 focus:border-green-400 outline-none text-sm font-semibold w-full' placeholder='Surname'/>
                    </div>
                    <div>
                        <p className='text-[10px] font-bold'>BIRTHDATE</p>
                        <input type="date" className='py-2 border-b border-black/50 focus:border-green-400 outline-none text-sm font-semibold w-full' placeholder='mm/dd//yyyy'/>
                    </div>
                </div>
                <div className='items-center flex flex-col mt-[110%] gap-2'>
                    <button onClick={() => handleNext()} className='py-4 px-32 bg-[#914938] text-white rounded-4xl font-bold text-xl'>Next</button>
                </div>
            </div>
          )
    }
    if (step === 2) {
        return (
            <div className='flex flex-col'>
                <div className='flex py-4 px-2 items-center gap-18'>
                   <ChevronLeft size='40'/>
                   <h1 className='text-2xl font-semibold'>Create Account</h1>
                </div>
                <br />
                <div className='py-2 px-6'>
                    <p className='font-bold text-xl'>Choose your gender</p>
                </div>
                <div className='flex justify-between items-center mt-4 py-2 px-8'>
                    <img src={Male} alt="Male" />
                    <img src={Female} alt="Female" />
                </div>
                <div className='items-center flex flex-col mt-[110%] gap-2'>
                    <button onClick={() => handleNext()} className='py-4 px-32 bg-[#914938] text-white rounded-4xl font-bold text-xl'>Next</button>
                </div>
            </div>
          )
    }
    if(step === 3){
        return (
            <div className='flex flex-col'>
                <div className='flex py-4 px-2 items-center gap-18'>
                   <ChevronLeft size='40'/>
                   <h1 className='text-2xl font-semibold'>Create Account</h1>
                </div>
                <br />
                <div className='py-2 px-6'>
                    <p className='font-bold text-xl'>Choose your first habits</p>
                    <p className='text-sm text-black/50'>You may add more habits later</p>
                </div>
                <div className='grid grid-cols-2 py-2 px-8 gap-4'>
                    <img src={Icon} alt="Male" />
                    <img src={Icon1} alt="Male" />
                    <img src={Icon2} alt="Male" />
                    <img src={Icon3} alt="Male" />
                    <img src={Icon4} alt="Male" />
                    <img src={Icon5} alt="Male" />
                    <img src={Icon6} alt="Male" />
                    <img src={Icon7} alt="Male" />
                    
                </div>
                <div className='items-center flex flex-col mt-[10%] gap-2'>
                    <button onClick={() => handleNext()} className='py-4 px-32 bg-[#914938] text-white rounded-4xl font-bold text-xl'>Next</button>
                </div>
            </div>
          )
    }
  
}

export default SignupForm