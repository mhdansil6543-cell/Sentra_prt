import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? "http://127.0.0.1:8000/api/v1"
    : "https://sentra-prt.onrender.com/api/v1",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;