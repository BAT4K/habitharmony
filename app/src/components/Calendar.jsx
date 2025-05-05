import React, { useState, useEffect } from 'react';

const Calendar = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [daysInMonth, setDaysInMonth] = useState([]);

    useEffect(() => {
        generateDaysInMonth(selectedDate);
    }, [selectedDate]);

    const generateDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const totalDays = new Date(year, month + 1, 0).getDate();
        const days = [];
        
        for (let i = 1; i <= totalDays; i++) {
            const currentDate = new Date(year, month, i);
            days.push({
                day: currentDate.toLocaleString('en-US', { weekday: 'short' }),
                date: i.toString(),
                active: i === date.getDate()
            });
        }
        setDaysInMonth(days);
    };

    const DayCard = ({day, date, active, onClick}) => {
        return (
            <div 
                onClick={onClick}
                className={`w-12 h-[98px] flex flex-col justify-center items-center gap-2 px-10 py-14 rounded-xl shadow-md cursor-pointer transition-colors
                    ${active ? 'bg-[#F75836]' : 'bg-white'} 
                    ${active ? 'text-white' : 'text-black'}
                    hover:bg-opacity-90`}
            >
                <p className='font-semibold'>{day}</p>
                <h1 className='text-3xl font-bold'>{date}</h1>
            </div>
        );
    };

    const handleDateClick = (date) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(parseInt(date));
        setSelectedDate(newDate);
    };

    return (
        <div className='w-full overflow-x-auto'>
            <div className='flex gap-4 min-w-max px-4 pb-4'>
                {daysInMonth.map((day, index) => (
                    <DayCard 
                        key={index} 
                        day={day.day} 
                        date={day.date} 
                        active={day.active}
                        onClick={() => handleDateClick(day.date)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Calendar;