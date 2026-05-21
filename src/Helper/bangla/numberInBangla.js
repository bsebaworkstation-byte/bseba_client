export const formatNumberToBangla = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "0.00";

  return new Intl.NumberFormat("bn-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true, 
  }).format(num);
};
