// utils/dateRangeHelper.js

export const startOfDay = (d) => {
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfDay = (d) => {
  d.setHours(23, 59, 59, 999);
  return d;
};

// helper: Saturday = 6
export const getDiffFromSaturday = (day) => {
  return (day + 1) % 7; 
};

// Main reusable function
export const getDateRange = (option) => {
  const now = new Date();
  let start, end;

  switch (option) {

    case "Today":
      start = startOfDay(new Date(now));
      end = endOfDay(new Date(now));
      break;

    case "Last 30 Days":
      start = startOfDay(new Date(now));
      start.setDate(now.getDate() - 30);
      end = endOfDay(new Date(now));
      break;

    case "This Year":
      // January 1 this year → today
      start = startOfDay(new Date(now.getFullYear(), 0, 1));
      end = endOfDay(new Date(now));
      break;

    case "Last Year":
      // January 1 last year → December 31 last year
      start = startOfDay(new Date(now.getFullYear() - 1, 0, 1));
      end = endOfDay(new Date(now.getFullYear() - 1, 11, 31));
      break;

    case "This Month":
      start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      end = endOfDay(new Date(now));
      break;

    case "This Week":
      const diff = getDiffFromSaturday(now.getDay());
      start = startOfDay(new Date(now));
      start.setDate(now.getDate() - diff);
      end = endOfDay(new Date(now));
      break;

    case "Last Week":
      const diff2 = getDiffFromSaturday(now.getDay());
      end = endOfDay(new Date(now));
      end.setDate(now.getDate() - diff2 - 1); // last week's Friday
      start = startOfDay(new Date(end));
      start.setDate(end.getDate() - 6);
      break;

    case "Last Month":
      start = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      break;

    default:
      start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      end = endOfDay(new Date(now));
  }

  return { start, end };
};
