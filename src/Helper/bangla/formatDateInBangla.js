const formatDateToLocalInBangla = (date) => {
  if (!date) return "";
  const d = new Date(date);

  // বাংলা সংখ্যায় রূপান্তরের জন্য হেল্পার
  const toBn = (n) =>
    new Intl.NumberFormat("bn-BD", { useGrouping: false })
      .format(n)
      .padStart(2, "0");
  const toBnYear = (n) =>
    new Intl.NumberFormat("bn-BD", { useGrouping: false }).format(n);

  const day = toBn(d.getDate());
  const month = toBn(d.getMonth() + 1);
  const year = toBnYear(d.getFullYear());

  let hours = d.getHours();
  const minutes = toBn(d.getMinutes());

  // AM/PM নির্ধারণ এবং সময়কাল বাংলায়
  let period = "";
  if (hours >= 0 && hours < 6) period = "রাত";
  else if (hours >= 6 && hours < 12) period = "সকাল";
  else if (hours >= 12 && hours < 16) period = "দুপুর";
  else if (hours >= 16 && hours < 18) period = "বিকাল";
  else period = "সন্ধ্যা/রাত";

  // ১২ ঘণ্টার ফরম্যাট
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursBn = toBn(hours);

  return `${day}-${month}-${year} ${period} ${hoursBn}:${minutes}`;
};

export default formatDateToLocalInBangla;
