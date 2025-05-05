import React from "react";
import bgImage from "../assets/badgeScreen.png";
import { ChevronLeft } from "lucide-react";

const BadgePage = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center font-display pt-10 px-6 flex flex-col justify-between"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="p-3 bg-white w-max h-max rounded-2xl">
        <ChevronLeft />
      </div>
      <div className="py-4 w-full mb-12 text-lg font-semibold bg-white flex justify-center items-center rounded-4xl">
        Claim
      </div>
    </div>
  );
};

export default BadgePage;
