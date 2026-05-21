import { create } from "zustand";

const useLanguageStore = create((set) => ({
  lang: localStorage.getItem("lang") || "en",
  setLang: (language) => {
    localStorage.setItem("lang", language);
    set({ lang: language });
  }
}));

export default useLanguageStore;
