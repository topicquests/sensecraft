import axiosInstance from "../../boot/axios";


export async function signup(payload, token) {
  const options = token ? {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  } : {};
  return axiosInstance
    .post("/users", {
      "name": payload.formdata.name,
      "email": payload.formdata.email,
      "password": payload.formdata.password,
      "handle": payload.formdata.handle,
      "createdAt": payload.createdAt,
      "updatedAt": payload.updatedAt
    }, options).then(function(response) {
      return response;
    }).catch(function(error){
       console.log("Error in signup", error);
    });
}
