import api from "./api"
// import { Promise } from 'es6-promise'

const auth = {
  user: null,

register(email, password, name, handle) {
    return api.service('users').create({
      email: email,
      password: password,
      name: name,
      handle: handle
    });
  },

  login(email, password) {
    return api.authenticate({
      strategy: "local",
      email: email,
      password: password
    });
  },


};

export default auth;