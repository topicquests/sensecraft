import userService from "../../services/user";
import { Notify } from "quasar";

export async function registerUser(context, payload) {
  let result = await userService
    .signup(
      payload.formdata.firstname,
      payload.formdata.lastname,
      payload.formdata.email,
      payload.formdata.password,
      payload.formdata.handle
    ) 
    .then(({data}) => {
      console.log('user data is:', data);
      commit('SET_USER_DATA', data);
    })
}

export async function updateProfile(context, payload) {
  let result = await userService
    .updateProfile(payload.id, payload.profileData)
    .catch(err => {
      if (err.response) {
        let errorCode = err.response.data.code;
        if (errorCode) {
          Notify.create({
            message: `There was an error updating your profile. If this persists, contact support.`,
            color: "negative"
          });
        }
      }
    });
  if (result) {
    Notify.create({
      message: `Account successfully updated.`,
      color: "positive"
    });
  }
}

export async function forgotPassword(context, payload) {
  return userService
    .forgotPassword(payload.emailAddress)
    .then(() => {
      Notify.create({
        message: "Password reset sent.",
        color: "positive",
        icon: "fas fa-check"
      });
    })
    .catch(err => {
      Notify.create({
        message:
          "There was an error processing your request. If this problem persists, contact support.",
        color: "negative"
      });
    });
}

export async function resetPassword(context, payload) {
  return userService.resetPassword(payload.token, payload.password);
}

export async function updatePassword(context, payload) {
  let result = await userService.updatePassword(
    payload.password,
    payload.token
  );
  if (result && result.status === 200) {
    this.$router.push("/account");
    Notify.create({ message: "Password reset successful.", color: "positive" });
  }
}

export async function updatePasswordFromProfile({ dispatch }, payload) {
  let result = await userService
    .updatePasswordFromProfile(
      payload.email,
      payload.oldPassword,
      payload.newPassword
    )
    .catch(err => {
      Notify.create({
        message:
          "There was an error processing your request. If this problem persists, contact support.",
        color: "negative"
      });
    });
  if (result && result.status >= 200) {
    Notify.create({
      message: "Password update successful.",
      color: "positive"
    });
    dispatch("auth/logout", null, { root: true });
  }
}

export async function updateIdentity(context, payload) {
  let result = await userService
    .updateIdentity(
      payload.password,
      payload.currentEmail,
      payload.updatedEmail
    )
    .catch(err => {
      Notify.create({
        message:
          "There was an error processing your request. If this problem persists, contact support.",
        color: "negative"
      });
    });
  if (result && result.status === 201) {
    Notify.create({
      message:
        "Email verification sent. Verify new email to update your email address.",
      color: "positive"
    });
  }
}

export async function resendVerification(context, payload) {
  let result = await userService
    .resendVerification(payload.email)
    .catch(err => {
      Notify.create({
        message:
          "There was an error processing this request. If this problem persists, contact technical support.",
        color: "negative"
      });
    });
  if (result && result.status >= 200 && result.status < 300) {
    Notify.create({
      message: "Email verification resent.",
      color: "positive",
      icon: "fas fa-check"
    });
  }
}

export async function updateUser({ dispatch }, payload) {
  let result = await userService
    .updateUser(payload.user, payload.id)
    .catch(err => {
      Notify.create({
        message:
          "There was an error processing this request. If this problem persists, contact support." +
          err,
        color: "negative"
      });
    });
  if (result) {
    Notify.create({
      message: "User successfully updated.",
      color: "positive",
      icon: "fas fa-check"
    });
  }
  dispatch(
    "admin/getUsers",
    {
      paginationOpts: payload.paginationOpts
    },
    { root: true }
  );
}
