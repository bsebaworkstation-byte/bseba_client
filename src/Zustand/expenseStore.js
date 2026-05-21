import { create } from "zustand";

const expenseStore = create((set) => ({
  refresh: false,
  toggleRefresh: () => set((s) => ({ refresh: !s.refresh }))
}));

export default expenseStore;
