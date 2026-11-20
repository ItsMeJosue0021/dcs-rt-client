// src/config/constants.js
export const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://dcs-rt-api-production.up.railway.app"
);
export const STATUS_OPTIONS = [
  { value: "MOR", label: "MOR" },
  { value: "Part A", label: "Part A" },
  { value: "Part B", label: "Part B" },
  { value: "Finished", label: "Finished" },
];

export const EMPTY_FORM = {
  title: "",
  type: "Capstone",
  authors: "",
  abstract: "",
  description: "",
  adviser: "",
  critic: "",
  academic_year: "",
  status: "MOR",
  website_url: "",
};
