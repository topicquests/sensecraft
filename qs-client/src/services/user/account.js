import { Notify } from "quasar";
import feathersClient from "../../boot/feathersClient";
import axiosInstance from "../../boot/axios";

export async function signup(firstname, lastname, email, password, handle) {
  return axiosInstance
    .post("/users", {
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: password,
      handle: handle 
    }); 
}
