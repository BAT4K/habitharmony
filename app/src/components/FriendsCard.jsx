import React from "react";
import Delete from "../assets/DeleteButton.webp";
import Profile from "../assets/ProfilePicture.webp";

const FriendsCard = () => {
  return (
    <div className="flex items-center justify-between p-4 border border-[#CCCCCC] bg-white rounded-2xl">
      <div className="flex items-center gap-2">
        <img src={Profile} alt="Profile" className="h-9 w-9 rounded-full" loading="lazy" />
        <div>
          <p className="text-[14px] font-semibold">Varun Gusain</p>
          <p className="text-[12px] text-black/50">912 points</p>
        </div>
      </div>
      <img src={Delete} alt="Delete" loading="lazy" />
    </div>
  );
};

export default FriendsCard;
