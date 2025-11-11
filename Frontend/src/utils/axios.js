import axios from "axios";
import qs from "qs";

// The VITE_API_URL is the Render URL (e.g., https://homelyhub-izba.onrender.com)
// If the variable is not set (i.e., running locally), it defaults to your local backend.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const axiosInstance = axios.create({
  // Use the dynamic URL
  baseURL: API_BASE_URL, 
  withCredentials: true,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
});