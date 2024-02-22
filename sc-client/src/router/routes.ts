import { RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        // TODO: clear up the role of each of those four pages.
        path: "/",
        name: "root",
        component: () => import("pages/HomePage.vue"),
      },
      {
        path: "/home",
        name: "home",
        component: () => import("pages/HomePage.vue"),
      },
      {
        path: "/landing",
        name: "landingPage",
        component: () => import("src/pages/LandingPage.vue"),
      },
      {
        path: "/lobby",
        name: "lobby",
        component: () => import("pages/LobbyPage.vue"),
      },
      {
        path: "/admin",
        name: "admin",
        component: () => import("pages/AdminPage.vue"),
      },
      //Quest pages
      {
        path: "/quest",
        name: "quest_list",
        component: () => import("pages/QuestList.vue"),
      },
      {
        path: "/quest/create",
        name: "create_quest",
        component: () => import("pages/CreateQuest.vue"),
      },
      {
        path: "/quest/:quest_id/edit",
        name: "quest_edit",
        component: () => import("pages/QuestEdit.vue"),
      },
      {
        // what is the intent of this page?
        path: "/quest/:quest_id/request",
        name: "quest_request",
        component: () => import("pages/QuestRequest.vue"),
      },
      {
        path: "/quest/:quest_id/node/:node_id(\\d+)",
        name: "quest_page_node",
        component: () => import("pages/QuestPlayPage.vue"),
      },
      {
        path: "/quest/:quest_id",
        name: "quest_page",
        component: () => import("pages/QuestPlayPage.vue"),
      },
      {
        path: "/quest/:quest_id/teams",
        name: "quest_teams",
        component: () => import("pages/QuestTeamPage.vue"),
      },
      {
        path: "/guild",
        name: "guild_list",
        component: () => import("pages/GuildList.vue"),
      },
      {
        path: "guild/create",
        name: "create_guild",
        component: () => import("pages/CreateGuild.vue"),
      },
      {
        path: "/guild/:guild_id",
        name: "guild",
        component: () => import("pages/GuildPage.vue"),
      },
      {
        path: "/guild/:guild_id/edit",
        name: "guild_edit",
        component: () => import("pages/GuildEdit.vue"),
      },
      {
        path: "/guild/:guild_id/admin",
        name: "guild_admin",
        component: () => import("pages/GuildAdmin.vue"),
      },
      {
        path: "/register",
        name: "register",
        component: () => import("pages/Register.vue"),
      },
      {
        path: "/signin",
        name: "signin",
        component: () => import("pages/SignInPage.vue"),
      },
      { path: "", component: () => import("pages/Index.vue") },
      {
        path: "/role/:id",
        name: "role",
        component: () => import("pages/Role.vue"),
      },
      {
        path: "/role/:role_id/edit",
        name: "role_edit",
        component: () => import("pages/RoleEdit.vue"),
      },
      {
        path: "role/create",
        name: "create_role",
        component: () => import("pages/CreateRole.vue"),
      },
      {
        path: "role/create/:guild_id",
        name: "create_guild_role",
        component: () => import("pages/CreateRole.vue"),
      },
      {
        path: "/confirm",
        name: "confirm_registration",
        component: () => import("pages/ConfirmRegistration.vue"),
      },
      {
        path: "/confirmPassword",
        name: "confirm_password",
        component: () => import("pages/ConfirmPassword.vue"),
      },
      {
        path: "/reset_pass",
        name: "reset_pass",
        component: () => import("pages/ResetPassword.vue"),
      },
      {
        path: "/nodeEdit/:quest_id",
        name: "node_edit",
        component: () => import("pages/NodeEdit.vue"),
      },
      {
        path: "/admin",
        name: "admin",
        component: () => import("pages/AdminPage.vue"),
      },
      {
        path: "/guild/:guild_id/channel",
        name: "guild_channel_list",
        component: () => import("pages/GuildChannelList.vue"),
      },
      {
        path: "/guild/:guild_id/channel/:channel_id",
        name: "guild_channel_conversation",
        component: () => import("pages/ChannelPage.vue"),
      },
      {
        path: "/guild/:guild_id/quest/:quest_id/channel",
        name: "game_channel_list",
        component: () => import("pages/GameChannelList.vue"),
      },
      {
        path: "/guild/:guild_id/quest/:quest_id/channel/:channel_id",
        name: "game_channel_conversation",
        component: () => import("pages/ChannelPage.vue"),
      },
      {
        path: "house_rules",
        name: "house_rules",
        component: () => import("pages/HouseRules.vue"),
      },
    ],
  },

 
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
