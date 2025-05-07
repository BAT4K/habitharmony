import React, { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Bot } from "lucide-react";

const ChatBubble = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex items-start ${isUser ? "flex-row-reverse" : ""}`}>
        {!isUser && (
          <div className="bg-[#914938] text-white p-2 rounded-full mr-2">
            <Bot size={20} />
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl max-w-xs sm:max-w-md ${
            isUser
              ? "bg-[#3B82F6] text-white rounded-bl-2xl"
              : "bg-white border border-gray-200 text-gray-800 rounded-br-2xl"
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>
        {isUser && (
          <div className="bg-[#3B82F6] text-white p-2 rounded-full ml-2">
            <div className="w-5 h-5 flex items-center justify-center text-xs font-bold">
              U
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const QuickOption = ({ text, onClick }) => {
  return (
    <button
      onClick={() => onClick(text)}
      className="bg-white border border-gray-300 text-[#914938] px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap mb-2 mr-2"
    >
      {text}
    </button>
  );
};

const ChatbotAssistant = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your Habit Harmony Assistant. How can I help you today?",
      isUser: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [quickOptions, setQuickOptions] = useState([
    "Habit Formation & Productivity",
    "Motivation & Mindset",
    "Time Management & Scheduling",
    "Health & Well-being",
    "Breaking Bad Habits",
    "Personalized Advice & Reflection",
  ]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const messagesEndRef = useRef(null);

  const categoryQuestions = {
    "Habit Formation & Productivity": [
      "How can I stay consistent with my habits?",
      "What are some good morning routines?",
      "How long does it take to form a new habit?",
      "How can I stop procrastinating?",
    ],
    "Motivation & Mindset": [
      "How can I stay motivated?",
      "What should I do when I feel like giving up?",
      "How do I build a growth mindset?",
      "Tips for positive thinking",
    ],
    "Time Management & Scheduling": [
      "How do I create an effective schedule?",
      "What's the Pomodoro technique?",
      "How can I balance multiple priorities?",
      "Tips for reducing distractions",
    ],
    "Health & Well-being": [
      "How much water should I drink daily?",
      "Tips for better sleep",
      "How can I reduce stress?",
      "Simple exercises for desk workers",
    ],
    "Breaking Bad Habits": [
      "How do I break a bad habit?",
      "What's the best way to quit smoking?",
      "How can I reduce screen time?",
      "Strategies for emotional eating",
    ],
    "Personalized Advice & Reflection": [
      "How do I assess my progress?",
      "When should I adjust my goals?",
      "How can I reflect on my habits effectively?",
      "Setting realistic expectations",
    ],
  };

  // Simulated AI response generator with relevant habit advice
  const generateAIResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    
    // Responses for category questions
    if (lowerMsg.includes("stay consistent")) {
      return "To stay consistent with habits, try these proven strategies:\n\n1. Start with tiny habits that are easy to maintain\n2. Use habit stacking (link new habits to existing ones)\n3. Track your progress visually\n4. Set up environmental triggers\n5. Find an accountability partner\n\nWhich habit are you currently working on?";
    } else if (lowerMsg.includes("morning routine")) {
      return "Effective morning routines typically include:\n\n• Hydrating first thing after waking\n• Movement/exercise (even just 5-10 minutes)\n• Mindfulness practice or gratitude journaling\n• Planning your top priorities for the day\n• Nutritious breakfast\n\nWould you like help designing a specific morning routine for your needs?";
    } else if (lowerMsg.includes("form a new habit")) {
      return "Research shows forming a new habit takes anywhere from 18 to 254 days, with 66 days being the average. The key factors are:\n\n• Consistency (doing it daily)\n• Starting tiny (making it easy to succeed)\n• Clear cue-routine-reward loop\n• Tracking progress\n• Environmental design\n\nWhat new habit are you trying to form?";
    } else if (lowerMsg.includes("procrastinat")) {
      return "To overcome procrastination:\n\n1. Break tasks into smaller chunks\n2. Use the 5-minute rule (just start for 5 minutes)\n3. Eliminate distractions during focus periods\n4. Use the Pomodoro technique (25 min work, 5 min break)\n5. Create external accountability\n\nWhich specific task are you procrastinating on?";
    } else if (lowerMsg.includes("stay motivated")) {
      return "To maintain motivation:\n\n• Connect your habits to your deeper values and goals\n• Track progress visually to see how far you've come\n• Build a streak and don't break the chain\n• Join communities with similar goals\n• Celebrate small wins regularly\n\nWhat specific goal are you working toward?";
    } else if (lowerMsg.includes("water")) {
      return "For optimal hydration, the general guideline is about 8 glasses (64 oz) of water daily, but individual needs vary based on:\n\n• Activity level\n• Climate\n• Body size\n• Health conditions\n\nWould you like to set up water intake reminders in the app?";
    } else if (lowerMsg.includes("sleep")) {
      return "For better sleep quality:\n\n• Maintain consistent sleep/wake times\n• Create a relaxing bedtime routine\n• Avoid screens 1 hour before bed (blue light)\n• Keep your bedroom cool, dark, and quiet\n• Limit caffeine after noon and alcohol near bedtime\n\nWhich aspect of sleep are you struggling with?";
    } else if (lowerMsg.includes("quit") && lowerMsg.includes("smoking")) {
      return "Quitting smoking effectively often requires a multi-faceted approach:\n\n• Consider nicotine replacement therapy\n• Identify and avoid triggers\n• Create new habits to replace smoking\n• Join support groups\n• Use the app to track your smoke-free streak\n\nWould you like to set up a smoking cessation plan in the app?";
    } else if (lowerMsg.includes("schedule") || lowerMsg.includes("time management")) {
      return "For effective scheduling:\n\n• Time-block your day into focused segments\n• Schedule important tasks during your peak energy times\n• Include buffer time between activities\n• Batch similar tasks together\n• Set realistic time estimates (add 50% more time)\n\nWould you like to integrate this with your calendar?";
    } else {
      return "I understand you're interested in " + userMessage + ". This is an important aspect of building healthy habits. Could you tell me more specifically what you're trying to achieve?";
    }
  };

  const handleSend = () => {
    if (input.trim() === "") return;
    
    const newUserMessage = { text: input, isUser: true };
    setMessages([...messages, newUserMessage]);
    setInput("");
    
    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = { 
        text: generateAIResponse(input), 
        isUser: false 
      };
      setMessages(prev => [...prev, aiResponse]);
      
      // Reset to main menu after answering a specific question
      if (selectedCategory) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev, 
            { 
              text: "Would you like to explore another topic?", 
              isUser: false 
            }
          ]);
          setSelectedCategory(null);
          setQuickOptions([
            "Habit Formation & Productivity",
            "Motivation & Mindset",
            "Time Management & Scheduling",
            "Health & Well-being",
            "Breaking Bad Habits",
            "Personalized Advice & Reflection",
          ]);
        }, 1000);
      }
    }, 800);
  };

  const handleQuickOption = (option) => {
    // Handle category selection
    if (!selectedCategory && categoryQuestions[option]) {
      setSelectedCategory(option);
      
      const newUserMessage = { text: option, isUser: true };
      setMessages([...messages, newUserMessage]);
      
      setTimeout(() => {
        const aiResponse = { 
          text: `Here are some common questions about ${option}:`, 
          isUser: false 
        };
        setMessages(prev => [...prev, aiResponse]);
        setQuickOptions(categoryQuestions[option] || []);
      }, 500);
    } 
    // Handle specific question selection
    else if (selectedCategory) {
      const userQuestion = { text: option, isUser: true };
      setMessages([...messages, userQuestion]);
      
      setTimeout(() => {
        const aiResponse = { 
          text: generateAIResponse(option), 
          isUser: false 
        };
        setMessages(prev => [...prev, aiResponse]);
        
        // After answering, return to main menu with slight delay
        setTimeout(() => {
          setMessages(prev => [
            ...prev, 
            { 
              text: "Would you like to explore another topic?", 
              isUser: false 
            }
          ]);
          setSelectedCategory(null);
          setQuickOptions([
            "Habit Formation & Productivity",
            "Motivation & Mindset",
            "Time Management & Scheduling",
            "Health & Well-being",
            "Breaking Bad Habits",
            "Personalized Advice & Reflection",
          ]);
        }, 1000);
      }, 800);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-[#F8F3F3]">
      {/* Header */}
      <div className="flex items-center bg-[#914938] text-white p-4">
        <button onClick={onClose} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center">
          <Bot className="mr-2" size={24} />
          <div>
            <h1 className="font-bold">Habit Harmony Assistant</h1>
            <p className="text-xs opacity-80">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#F8F3F3]">
        {messages.map((message, index) => (
          <ChatBubble key={index} message={message} isUser={message.isUser} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Options */}
      <div className="p-2 bg-[#F8F3F3] border-t border-gray-200 overflow-x-auto">
        <div className="flex flex-wrap">
          {quickOptions.map((option, index) => (
            <QuickOption key={index} text={option} onClick={handleQuickOption} />
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-[#F8F3F3]">
        <div className="flex items-center bg-white rounded-full px-4 py-2 border border-gray-300">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`ml-2 ${
              !input.trim() ? "text-gray-400" : "text-[#914938]"
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotAssistant;