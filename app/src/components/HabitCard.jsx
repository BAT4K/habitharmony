import React from "react";
import { Plus } from "lucide-react";

const HabitCard = ({ habit, streak, action, goal, image, color, onIncrement }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm min-w-[200px]">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">{habit}</h3>
          <p className="text-sm text-gray-600">
            {streak}/{goal} {action}
          </p>
        </div>
        <button
          onClick={onIncrement}
          className={`rounded-full p-2 transition-colors cursor-pointer`}
          style={{ backgroundColor: color }}
        >
          <Plus className="text-white" />
        </button>
      </div>
      <img src={image} alt={habit} className="mt-2" />
    </div>
  );
};

export default HabitCard;
