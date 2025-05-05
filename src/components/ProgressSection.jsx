import React from "react";
import ProgressCard from "./ProgressCard";

const ProgressSection = () => {
  const data = [
    {
      icon: "https://storage.googleapis.com/a1aa/image/GoDZK5NYXtYbEGfsUTWeF0sgVEPK-bWKN_12cxRu2oU.jpg",
      title: "Walk",
      goal: "10 km",
      progress: 19,
    },
    {
      icon: "https://storage.googleapis.com/a1aa/image/GoDZK5NYXtYbEGfsUTWeF0sgVEPK-bWKN_12cxRu2oU.jpg",
      title: "Run",
      goal: "5 km",
      progress: 50,
    },
  ];

  return (
    <div className="flex items-center justify-center bg-gray-100 space-x-4">
      {data.map((item, index) => (
        <ProgressCard key={index} {...item} />
      ))}
    </div>
  );
};

export default ProgressSection;
