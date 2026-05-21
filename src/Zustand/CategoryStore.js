import { create } from "zustand";

const categoryStore = create((set) => ({
  categories: [],
  setCategories: (categories) => {
    set({ categories });
  },
}));

export default categoryStore;
