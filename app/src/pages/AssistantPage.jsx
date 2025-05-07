import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatbotAssistant from '../components/ChatbotAssistant';

const AssistantPage = () => {
  const navigate = useNavigate();
  
  const handleClose = () => {
    navigate('/homescreen');
  };

  return (
    <div className="min-h-screen bg-white">
      <ChatbotAssistant onClose={handleClose} />
    </div>
  );
};

export default AssistantPage;