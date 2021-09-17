import MyVapi from "./base"

const members = new MyVapi({
  state: {
    members: []
  },
})
  // Step 3
  .get({
    action: "fetchUserById",
    path: ({id}) => `/members?id=eq.${id}`,
    property: "member",
  })
  .get({
    path: '/members',
    property: "members",
    action: "listMembers",
  })
  .post({
    action: "updateUser",
    path: ({id}) => `/members?id=eq.${id}`,
    property: "members",
  })
  // Step 4
  .getStore();

export default members;
