import axios from "axios";


// Creating an AXIOS Instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5005/api",
  withCredentials: true
});

export default api;
