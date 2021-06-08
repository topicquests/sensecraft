
export const mutations = {
  setUsers(state, userData) {
    state.users = userData;
  }
}

export function setUserPagination(state, payload) {
  state.userPaginationOpts = payload.userPaginationOpts;
}

export function setUserCount(state, count) {
  state.userPaginationOpts.rowsNumber = count;
}
