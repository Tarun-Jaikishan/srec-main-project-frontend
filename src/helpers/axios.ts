import axios from "axios";

const axV1 = axios.create({
  baseURL: `${import.meta.env.VITE_API_LINK}/v1`,
  // withCredentials: true,
});

axV1.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { axV1 };
