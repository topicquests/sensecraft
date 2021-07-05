import userService from "../../services/user";
import {Notify} from 'quasar'

export async function registerUser({commit, state}, payload) {
  let result = await userService
    .signup(
      payload.formdata.name,
      payload.formdata.email,
      payload.formdata.password,
      payload.formdata.handle
    ).catch(err => {
        console.log("Error in registering", {err})
        if (err.response) {
          let errorCode = err.response.data.code;
          if (errorCode === 409) {
            Notify.create({
              message: `This account already exists. Try resetting your password or contact support.`,
              color: "negative"
            });
          } else {
            Notify.create({
              message: `There was an error creating your account. If this issue persists, contact support.`,
              color: "negative"
            });
          }
        }
      })
      if (result && result.status >= 201) {
        Notify.create({
        message: `Account successfully created. Please check your email to verify your account.`,
        color: "positive"
      });
        this.$router.push("/signin");
      };
    }

export async function signin({commit, dispatch},  payload) {
  try {
   const resp = await dispatch("auth/authenticate", {
          strategy: "local",
          email: payload.signonEmail,
          password: payload.password
  }, {root: true})
  commit('setUsers', resp.user);
  return (resp)
  } catch (err) {
    console.log("Error in sognin")
  }
}

export async function getUserById({commit, dispatch}, payload) {
  try {
    const token = this.state.auth.accessToken;
    const response = await userService.getUserById(payload, token);
    return response
  }
  catch (error) {

  }
  }
