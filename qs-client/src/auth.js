import api from "./api"
// import { Promise } from 'es6-promise'

const auth = {
  user: null,

register(email, password, firstname, lastname, handle) {
    return api.service('users').create({
      email: email,
      password: password,
      firstname: firstname,
      lastname: lastname,
      handle: handle
    });
  }
}

export default auth;