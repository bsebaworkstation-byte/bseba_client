export const formatCurrency = (amount, decimals = 2) => {
  if (!amount || isNaN(amount)) amount = 0;

  return (
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  );
};