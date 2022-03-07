import getStore from "../store";
import { axiosInstance } from "./axios";

const store = getStore(axiosInstance);

export default store;
