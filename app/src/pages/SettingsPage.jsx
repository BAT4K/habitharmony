import React, { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import General from "../assets/General.webp";
import Dark from "../assets/DarkMode.webp";
import Toggle from "../components/Toggle";
import Security from "../assets/Security.webp";
import Notification from "../assets/Notification.webp";
import Sound from "../assets/Sound.webp";
import Play from "../assets/Play.webp";
import Star from "../assets/Star.webp";
import Share from "../assets/Share.webp";
import Premium from "../assets/Premium.webp";
import Info from "../assets/Info.webp";
import Chat from "../assets/Chat.webp";
import { useNavigate } from "react-router-dom";
import { Capacitor } from '@capacitor/core';
import GeneralSection from "../components/GeneralSection";

const SettingsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
      import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
        StatusBar.setBackgroundColor({ color: '#F8F3F3' });
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setNavigationBarColor({ color: '#FFFFFF' });
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#F8F3F3');
      });
    }
  }, []);

  return (
    <div className="min-h-screen font-display bg-[#F8F3F3] px-4">
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
    </div>
  );
};

export default SettingsPage;
