const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        // TODO: clear up the role of each of those four pages.
        path: "/",
        name: "root",
        component: () => import("pages/Home.vue"),
      },
      {
        path: "/home",
        name: "home",
        component: () => import("pages/Home.vue"),
      },
      {
        path: "/landing",
        name: "landingPage",
        component: () => import("src/pages/LandingPage.vue"),
      },
      {
        path: "/lobby",
        name: "lobby",
        component: () => import("pages/Lobby.vue"),
      },
      //Quest pages
      {
        path: "/quest",
        name: "quest_list",
        component: () => import("pages/QuestList.vue"),
      },
      {
        // suggestion: fuse quest_list and quest-landing pages
        path: "/quest/landing",
        name: "quest_landing",
        component: () => import("pages/QuestLanding.vue"),
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
        path: "/quest/:quest_id",
        name: "quest_page",
        component: () => import("pages/QuestPage.vue"),
      },
      {
        path: "/guild",
        name: "guild_list",
        component: () => import("pages/GuildList.vue"),
      },
      {
        // suggestion: fuse guild_list and guild-landing pages
        path: "/guild/landing",
        name: "guild_landing",
        component: () => import("pages/GuildLanding.vue"),
      },
      {
        path: "guild/create",
        name: "create_guild",
        component: () => import("pages/CreateGuild.vue"),
      },
      {
        path: "/guild/:guild_id",
        name: "guild",
        component: () => import("pages/Guild.vue"),
      },
      {
        path: "/guild/:guild_id/play/:quest_id",
        name: "game_play",
        component: () => import("pages/GamePlay.vue"),
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
        component: () => import("pages/SignIn.vue"),
      },
      { path: "", component: () => import("pages/Index.vue") },
      {
        path: "/role/:id",
        name: "role",
        component: () => import("pages/Role.vue"),
      },
      // {
      //   path: "/node/:quest_id",
      //   name: "conversation_column",
      //   component: () => import("pages/ConversationColumn.vue"),
      // },
      {
        path: "/nodeEdit/:quest_id",
        name: "node_edit",
        component: () => import("pages/nodeEdit.vue"),
      },
      // {
      //   path: "/mnodeedit",
      //   name: "conversation_column_edit",
      //   component: () => import("pages/ConversationColumnEdit.vue"),
      // },
      {
        path: "/admin",
        name: "admin",
        component: () => import("pages/Admin.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
