
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [  
      { path: '/',
        component: () => import('pages/Home.vue') 
      },
      { path: '/quest/:quest_id',
        name: "quest",
        component: () => import('pages/Quest-app.vue') 
      },
      { path: '/quest',
        name: "quests",
        component: () => import('pages/Quest-landing.vue') 
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
      { path: '/home',
        name: "home",
        component: () => import('pages/Home.vue'),
      },
      { path: '/landing',
        name: "landingPage",
        component: () => import('pages/Landing-page.vue') 
      },    
      { path: '/role/:id',
        name: "role",
        component: () => import('pages/Role-room.vue') 
      },  
      {
        path: '/node/:id/:context',
        name: "node",
        component: () => import('pages/mmowgli-node-alt.vue') 
      },
      { path: '/mnodeedit/:id/:type/:parentId',
        name: "mmowglieditor",
        component: () => import('pages/mmowgli-node-form.vue')
      },
      { path: '/questform',
        name: "questform",
        component: () => import('pages/questForm.vue') 
      },
      { path: '/guild',
        name: "guilds",
        component: () => import('pages/Guild-landing.vue') 
      },
      { path: '/guild/:guild_id',
        name: "guild",
        component: () => import('pages/Guild-app.vue') 
      }    
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
