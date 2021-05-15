
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
         { path: '/khub',
          name: "khub",
         component: () => import('pages/Khub.vue') },
         { path: '/home',
         name: "card/:id",
        component: () => import('pages/mmowgli-card.vue') },         
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
