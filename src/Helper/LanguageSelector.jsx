import React from "react";
import useLanguageStore from "../Zustand/languageStore";

const LanguageSelector = () => {
  const { lang, setLang } = useLanguageStore();

  const handleChange = (e) => {
    setLang(e.target.value);
  };

  const language = [
    {
      value: "en",
      text: "English",
    },
    {
      value: "bn",
      text: "বাংলা",
    },
  ];
  return (
    <select value={lang} onChange={handleChange} className="global_dropdown">
      {language.map((item, index) => (
        <option  value={item?.value}>{item?.text}</option>
      ))}
    </select>
  );
};

export default LanguageSelector;
