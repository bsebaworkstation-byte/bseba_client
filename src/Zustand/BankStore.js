import { create } from "zustand";
const bankStore = create((set) => ({
  banks: [],
  setBanks: (banks) => {
    set({ banks });
  },
}));

export default bankStore;
