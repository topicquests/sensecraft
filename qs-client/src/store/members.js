import MyVapi from "./base"

const members = new MyVapi({
  state: {
    members: []
  },
})
  // Step 3
  .get({
    action: "fetchUserById",
    path: ({id})=> `/members?id=eq.${id}`,
    onSuccess: (state, res, axios, actionParams) => {
      const member = res.data[0]
      if (state.members) {
        const members = state.members.filter(q => q.id !== member.id)
        members.push(member)
        state.members = members
      } else {
        state.members = [member]
      }
    },
  })
  .get({
    path: '/members',
    property: "members",
    action: "fetchMembers",
  })
  .patch({
    action: "updateUser",
    path: ({id}) => `/members?id=eq.${id}`,
    property: "members",
    beforeRequest: (state, { params, data }) => {
      params.id = data.id
    },
  })
  // Step 4
  .getStore({
    getters: {
      getMemberById: (state) => (id) =>
        state.members.find(member => member.id == id),
      membersByHandle: (state) =>
        Map.of(state.members.map(member => [member.handle, member])),
      memberHandles: (state) =>
        state.members.map(member => member.handle).sort(),
    }
  });

export default members;
