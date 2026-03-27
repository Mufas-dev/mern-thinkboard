import axios from "axios";

const envBaseUrl = import.meta.env.VITE_API_URL;

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : envBaseUrl || "/api";

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;
