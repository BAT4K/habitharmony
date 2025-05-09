import Calendar from "../components/Calendar";
import React from "react";
import ActivitySection from "../components/ActivitySection";
import { Search, Bot, Award } from "lucide-react";
import reminder from "../assets/reminder.png";
import HabitSection from "../components/HabitSection";

// Add this mapping for habit reminders
const habitReminders = {
  "Drink Water": {
    icon: "💧",
    color: "cyan",
    message: "Stay hydrated! Track your daily water intake for better health and energy."
  },
  "Exercise": {
    icon: "🏋️",
    color: "green",
    message: "Time for some movement! Even a short workout boosts your mood and energy."
  },
  "Reading": {
    icon: "📚",
    color: "blue",
    message: "Feed your mind! Reading for 15 minutes a day builds knowledge over time."
  },
  "Meditation": {
    icon: "🧘",
    color: "purple",
    message: "Take a moment for mindfulness. Just 5 minutes of meditation daily can reduce stress."
  },
  "Walking": {
    icon: "🚶",
    color: "amber",
    message: "Steps add up! A daily walk improves mood and boosts your physical health."
  },
  // Add more habits as needed
};

const HomeScreen = () => {
  const isPremium = typeof window !== 'undefined' && localStorage.getItem('habitharmony_premium') === 'true';
  const greeting = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 18 ? "Good Afternoon" : "Good Evening";
  const userName = "User"; // Replace with actual user name

  // Get user's habits from localStorage
  const userHabits = JSON.parse(localStorage.getItem('habitharmony_user_habits') || '[]');

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
      {/* Personalized Reminders Section */}
      <div className="flex flex-col gap-2 justify-center px-3 mt-2">
        {userHabits.length === 0 ? (
          <div className="bg-white rounded-xl p-4 text-center text-gray-500">
            Add some habits to get personalized reminders!
          </div>
        ) : (
          userHabits.map((habit, idx) => {
            const reminder = habitReminders[habit.name] || {
              icon: "⭐",
              color: "gray",
              message: `Don't forget your \"${habit.name}\" habit today!`
            };
            return (
              <div
                key={habit.name}
                className={`flex items-center gap-3 p-3 rounded-xl border-l-4 bg-white shadow-sm border-${reminder.color}-400`}
              >
                <span className={`text-2xl`}>{reminder.icon}</span>
                <div>
                  <div className="font-bold text-gray-700">{habit.name}</div>
                  <div className="text-sm text-gray-500">{reminder.message}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* End Personalized Reminders */}
      <div className="flex items-center gap-2 px-4 mt-4">
        <span className="text-[#F75836]">{greeting === "Good Morning" ? "☀️" : greeting === "Good Afternoon" ? "🌤️" : "🌙"}</span>
        <h1 className="font-bold text-lg flex items-center gap-2">
          {greeting}, {userName}!
          {isPremium && (
            <span className="inline-flex items-center gap-1 text-green-600 font-bold ml-2">
              <Award size={16} /> Premium
            </span>
          )}
        </h1>
      </div>
      <p className="text-gray-500 text-sm mt-1 px-4">{
        new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })
      }</p>
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
