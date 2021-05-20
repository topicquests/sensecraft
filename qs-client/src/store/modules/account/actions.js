import userService from "../../../services/user";
import { Notify } from "quasar";

export async function registerUser({commit, rootState}, payload) {
  let result = await userService
    .signup(
      payload.formdata.firstname,
      payload.formdata.lastname,
      payload.formdata.email,
      payload.formdata.password,
      payload.formdata.handle
    )      
}


