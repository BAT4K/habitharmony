import React from "react";
import Pos from "../assets/PositiveAct.webp";
import Neg from "../assets/NegativeAct.webp";
import AwardAct from "../assets/AwardAct.webp";

const ProfileActivity = ({ act }) => {
  return (
    <div className="flex items-center justify-between p-4 border border-[#CCCCCC] bg-white rounded-2xl">
      <div>
        <p className="text-[14px] font-semibold">112 points earned!</p>
        <p className="text-[12px] text-black/50">Today, 12:34 PM</p>
      </div>
      <img
        src={act === "positive" ? Pos : act === "negative" ? Neg : AwardAct}
        alt=""
      />
    </div>
  );
};

export default ProfileActivity;
