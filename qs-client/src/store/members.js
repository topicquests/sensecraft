import MyVapi from "./base"

const members = new MyVapi({
  state: {
    members: []
  },
})
  // Step 3
  .get({
    action: "fetchUserById",
    path: ({id})=> `/members?eq.${id}`,
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
  .post({
    action: "updateUser",
    path: ({id}) => `/members?id=eq.${id}`,
    property: "members",
  })
  // Step 4
  .getStore({
    getters: {
      getMemberById: (state) => (id) =>
        state.members.find(member => member.id == id),
    }
  });

export default members;
