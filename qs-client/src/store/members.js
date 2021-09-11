import MyVapi from "./base"

const members = new MyVapi({
  state: {
    members: []
  },
})
  // Step 3
  .get({
    action: "getUserById",
    queryParams: true,
    path: (id) => `/members?id=eq.${id}`,
    property: "members",
  })
  .get({
    path: '/members',
    property: "members",
    action: "listMembers",
  })
  .post({
    action: "updateUser",
    path: (id) => `/members?id=eq.${id}`,
    property: "members",
    queryParams: true,
  })
  // Step 4
  .getStore();

export default members;
