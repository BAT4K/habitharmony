import Calendar from "../components/Calendar";
import React from "react";
import ActivitySection from "../components/ActivitySection";
import { Search, Bot } from "lucide-react";
import reminder from "../assets/reminder.png";
import HabitSection from "../components/HabitSection";

const HomeScreen = () => {
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
        <Bot className="size-14 bg-white rounded-full p-2 border border-black/50" />
      </div>
      <div className="flex justify-center px-3">
        <img src={reminder} alt="reminder" />
      </div>
      <Calendar />
      <div className="flex justify-between p-4 mt-2 items-center">
        <p className="font-bold text-xl">For you</p>
        <a href="/" className="text-blue-700 text-[12px]">
          View all
        </a>
      </div>
      <div className="px-3">
        <ActivitySection />
      </div>
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
