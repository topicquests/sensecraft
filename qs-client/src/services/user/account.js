import { Notify } from "quasar";
import feathersClient from "../../boot/feathersClient";
import axiosInstance from "../../boot/axios";

export async function login(email, password) {
  return feathersClient.service("auth").post({
    strategy: "local",
    email: email,
    password: password
  });
}

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

export async function verifyAccount(token) {
  return axiosInstance.post("/authManagement", {
    action: "verifySignupLong",
    value: token
  });
}