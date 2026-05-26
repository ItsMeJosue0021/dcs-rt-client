// src/config/constants.js
export const API_URL =
  import.meta.env.VITE_API_URL || "https://dcs-rt-api-production.up.railway.app";

export const STATUS_OPTIONS = [
  { value: "MOR", label: "MOR" },
  { value: "Part A", label: "Part A" },
  { value: "Part B", label: "Part B" },
  { value: "Finished", label: "Finished" },
];

export const EMPTY_FORM = {
  title: "",
  authors: "",
  abstract: "",
  adviser: "",
  critic: "",
  status: "MOR",
  website_url: "",
};
