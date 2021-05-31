import userService from "../../services/user";
import guestService from "../../services/quest";
import { Notify } from "quasar";

export async function getUsers({ commit }, payload) {
  let result = await userService.getUsers(payload.paginationOpts).catch(err => {
    if (err.response) {
      let errorCode = err.response.data.code;
      if (errorCode) {
        Notify.create({
          message: `There was an error retrieving users.`,
          color: "negative"
        });
      }
    }
  });
  commit("setUsers", result.data);
  commit("setUserCount", result.total);
}

export async function findQuests({commit}, payload) {
  let result = await questService.getQuests();

}
