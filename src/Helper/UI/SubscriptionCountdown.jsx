import React, { useEffect, useState } from "react";
import { getBusinessDetails, setBusinessDetails } from "../SessionHelper";
import { useNavigate } from "react-router-dom";

const SubscriptionCountdown = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({});
  // Example: getBusinessDetails().endDate
  const endDateStr = getBusinessDetails().endDate; // "2025-10-27T02:33:27.746Z"
  //   const endDateStr = "2025-11-27T02:33:27.746Z";
  const endDate = new Date(endDateStr);

  useEffect(() => {
    const now = new Date();
    const endDateStr = getBusinessDetails().endDate;

    if (!endDateStr) {
      // setBusinessDetails("");
      navigate("/Payment");
    }
    const endDate = new Date(endDateStr);
    // console.log(now);
    // console.log(endDate);

    if (endDate < now) {
      // setBusinessDetails("");
      navigate("/Payment");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const difference = endDate - now; // milliseconds

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        // Countdown finished
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <h6 className="text-xs px-2 font-blod">
      <span className="text-green-400">{timeLeft.days}d</span>-
      <span className="text-blue-400"> {timeLeft.hours}h</span>-
      <span className="text-fuchsia-500 pl-1">{timeLeft.minutes}m</span>-
      <span className="text-red-500">{timeLeft.seconds}s</span>
    </h6>
  );
};

export default SubscriptionCountdown;
