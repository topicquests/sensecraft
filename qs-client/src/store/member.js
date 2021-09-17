import MyVapi from "./base"
const {hash} = require('bcryptjs')
import {Notify} from 'quasar'

// TODO: right now expiry is shared knowledge with backend.
// Ideally, I should read it from the token.
const TOKEN_EXPIRATION = 1000000
const TOKEN_RENEWAL = TOKEN_EXPIRATION * 9 / 10

const baseState = {
  member: null,
  email: null,
  token: null,
  tokenExpiry: null,
  isAuthenticated: false,
};

const member = new MyVapi({
  state: baseState,
})
  // Step 3
  patch({
    action: "updateUser",
    queryParams: true,
    property: "member",
    path: (id) => `/members?id=eq.${id}`,
  }).call({
    action: "signin",
    property: "token",
    path: "get_token",
    beforeRequest: (state, actionParams) => {
      const { data, password, signonEmail } = actionParams
      data.pass = password
      data.mail = signonEmail
    },
    onError: (state, err, axios, { params, data }) => {
      console.log(err)
      Notify.create({
        message: "Wrong email or password",
        color: 'negative',
        icon: 'warning'
      })
    },
    onSuccess: (state, res, axios, { params, data }) => {
      state.token = res.data
      state.tokenExpiry = Date.now() + TOKEN_EXPIRATION
      state.email = data.mail
      state.isAuthenticated = true
      const storage = window.localStorage
      storage.setItem('token', state.token)
      storage.setItem('tokenExpiry', state.tokenExpiry)
      storage.setItem('email', state.email)
      window.setTimeout(() => {
        MyVapi.store.dispatch('member/renewToken', {params: {token: state.token}})
      }, TOKEN_RENEWAL);
      // Ideally, I should be able to chain another action as below.
      // But onSuccess is part of the mutator, not the action, so no async.
      // return await MyVapi.store.dispatch('member/fetchLoginUser', {email: data.mail})
    }
  }).get({
    action: "fetchLoginUser",
    property: "member",
    path: "/members",
    queryParams: true,
    beforeRequest: (state, actionParams) => {
      if (!state.token) {
        state.token = window.localStorage.getItem('token')
      }
      if (!state.tokenExpiry) {
        state.tokenExpiry = window.localStorage.getItem('tokenExpiry')
      }
      if (!state.email) {
        state.email = window.localStorage.getItem('email')
      }
      if (state.token && state.email) {
        actionParams.params.email = `eq.${state.email}`
      }
    },
    onSuccess: (state, res, axios, { params, data }) => {
      state.member = res.data[0]
      state.isAuthenticated = true
      state.token = state.token || window.localStorage.getItem('token')
      state.tokenExpiry = state.tokenExpiry || window.localStorage.getItem('tokenExpiry')
      Notify.create({
        message: "Login Success",
        color: "positive",
        position: "top"
      })
      return state.member
    },
    onError: (state, error, axios, { params, data }) => {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('tokenExpiry');
      console.log(error)
    },
  }).post({
    action: "registerUser",
    property: "member",
    path: "/members",
    onError: (state, error, axios, { params, data }) => {
      data.password = hash(data.password, 10)
      const errorCode = data.code;
      if (errorCode === 409) {
        Notify.create({
          message: 'This account already exists. Try resetting your password or contact support.',
          color: "negative"
        });
      } else {
        Notify.create({
          message: 'There was an error creating your account. If this issue persists, contact support.',
          color: "negative"
        });
      }
    },
    onSuccess: (state, payload, axios, { params, data }) => {
      // TODO: Send email to user with activation link
      // TODO: Add to members state?
      Notify.create({
        message: 'Account created successfully. Please check your email for a confirmation link.',
        color: "positive"
      });
    }
  })
  .call({
    action: "renewToken",
    path: ({ token }) => `/rpc/renew_token?token=${token}`,
    readOnly: true,
    onSuccess: (state, res, axios, { params, data }) => {
      state.token = res.data
      state.tokenExpiry = Date.now() + TOKEN_EXPIRATION
      window.setTimeout(() => {
        MyVapi.store.dispatch('member/renewToken', {params: {token: state.token}})
      }, TOKEN_RENEWAL);
    }
  })
  // Step 4
  .getStore({
    getters: {
      getUser: (state) =>
        state.member,
      getUserEmail: (state) =>
        state.email,
      getUserId: (state) =>
        state.member?.id,
      getUserById: (state) => (id) =>
        (state.member?.id == id)?state.member:null,
    },
    mutations: {
      LOGOUT: (state) => {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('email');
        window.localStorage.removeItem('tokenExpiry');
        return Object.assign(state, baseState)
      },
    },
    actions: {
      logout: (context) => {
        context.commit("LOGOUT")
      },
    }
  });

export default member;
