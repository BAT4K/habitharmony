import React from "react";

const HabitCard = ({ habit, streak, action, goal, image, color }) => {
  return (
    <div
      className="text-white rounded-2xl p-4 py-6 flex items-center justify-between w-56 min-w-[210px]" 
      style={{ backgroundColor: color }} 
    >
      <div>
        <div className="text-lg">{habit}</div>
        <div className="text-3xl font-bold">
          {streak}/{goal}
          <span className="text-lg font-normal"> {action}</span>
        </div>
      </div>
      <div className="flex items-center">
        <img alt="Habit icon" src={image} className="h-10 w-10 object-contain" /> 
        <div className="text-2xl">+</div>
      </div>
    </div>
  );
};

export default HabitCard;
