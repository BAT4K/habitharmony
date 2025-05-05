import React, { useState } from 'react';
import { ChevronLeft, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAQPage = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { type: 'bot', text: "Hello! I'm your Habit Harmony Assistant. How can I help you today?", options: [
            "Habit Formation & Productivity",
            "Motivation & Mindset",
            "Time Management & Scheduling",
            "Health & Well-being",
            "Breaking Bad Habits",
            "Personalized Advice & Reflection"
        ]}
    ]);

    const faqData = {
        "Habit Formation & Productivity": [
            "How can I stay consistent with my habits?",
            "What are some good morning routines?",
            "How long does it take to form a new habit?",
            "How can I stop procrastinating?"
        ],
        "Motivation & Mindset": {
            "How do I stay motivated to achieve my goals?":
                "Set clear, achievable goals, visualize success, track progress, and remind yourself why you started. Create a support system and celebrate small victories.",
            "What should I do if I feel like giving up?":
                "Take a step back, review your progress, adjust your goals if needed, and remember that setbacks are normal. Focus on why you started and take small steps forward.",
            "How do I develop a growth mindset?":
                "Embrace challenges, learn from failures, focus on the process rather than just outcomes, and replace 'I can't' with 'I can't yet.'"
        },
        // Add other categories and their QAs here
    };

    const answers = {
        "How can I stay consistent with my habits?": 
            "Start small, track your progress daily, and celebrate small wins. Consistency comes from making your habit easy to do and connecting it with existing routines.",
        "What are some good morning routines?":
            "A effective morning routine includes: wake up at the same time daily, drink water, exercise or stretch, meditate for 5-10 minutes, and plan your day.",
        "How long does it take to form a new habit?":
            "On average, it takes 21-66 days to form a new habit. The key is consistency rather than perfection. Focus on making small, sustainable changes.",
        "How can I stop procrastinating?":
            "Break tasks into smaller chunks, use the 5-minute rule (start for just 5 minutes), eliminate distractions, and reward yourself for completing tasks."
    };

    const handleCategoryClick = (category) => {
        setMessages([...messages, 
            { type: 'user', text: category },
            { type: 'bot', text: "Here are some common questions about " + category + ":", options: faqData[category] }
        ]);
    };

    const handleQuestionClick = (question) => {
        setMessages([...messages,
            { type: 'user', text: question },
            { type: 'bot', text: answers[question], options: ['Ask another question'] }
        ]);
    };

    const handleReset = () => {
        setMessages([messages[0]]);
    };

    return (
        <div className="min-h-screen bg-[#F8F3F3]">
            <div className="flex items-center p-4 bg-white shadow-sm">
                <ChevronLeft 
                    className="cursor-pointer" 
                    onClick={() => navigate(-1)}
                />
                <h1 className="text-xl font-semibold ml-4">AI Assistant</h1>
            </div>

            <div className="p-4 pb-32 max-w-2xl mx-auto">
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div key={index}>
                            {message.type === 'bot' ? (
                                <div className="flex items-start space-x-2 mb-4">
                                    <div className="bg-[#914938] rounded-full p-2">
                                        <Bot className="text-white" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm">
                                            {message.text}
                                        </div>
                                        {message.options && (
                                            <div className="mt-2 space-y-2">
                                                {message.options.map((option, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => option === 'Ask another question' ? handleReset() : 
                                                            faqData[option] ? handleCategoryClick(option) : handleQuestionClick(option)}
                                                        className="block w-full text-left p-3 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-end mb-4">
                                    <div className="bg-[#914938] text-white p-4 rounded-2xl max-w-[80%]">
                                        {message.text}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQPage;