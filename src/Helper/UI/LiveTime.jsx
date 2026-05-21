import React, { useEffect, useState } from "react";
import { IoSunnyOutline, IoMoon } from "react-icons/io5";

const LiveTime = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(() => {
    // Check if dark mode preference is saved in sessionStorage
    const savedMode = sessionStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle dark mode toggle and persistence
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save preference to sessionStorage
    sessionStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div className="flex items-center justify-between text-md font-semibold w-[20vw] dark:text-gray-300">
      {/* Time */}
      <h1 className="flex gap-2 py-1 items-center">
        <span>{dateTime.toLocaleTimeString()}</span>
      </h1>
      {/* Date */}
      <span>
        {String(dateTime.getDate()).padStart(2, "0")}-
        {String(dateTime.getMonth() + 1).padStart(2, "0")}-
        {dateTime.getFullYear()}
      </span>
      <button
        className="border rounded-full p-1 text-lg hover:scale-105"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? <IoSunnyOutline /> : <IoMoon />}
      </button>
    </div>
  );
};

export default LiveTime;
