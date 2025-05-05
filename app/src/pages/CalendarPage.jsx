import React, { useState } from "react";
import ProgressSection from "../components/ProgressSection";
import Calendar from "../components/Calendar";
import { Plus } from "lucide-react";

const categories = ["In Progress", "Completed", "Overdue"];

const categorySections = {
  "In Progress": ["Do Anytime", "Morning", "Evening"],
  Completed: ["Completed Tasks"],
  Overdue: [], // Empty initially
};

const CalendarPage = () => {
  const [activeCategory, setActiveCategory] = useState("In Progress");

  return (
    <div className="min-h-screen font-display bg-[#F8F3F3] pt-12 mb-30">
      <div className="flex justify-between px-4 mb-3 items-center">
        <h1 className="font-semibold text-[30px]">Today</h1>
        <Plus className="font-bold" size={30} />
      </div>
      <Calendar />
      <div className="flex justify-between px-4 mt-8 items-center">
        {categories.map((category) => (
          <p
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`py-2 px-4 rounded-3xl font-semibold cursor-pointer ${
              activeCategory === category ? "bg-[#FFCA7B]" : ""
            }`}
          >
            {category}
          </p>
        ))}
      </div>
      <br />
      <div className="space-y-6">
        {categorySections[activeCategory].length > 0
          ? categorySections[activeCategory].map((section) => (
              <div key={section} className="px-4 space-y-2">
                <p className="text-black/60">{section}</p>
                <ProgressSection category={section} />
              </div>
            ))
          : activeCategory === "Overdue" && (
              <div className="min-h-[400px] flex justify-center items-center">
                <div>
                  <p className="text-center text-black/60 font-semibold text-5xl">
                    Nothing due,
                  </p>
                  <p className="text-center text-black/60 font-semibold text-5xl">
                    keep it up!
                  </p>
                </div>
              </div>
            )}
      </div>
    </div>
  );
};

export default CalendarPage;
