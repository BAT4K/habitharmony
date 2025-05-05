import React from 'react'

const Calendar = () => {
    const days = [{day: 'Mon', date: '25'}, {day:'Tue', date:'26'}, {day:'Wed', date:'27', active:'true'}, {day:'Thu', date:'28'}, {day:'Fri', date:'29'}]
  const DayCard = ({day, date, active}) => {
    return (
        <div className={`w-12 h-[98px] flex flex-col justify-center items-center gap-2 px-10 py-14 rounded-xl shadow-md ${active ? 'bg-[#F75836]' : 'bg-white'} ${active ? 'text-white' : 'text-black'}`}>
            <p className='font-semibold'>{day}</p>
            <h1 className='text-3xl font-bold'>{date}</h1>
        </div>
    )
  }
  return (
    <div className='flex justify-between '>
        {days.map((i,j) => {return <DayCard key={j} day={i.day} date={i.date} active={i.active}/>})}
    </div>
  )
}

export default Calendar