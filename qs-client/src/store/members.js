import MyVapi from "./base"

const members = new MyVapi({
  state: {
    singleFetch: true,
    members: []
  },
})
  // Step 3
  .get({
    action: "fetchMemberById",
    path: ({id})=> `/members?id=eq.${id}`,
    onSuccess: (state, res, axios, actionParams) => {
      const member = res.data[0]
      if (state.members) {
        const members = state.members.filter(q => q.id !== member.id)
        members.push(member)
        state.members = members
      } else {
        state.members = [member]
        state.singleFetch = true
      }
    },
  })
  .get({
    path: '/members',
    property: "members",
    action: "fetchMembers",
    onSuccess: (state, res, axios, actionParams) => {
      state.members = res.data
      state.singleFetch = false
    },
  })
  .patch({
    action: "updateMember",
    path: ({id}) => `/members?id=eq.${id}`,
    property: "members",
    beforeRequest: (state, { params, data }) => {
      params.id = data.id
    },
    onSuccess: (state, res, axios, { data }) => {
      console.log(res.data)
      const quest = res.data[0]
      const members = state.members.filter(q => q.id !== member.id)
      members.push(member)
      state.members = members
    }
  })
  // Step 4
  .getStore({
    getters: {
      getMemberById: (state) => (id) =>
        state.members.find(member => member.id == id),
      getMemberByHandle: (state) => (handle) =>
        state.members.find(member => member.handle == handle),
      getMembersByHandle: (state) =>
        Map.of(state.members.map(member => [member.handle, member])),
      getMemberHandles: (state) =>
        state.members.map(member => member.handle).sort(),
    },
    actions: {
      ensureAllMembers: async (context) => {
        if (context.state.members.length === 0 || context.state.singleFetch) {
          await context.dispatch('fetchMembers');
        }
      },
    }
  });

export default members;
