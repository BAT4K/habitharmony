import React, { useState } from "react";
import Filter from "../assets/Filter.png";
import ProfileActivity from "./ProfileActivity";
import Add from "../assets/AddButton.png";
import Edit from "../assets/EditButton.png";
import FriendsCard from "./FriendsCard";
import AchievementCard from "./AchievementCard";

const ProfileCategory = () => {
  const [activeTab, setActiveTab] = useState("activity");

  return (
    <div>
      <div className="flex items-center justify-between bg-[#E1E1E1] rounded-2xl">
        {["activity", "friends", "achievements"].map((tab) => (
          <p
            key={tab}
            className={`w-max px-6 py-1 rounded-2xl cursor-pointer ${
              activeTab === tab
                ? "bg-white text-[#914938] shadow-2xl"
                : "text-gray-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </p>
        ))}
      </div>
      <br />
      <div>
        {activeTab === "activity" && (
          <>
            <div className="flex items-center justify-between">
              <p className="font-[500]">Showing last month activity</p>
              <img src={Filter} alt="Filter" />
            </div>
            <br />
            <div className="space-y-2">
              <ProfileActivity act="positive" />
              <ProfileActivity act="negative" />
              <ProfileActivity />
            </div>
          </>
        )}

        {activeTab === "friends" && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="font-[500]">4 friends</p>
              <div className="flex">
                <img src={Add} alt="Add" />
                <img src={Edit} alt="Edit" />
              </div>
            </div>
            <div className="space-y-2">
              <FriendsCard />
              <FriendsCard />
              <FriendsCard />
              <FriendsCard />
            </div>
          </>
        )}

        {activeTab === "achievements" && (
          <>
            <div className="flex items-center justify-between">
              <p className="font-[500]">2 Achievements</p>
            </div>
            <br />
            <div className="space-y-2">
              <AchievementCard />
              <AchievementCard />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileCategory;
