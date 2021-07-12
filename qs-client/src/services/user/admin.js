import { Notify } from "quasar";
import feathersClient from "../../boot/feathersClient";
import axiosInstance from "../../boot/axios";
import { email } from "vuelidate/lib/validators";

export async function getUsers(opts) {
  let pagination = { query: { $sort: { descending: 1 } } };
  if (opts) {
    pagination.query.$limit = opts.rowsPerPage;
    pagination.query.$skip = (opts.page - 1) * opts.rowsPerPage;
    if (opts.sortBy) {
      pagination.query.$sort[opts.sortBy] = opts.descending ? 1 : -1;
    }
  } else {
    pagination.query.$limit = 5;
  }
  return feathersClient.service("users").find(pagination);
}

export async function  getUserById(id, token) {
  const options = token ? {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  } : {};
    return axiosInstance.get("/users?id=eq." + id,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then(response => {
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


