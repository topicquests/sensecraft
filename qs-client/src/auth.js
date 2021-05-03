import api from "./api"
// import { Promise } from 'es6-promise'

const auth = {
  user: null,
<<<<<<< HEAD
register(email, password, firstname, lastname, handle) {
    return api.service('users').create({
      email: email,
      password: password,
      firstname: firstname,
      lastname: lastname,
=======
register(email, password, fullName, handle) {
    return api.service('users').create({
      email: email,
      password: password,
      fullname: fullName,
>>>>>>> 1813c3b045656074250a45846b9f18940a8883d0
      handle: handle
    });
  }
}

export default auth;