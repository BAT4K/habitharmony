import React, { useState } from "react";
import HabitCard from "./HabitCard";
import bottle from "../assets/bottle.png";
import trophy from "../assets/Trophy.png";
import CelebrationPopup from "./CelebrationPopup";

const HabitSection = () => {
  const [habits, setHabits] = useState([
    {
      habit: "no cigarettes",
      streak: "5",
      action: "streak!",
      goal: "21",
      image: trophy,
      color: "#914938",
    },
    {
      habit: "Water intake",
      streak: "2",
      action: "glasses",
      goal: "8",
      image: bottle,
      color: "#3B82F6",
    },
    {
      habit: "Water intake",
      streak: "2",
      action: "glasses",
      goal: "8",
      image: bottle,
      color: "#3B82F6",
    }
  ]);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleIncrement = (index) => {
    setHabits(prevHabits => prevHabits.map((habit, i) => {
      if (i === index) {
        const newStreak = parseInt(habit.streak) + 1;
        if (newStreak === parseInt(habit.goal)) {
          setTimeout(() => setShowCelebration(true), 100);
          return { ...habit, streak: "0" };
        }
        return { ...habit, streak: newStreak.toString() };
      }
      return habit;
    }));
  };

  return (
    <div className="w-full overflow-x-scroll whitespace-nowrap">
      <div className="flex gap-6">
        {habits.map((habit, index) => (
          <HabitCard
            key={index}
            habit={habit.habit}
            streak={habit.streak}
            action={habit.action}
            goal={habit.goal}
            image={habit.image}
            color={habit.color}
            onIncrement={() => handleIncrement(index)}
          />
        ))}
      </div>
      <CelebrationPopup 
        isOpen={showCelebration} 
        onClose={() => setShowCelebration(false)} 
      />
    </div>
  );
};

export default HabitSection;
