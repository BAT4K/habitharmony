import { useState } from "react";

export default function Toggle() {
  const [isChecked1, setIsChecked1] = useState(true);

  return (
    <label className="relative inline-block w-14 h-8 cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        checked={isChecked1}
        onChange={() => setIsChecked1(!isChecked1)}
      />
      <span
        className={`block w-full h-full rounded-full transition-all duration-200 ${
          isChecked1 ? "bg-green-500" : "bg-gray-300"
        }`}
      ></span>
      <span
        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-all duration-300 ${
          isChecked1 ? "translate-x-6" : ""
        }`}
      ></span>
    </label>
  );
}
