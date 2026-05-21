import { create } from "zustand";

const customerStore = create((set) => ({
  customers: [],
  setCustomers: (customers) => {
    set({ customers });
  },
}));

export default customerStore;
