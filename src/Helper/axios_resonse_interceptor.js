import axios from "axios";
import { getToken, removeSessions } from "./SessionHelper";
import { BaseURL } from "./Config";


// create axios instance
const api = axios.create({
  baseURL: BaseURL,
  headers: {
    token: getToken(),
  },
});

// request interceptor (optional, token refresh etc.)
api.interceptors.request.use(
  config => {
    config.headers.token = getToken(); // latest token set
    return config;
  },
  error => Promise.reject(error)
);

// response interceptor
api.interceptors.response.use(
  response => response, // normal response return
  error => {
    // centralized check for Unauthorized
    if (error.response?.data?.status === "Unauthorized") {
      removeSessions(); // token expired → logout
    }
    return Promise.reject(error); // baki errors normal throw hobe
  }
);

export default api;