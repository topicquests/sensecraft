
export const mutations = {
  setUsers(state, userData) {
    state.users = userData;
  },
  setUserPagination(state, payload) {
    state.userPaginationOpts = payload.userPaginationOpts;
  },
  setUserCount(state, count) {
    state.userPaginationOpts.rowsNumber = count;
  }
}
/*
export function setUserPagination(state, payload) {
  state.userPaginationOpts = payload.userPaginationOpts;
}

export function setUserCount(state, count) {
  state.userPaginationOpts.rowsNumber = count;
}
*/
