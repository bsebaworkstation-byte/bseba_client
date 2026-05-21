import useLanguageStore from "../Zustand/languageStore";

export const useTextTranslate = (dictionary) => {
  const { lang } = useLanguageStore();

  return (key) => dictionary?.[key]?.[lang] || key;
};
