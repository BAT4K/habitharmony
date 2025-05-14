import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatbotAssistant from '../components/ChatbotAssistant';
import { Capacitor } from '@capacitor/core';

const AssistantPage = () => {
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
  
  const handleClose = () => {
    navigate('/homescreen');
  };

  return (
    <div className="min-h-screen bg-[#F8F3F3]">
      <ChatbotAssistant onClose={handleClose} />
    </div>
  );
};

export default AssistantPage;