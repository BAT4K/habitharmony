import React from "react";

const ProgressCard = ({ icon, title, goal, progress }) => {
  return (
    <div className="bg-pink-100 rounded-lg p-4 w-64 shadow-md">
      <div className="flex items-center mb-4">
        <img src={icon} alt={`${title} Icon`} className="w-10 h-10 rounded-full" />
      </div>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-gray-600">Goal - {goal}</p>
      </div>
      <div className="mt-10">
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-pink-200">
            <div
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-right">
            <span className="text-pink-500 text-sm font-semibold">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
