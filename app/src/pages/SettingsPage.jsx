import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import General from "../assets/General.png";
import Dark from "../assets/DarkMode.png";
import Toggle from "../components/Toggle";
import Security from "../assets/Security.png";
import Notification from "../assets/Notification.png";
import Sound from "../assets/Sound.png";
import Play from "../assets/Play.png";
import Star from "../assets/Star.png";
import Share from "../assets/Share.png";
import Premium from "../assets/Premium.png";
import Info from "../assets/Info.png";
import Chat from "../assets/Chat.png";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const navigate = useNavigate();

  const GeneralSection = () => {
    return (
      <div className="bg-white pt-5 pb-1 px-4 rounded-2xl border border-[#CCCCCC]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src={General} alt="General" />
            <p className="text-[14px] font-semibold">General</p>
          </div>
          <ChevronRight />
        </div>
        <hr className="text-[#cccccc]" />
        <div className="flex items-center justify-between mb-4 mt-4">
          <div className="flex items-center gap-2">
            <img src={Dark} alt="Dark Mode" />
            <p className="text-[14px] font-semibold">Dark Mode</p>
          </div>
          <Toggle />
        </div>
        <hr className="text-[#cccccc]" />
        <div className="flex items-center justify-between mb-4 mt-4">
          <div className="flex items-center gap-2">
            <img src={Security} alt="Security" />
            <p className="text-[14px] font-semibold">Security</p>
          </div>
          <ChevronRight />
        </div>
        <hr className="text-[#cccccc]" />
        <div className="flex items-center justify-between mb-4 mt-4">
          <div className="flex items-center gap-2">
            <img src={Notification} alt="Notification" />
            <p className="text-[14px] font-semibold">Notifications</p>
          </div>
          <ChevronRight />
        </div>
        <hr className="text-[#cccccc]" />
        <div className="flex items-center justify-between mb-4 mt-4">
          <div className="flex items-center gap-2">
            <img src={Sound} alt="Sounds" className="ml-1" />
            <p className="text-[14px] font-semibold">Notifications</p>
          </div>
          <Toggle />
        </div>
        <hr className="text-[#cccccc]" />
        <div className="flex items-center justify-between mb-4 mt-4">
          <div className="flex items-center gap-2">
            <img src={Play} alt="Play" />
            <p className="text-[14px] font-semibold">Vacation Mode</p>
          </div>
          <Toggle />
        </div>
      </div>
    );
  };

  const AboutSection = () => {
    return (
      <div className="bg-white pt-5 pb-1 px-4 rounded-2xl border border-[#CCCCCC]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src={Star} alt="Star" />
            <p className="text-[14px] font-semibold">Rate Routiner</p>
          </div>
          <ChevronRight />
        </div>
        <hr className="text-[#cccccc]" />
        <div className="flex items-center justify-between mb-4 mt-4">
          <div className="flex items-center gap-2">
            <img src={Share} alt="Share" />
            <p className="text-[14px] font-semibold">Share with Friends</p>
          </div>
          <ChevronRight />
        </div>
        <hr className="text-[#cccccc]" />
        <div className="flex items-center justify-between mb-4 mt-4">
          <div className="flex items-center gap-2">
            <img src={Info} alt="Info" />
            <p className="text-[14px] font-semibold">About Us</p>
          </div>
          <ChevronRight />
        </div>
        <hr className="text-[#cccccc]" />
        <div className="flex items-center justify-between mb-4 mt-4">
          <div className="flex items-center gap-2">
            <img src={Chat} alt="Chat" />
            <p className="text-[14px] font-semibold">Support</p>
          </div>
          <ChevronRight />
        </div>
        <hr className="text-[#cccccc]" />
        <div className="flex items-center justify-between mb-4 mt-4">
          <div className="flex items-center gap-2">
            <img src={Premium} alt="Premium" />
            <p className="text-[14px] font-semibold">Premium</p>
          </div>
          <ChevronRight />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-display bg-[#F8F3F3] pt-12 px-4">
      <div className="flex items-center gap-2">
        <ChevronLeft
          size={40}
          onClick={() => {
            navigate(-1);
          }}
        />
        <p className="text-3xl font-bold">Settings</p>
      </div>
      <br />
      <div className="px-3 space-y-2">
        <p className="text-[#9B9BA1] font-medium text-[10px]">GENERAL</p>
        <GeneralSection />
      </div>
      <br />
      <div className="px-3 space-y-2">
        <p className="text-[#9B9BA1] font-medium text-[10px]">ABOUT US</p>
        <AboutSection />
      </div>
    </div>
  );
};

export default SettingsPage;
