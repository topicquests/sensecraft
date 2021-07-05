import { Notify } from "quasar";
import feathersClient from "../../boot/feathersClient";
import axiosInstance from "../../boot/axios";

export async function getUsers_previous_version(opts) {
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
  return axiosInstance.get("/users/?id=eq." + id, options
  ).then(response => {
    return response
  })
  .catch(err => {
    let errorCode = err.response.data.code;
    console.log("Error in get memberd in guild with guildId " + id, err);
  })
}
