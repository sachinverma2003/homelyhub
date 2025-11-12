import axios from "axios";
import qs from "qs";

// ✅ The VITE_API_URL should point to your Render backend
// Example: https://homelyhub-s6uq.onrender.com (not the old izba one)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // ✅ Uses environment variable dynamically
  withCredentials: true, // ✅ Needed for cookies (JWT/session)
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});

console.log("🔗 API Base URL in use:", API_BASE_URL);
