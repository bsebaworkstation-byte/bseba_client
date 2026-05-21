export const numberToWordsInBangla = (num = 0) => {
  if (num === null || num === undefined || isNaN(num) || num === 0) {
    return "শূন্য টাকা মাত্র";
  }

  const words = [
    "", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ",
    "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোল", "সতেরো", "আঠারো", "ঊনিশ",
    "বিশ", "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আটাশ", "ঊনত্রিশ",
    "ত্রিশ", "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাঁইত্রিশ", "আটত্রিশ", "ঊনচল্লিশ",
    "চল্লিশ", "একচল্লিশ", "বিয়াল্লিশ", "তেতাল্লিশ", "চৌয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "সাতচল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ",
    "পঞ্চাশ", "একান্ন", "বাহান্ন", "তিপ্পান্ন", "চুয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতান্ন", "আটান্ন", "ঊনষাট",
    "ষাট", "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর",
    "সত্তর", "একাত্তর", "বাহাত্তর", "তিয়াত্তর", "চুয়াত্তর", "পঁচাত্তর", "ছেয়াত্তর", "সাতাত্তর", "আটাত্তর", "ঊনআশি",
    "আশি", "একাশি", "বিরাশি", "তিরাশি", "চুরাশি", "পঁচাশি", "ছিয়াশি", "সাতাশি", "আটাশি", "ঊননব্বই",
    "নব্বই", "একানব্বই", "বিরানব্বই", "তিরানব্বই", "চুরানব্বই", "পঁচানব্বই", "ছিয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই"
  ];

  const twoDigitBangla = (n) => {
    if (n < 100) return words[n];
    return "";
  };

  const inWords = (n) => {
    n = Math.floor(n);
    if (n === 0) return "";

    if (n < 100) return twoDigitBangla(n);

    if (n < 1000) {
      const hundreds = Math.floor(n / 100);
      const remainder = n % 100;
      return words[hundreds] + " শত" + (remainder ? " " + twoDigitBangla(remainder) : "");
    }

    if (n < 100000) {
      const thousands = Math.floor(n / 1000);
      const remainder = n % 1000;
      return inWords(thousands) + " হাজার" + (remainder ? " " + inWords(remainder) : "");
    }

    if (n < 10000000) {
      const lakhs = Math.floor(n / 100000);
      const remainder = n % 100000;
      return inWords(lakhs) + " লক্ষ" + (remainder ? " " + inWords(remainder) : "");
    }

    const crores = Math.floor(n / 10000000);
    const remainder = n % 10000000;
    return inWords(crores) + " কোটি" + (remainder ? " " + inWords(remainder) : "");
  };

  const amount = parseFloat(num).toFixed(2);
  const [taka, poishaPart] = amount.split(".");
  const poisha = parseInt(poishaPart);

  let result = "";

  if (parseInt(taka) > 0) {
    result += inWords(parseInt(taka)).trim() + " টাকা";
  }

  if (poisha > 0) {
    result += (result ? " এবং " : "") + words[poisha].trim() + " পয়সা";
  }

  return result ? result.replace(/\s+/g, ' ').trim() + " মাত্র" : "শূন্য টাকা মাত্র";
};
