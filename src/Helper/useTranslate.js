// utils/useTranslate.js
import { menuText } from "../TranslationText/TranslateMasterLayout";
import useLanguageStore from "../Zustand/languageStore";

export const useTranslate = () => {
  const { lang } = useLanguageStore();

  return (key) => menuText[key]?.[lang] || key;
};
