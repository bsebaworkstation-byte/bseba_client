import React from "react";
import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from "date-fns";

const TimeAgo = ({ date }) => {
  const now = new Date();
  const targetDate = new Date(date);

  const mins = differenceInMinutes(now, targetDate);
  const hours = differenceInHours(now, targetDate);
  const days = differenceInDays(now, targetDate);
  const months = differenceInMonths(now, targetDate);
  const years = differenceInYears(now, targetDate);

  let text = "";
  let colorClass = "text-gray-500";

  if (mins < 60) {
    text = `${mins} m ago`;
    colorClass = "text-green-500";
  } else if (hours < 24) {
    text = `${hours} H ago`;
    colorClass = "text-blue-500";
  } else if (days < 30) {
    text = `${days} D ago`;
    colorClass = "text-yellow-500";
  } else if (months < 12) {
    text = `${months} Mo ago`;
    colorClass = "text-orange-500";
  } else {
    text = `${years} Y ago`;
    colorClass = "text-red-500";
  }

  return <span className={colorClass}>{text}</span>;
};

export default TimeAgo;
