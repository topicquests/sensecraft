import axios from "axios";
import { LoadingBar } from "quasar";

LoadingBar.setDefaults({
  color: "secondary",
  size: "15px",
  position: "top",
});

export const axiosInstance = axios.create({ baseURL: server_url });

//axiosInstance.defaults.withCredentials = true;
axiosInstance.interceptors.request.use(
  function (config) {
    LoadingBar.start();
    return config;
  },
  function (error) {
    LoadingBar.stop();

    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  function (response) {
    LoadingBar.stop();
    return response;
  },
  function (error) {
    LoadingBar.stop();
    return Promise.reject(error);
  }
);

// Vue.prototype.$axiosInstance = axiosInstance;
