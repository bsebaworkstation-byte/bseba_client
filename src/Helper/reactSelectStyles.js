// src/Helper/reactSelectStyles.js
export const getReactSelectStyles = () => ({
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  option: (base) => ({
    ...base,
    color: document.documentElement.classList.contains("dark") ? "#ffffff" : "#111827",
    backgroundColor: document.documentElement.classList.contains("dark") ? "#111827" : "#ffffff",
  }),
  input: (base) => ({
    ...base,
    color: document.documentElement.classList.contains("dark") ? "#ffffff" : "#111827",
  }),
  singleValue: (base) => ({
    ...base,
    color: document.documentElement.classList.contains("dark") ? "#ffffff" : "#111827",
  }),
  placeholder: (base) => ({
    ...base,
    color: document.documentElement.classList.contains("dark") ? "#9ca3af" : "#6b7280",
  }),
});
