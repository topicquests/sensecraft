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
<<<<<<< HEAD
  return axiosInstance
    .post("/users", {
      firstname: firstname,
      lastname: lastname,
      email: email,
=======
  return axiosInstance.post("/users", {
    firstname: firstname,
    lastname: lastname,
    email: email,
    password: password,
    handle: handle,
  });
}

export async function updateProfile(id, user) {
  return feathersClient.service("users").patch(id, user);
}

export async function forgotPassword(email) {
  return axiosInstance.post("/authManagement", {
    action: "sendResetPwd",
    value: { email: email }
  });
}

export async function updatePasswordFromProfile(
  email,
  oldPassword,
  newPassword
) {
  return axiosInstance.post("/authManagement", {
    action: "passwordChange",
    value: {
      user: {
        email: email
      },
      oldPassword: oldPassword,
      password: newPassword
    }
  });
}

export async function updateIdentity(password, currentEmail, updatedEmail) {
  return axiosInstance.post("/authManagement", {
    action: "identityChange",
    value: {
>>>>>>> main
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