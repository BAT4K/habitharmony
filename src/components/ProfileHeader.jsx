import React from "react";
import Profile from "../assets/ProfilePicture.png";
import { Award } from "lucide-react";
import { Settings } from "lucide-react";
import { NotebookPen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileHeader = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1 className="text-3xl font-bold">Your Profile</h1>
      <div className="flex items-center space-x-4 mt-4">
        <img
          src={Profile}
          alt="Profile Picture"
          className=" border-2 border-black rounded-full h-[76px] w-[76px]"
        />
        <div className="flex justify-center flex-col">
          <div className="flex justify-between items-center space-x-10">
            <p className="text-2xl font-semibold">Vidisha Bhatnagar</p>
            <Settings
              onClick={() => {
                navigate("/settings");
              }}
            />
          </div>
          <p className="flex pl-3 py-2 bg-[#FFF3DA] w-max pr-5 rounded-3xl text-sm items-center text-[#FEA800] font-medium">
            <Award size={16} />
            1452 Points
          </p>
        </div>
      </div>
      <div className="px-4 pt-6">
        <div className="flex items-center gap-3">
          <NotebookPen />
          <div>
            <p className="mb-[-4px] p-0 text-normal text-[#5253E3]">Journal</p>
            <p className="m-0 p-0 text-[12px] text-black/80">
              Write your own progress
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
