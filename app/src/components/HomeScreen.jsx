import React, { useState } from "react";
import Calendar from "./Calendar";
import ActivitySection from "./ActivitySection";
import { Search, Bot } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import reminder from "../assets/reminder.png";
import HabitSection from "./HabitSection";
import bottle from "../assets/bottle.png";
import trophy from "../assets/Trophy.png";

const HomeScreen = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCelebration, setShowCelebration] = useState(false);
  
  const defaultHabits = [
    {
      habit: "no cigarettes",
      streak: "5",
      action: "streak!",
      goal: "21",
      image: trophy,
      color: "#914938",
    },
    {
      habit: "Water intake",
      streak: "2",
      action: "glasses",
      goal: "8",
      image: bottle,
      color: "#3B82F6",
    },
    {
      habit: "Water intake",
      streak: "2",
      action: "glasses",
      goal: "8",
      image: bottle,
      color: "#3B82F6",
    }
  ];

  const [habits, setHabits] = useState({
    default: defaultHabits
  });

  return (
    <div className="min-h-screen font-display bg-[#F8F3F3] pt-12 bg-16">
      <div className="flex justify-between px-3">
        <div className="border border-black/50 flex bg-white items-center px-3 pr-16 rounded-2xl">
          <Search />
          <input
            type="text"
            className="p-2 py-4 bg-white w-full outline-none ring-0"
            placeholder="Find a hobby"
          />
        </div>
        <Bot 
          className="size-14 bg-white rounded-full p-2 border border-black/50 cursor-pointer hover:bg-gray-50 transition-colors" 
          onClick={() => navigate('/faq')}
        />
      </div>
      <div className="flex justify-center px-3">
        <img src={reminder} alt="reminder" />
      </div>
      <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <div className="flex justify-between px-4 py-2 mt-2 items-center">
        <p className="font-bold text-xl">Your Activity</p>
        <a href="/" className="text-blue-700 text-[12px]">
          View all
        </a>
      </div>
      <div className="px-3">
        <HabitSection />
      </div>
    </div>
  );
};

export default HomeScreen;