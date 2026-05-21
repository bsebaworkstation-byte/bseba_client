import { create } from "zustand";

const loadingStore = create((set) => ({
  globalLoader: false,
  setGlobalLoader: (val) => {
    set({ globalLoader: val });
  },
}));

export default loadingStore;
