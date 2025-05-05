import React from "react";
import Run from "../assets/Run.png";

const AchievementCard = () => {
  return (
    <div className="flex items-center justify-between p-4 border border-[#CCCCCC] bg-white rounded-2xl">
      <div className="flex items-center gap-2">
        <img src={Run} alt="" />
        <div>
          <p className="text-[14px] font-semibold">Best Runner!</p>
          <p className="text-[12px] text-black/50">1 month ago</p>
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;
