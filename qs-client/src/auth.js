import api from "./api"
// import { Promise } from 'es6-promise'

const auth = {
  user: null,
register(email, password, fullName, handle) {
    return api.service('users').create({
      email: email,
      password: password,
      fullname: fullName,
      handle: handle
    });
  }
}

export default auth;