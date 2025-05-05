import React from "react";
import HabitCard from "./HabitCard";
import bottle from "../assets/bottle.png";
import trophy from "../assets/Trophy.png";

const HabitSection = () => {
  const habits = [
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
  ];

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
          />
        ))}
      </div>
    </div>
  );
};

export default HabitSection;
