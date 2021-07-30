import memberService from "../../services";
import {Notify} from 'quasar'
const {hash} = require('bcryptjs')

export async function registerUser({commit, state}, payload) {
  const token = this.state.member.token;
  payload.formdata.password = await hash(payload.formdata.password, 10)
  let today = new Date;
  today = today.toISOString()
  payload.formdata.email = payload.formdata.email.toLowerCase();
  payload.created_at = today;
  payload.updated_at = today;

  let result = await memberService
    .signup(
      payload,
      token
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

export async function getToken({commit, dispatch},  payload) {
  try {
    //payload.password = await hash(payload.password, 10)
    payload.signonEmail = payload.signonEmail.toLowerCase();
    const response = await memberService.getToken(
      payload.signonEmail,
      payload.password
    )
    commit('setToken', response.data)
    return response
  } catch (err) {
    console.log("Error in getToken: ", err)
  }
}

  export async function signin({commit, dispatch},  payload) {
  try {
  const tokenResponse = await dispatch('getToken', payload)
  if (!tokenResponse) {
    throw 'Token is null'
  }
   const token = this.state.token;
   const resp = await memberService.login(
          payload.signonEmail,
          token
  )
  commit('setUsers', resp.data[0]);
  this.state.member.isAuthenticated = true;
  return resp.data
  } catch (err) {
    console.log("Error in signin: ", err)
  }
}

export async function getUserById({commit, dispatch}, payload) {
  try {
    const token = this.state.member.token;
    const response = await memberService.getUserById(payload, token);
    return response
  }
  catch (error) {

  }
  }

  export async function logout ({commit, dispatch}) {
    this.state.member.token = null;
    this.state.member.member = null;
    this.state.member.isAuthenticated = false;
    return true
  }
