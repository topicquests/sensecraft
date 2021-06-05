import { Notify } from "quasar";
import feathersClient from "../../boot/feathersClient";
import axiosInstance from "../../boot/axios";


export async function signup(name, email, password, handle) {
  return axiosInstance
    .post("/users", {
      name: name,
      email: email,
      password: password,
      handle: handle
    });
}
