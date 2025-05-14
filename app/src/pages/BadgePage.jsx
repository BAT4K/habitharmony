import React, { useEffect } from "react";
import bgImage from "../assets/badgeScreen.webp";
import { ChevronLeft } from "lucide-react";
import { Capacitor } from '@capacitor/core';

const BadgePage = () => {
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
    <div
      className="min-h-screen bg-[#F8F3F3] font-display pt-10 px-6 flex flex-col justify-between"
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
