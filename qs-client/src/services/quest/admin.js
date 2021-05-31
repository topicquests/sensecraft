import { Notify } from "quasar";
import feathersClient from "../../boot/feathersClient";
import axiosInstance from "../../boot/axios";

export async function getQuests(opts) {
    
    return axiosInstance.get("quest", "find");
  }