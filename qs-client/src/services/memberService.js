import { Notify } from "quasar";
import axiosInstance from "../boot/axios";
import { email } from "vuelidate/lib/validators";

export async function signup(payload, token) {
  const options = token ? {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  } : {};
  return axiosInstance
    .post("/members", {
      "name": payload.formdata.name,
      "email": payload.formdata.email,
      "password": payload.formdata.password,
      "handle": payload.formdata.handle,
      "created_at": payload.created_at,
      "updated_at": payload.updated_at
    }, options).then(function(response) {
      return response;
    }).catch(function(error){
       console.log("Error in signup", error);
    });
}

export async function getUsers(opts, token) {
  const options = token ? {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  } : {};
  return axiosInstance.get("/members", options
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
  return axiosInstance.get("/members?id=eq." + id, options
  ).then(response => {
    return response
  })
  .catch(err => {
    let errorCode = err.response.data.code;
    console.log("Error in get member in guild with member_id " + id, err);
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
    console.log("Error in member signin", err);
  })
}

export async function login(email, token) {
  const options = token ? {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  } : {};
  return axiosInstance.get("/members?email=eq." + email, options
  ).then(response => {
    console.log("signin: ", response);
    return response
  }).catch(err => {
    console.log("Error in member signin", err);
  })
}


