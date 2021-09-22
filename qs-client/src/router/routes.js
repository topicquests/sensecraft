
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { // TODO: clear up the role of each of those four pages.
        path: '/',
        name: 'root',
        component: () => import('pages/Home.vue')
      },
      {
        path: '/home',
        name: "home",
        component: () => import('pages/Home.vue'),
      },
      { path: '/landing',
        name: "landingPage",
        component: () => import('pages/Landing-page.vue')
      },
      { path: '/lobby',
        name: "lobby",
        component: () => import('pages/Lobby.vue')
      },
     //Quest pages
      { // What is the intent of this page?
        path: '/quest/app',
        name: "quests",
        component: () => import('pages/Quest-app.vue')
      },
      { path: '/quest',
        name: "quest_list",
        component: () => import('pages/quest.vue')
      },
      { // suggestion: fuse quest_list and quest-landing pages
        path: '/quest/landing',
        name: "quest-landing",
        component: () => import('pages/Quest-landing.vue')
      },
      {path: '/quest/create',
        name: "create_quest",
        component: () => import('pages/questForm.vue')
      },
      { path: '/quest/:quest_id/edit',
        name: "quest_edit",
        component: () => import('pages/questEdit.vue')
      },
      { // what is the intent of this page?
        path: '/quest/:quest_id/request',
        name: 'questRequest',
        component: () => import('pages/questRequest.vue')
      },
      {path: '/quest/:quest_id',
       name: 'quest_page',
       component: () => import('pages/questview.vue')
      },
      { path: '/guild',
        name: "guild_list",
        component: () => import('pages/Guilds.vue')
      },
      { // suggestion: fuse guild_list and guild-landing pages
        path: '/guild/landing',
        name: "guild-landing",
        component: () => import('pages/Guild-landing.vue')
      },
      {path: 'guild/create',
        name: "create_guild",
        component: () => import('pages/guildForm.vue')
      },
      { path: '/guild/:guild_id',
        name: "guild",
        component: () => import('pages/Guild-app.vue')
      },
      { path: '/guild/:guild_id/play/:quest_id',
        name: "game_play",
        component: () => import('pages/GamePlay.vue')
      },
      { path: '/guild/:guild_id/edit',
        name: "guild_edit",
        component: () => import('pages/guildEdit.vue')
      },
      { path: '/guild/:guild_id/admin',
        name: "guild_admin",
        component: () => import('pages/guildAdmin.vue')
      },
      { path: '/register',
        name: "register",
        component: () => import('pages/Register.vue')
      },
      { path: '/signin',
        name: "signin",
        component: () => import('pages/SignIn.vue')
      },
      { path: '',
        component: () => import('pages/Index.vue')
      },
      { path: '/role/:id',
        name: "role",
        component: () => import('pages/Role-room.vue')
      },
      {
        path: '/node/:quest_id',
        name: "node",
        component: () => import('pages/mmowgli-node.vue')
      },
      {
        path: '/nodeEdit/:quest_id',
        name: "nodeEditor",
        component: () => import('pages/nodeEdit.vue')
      },
      { path: '/mnodeedit',
        name: "mmowglieditor",
        component: () => import('pages/mmowgli-node-form.vue')
      },
      { path: '/admin/:member_id',
        name: "admin",
        component: () => import('pages/Admin-app.vue')
      },
    ]
  },


  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
