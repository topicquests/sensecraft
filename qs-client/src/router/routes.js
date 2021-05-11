
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [  
      { path: '/',
         component: () => import('pages/Home.vue') },     
      { path: '/register', 
        name: "register",
        component: () => import('pages/Register.vue') },
      { path: '/signin', 
        name: "signin",
        component: () => import('pages/SignIn.vue') },
        { path: '', 
          component: () => import('pages/Index.vue') },
        { path: '/home',
          name: "home",
         component: () => import('pages/Home.vue') }, 
         ,
         { path: '/quests',
          name: "quests",
         component: () => import('pages/Quest-landing.vue') },
         { path: '/guild/:id',
          name: "guilds",
         component: () => import('pages/Guild.vue') },
         { path: '/role/:id',
          name: "role",
         component: () => import('pages/Role-room.vue') }        
    ]
  },

  {
    path: '/',
    component: () => import('layouts/HomeLayout.vue'),
    children: [
     
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
