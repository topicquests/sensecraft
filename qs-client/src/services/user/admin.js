import { Notify } from "quasar";
import feathersClient from "../../boot/feathersClient";
import axiosInstance from "../../boot/axios";
import { email } from "vuelidate/lib/validators";

export async function getUsers(opts, token) {
  const options = token ? {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  } : {};
  return axiosInstance.get("/users", options
  ).then(function(response) {
    console.log("Users response: ", response);
    return response;
  }).catch(function(error){
    console.log("Error in getUsers");
  });
}

export async function  getUserById(id, token) {
  const options = token ? {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  } : {};
  return axiosInstance.get("/users?id=eq." + id, options
  ).then(response => {
    return response
  })
  .catch(err => {
    let errorCode = err.response.data.code;
    console.log("Error in get memberd in guild with guildId " + id, err);
  })
}

export async function getToken(email, password) {
  return axiosInstance.post("/rpc/get_token",
  {
    "mail": email, "pass": password
  }).then(response => {
    console.log("signin: ", response);
    return response
  }).catch(err => {
    console.log("Error in user signin", err);
  })
}

export async function login(email, token) {
  const options = token ? {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  } : {};
  return axiosInstance.get("/users?email=eq." + email, options
  ).then(response => {
    console.log("signin: ", response);
    return response
  }).catch(err => {
    console.log("Error in user signin", err);
  })
}


