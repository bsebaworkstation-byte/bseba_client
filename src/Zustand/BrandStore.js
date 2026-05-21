import { create } from "zustand";

const brandStore = create((set) => ({
  brands: [],
  setBrands: (brands) => {
    set({ brands });
  },
}));

export default brandStore;
