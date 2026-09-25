import axios from "axios";


// Creating an AXIOS Instance
const api = axios.create({
  baseURL: "http://localhost:5005/api",
});

export default api;