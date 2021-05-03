
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
<<<<<<< HEAD
    children: [  
      { path: '/',
         component: () => import('pages/Home.vue') },     
=======
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/home',
        name: "home",
       component: () => import('pages/Home.vue') },
>>>>>>> 1813c3b045656074250a45846b9f18940a8883d0
      { path: '/register', 
        name: "register",
        component: () => import('pages/Register.vue') },
      { path: '/signin', 
        name: "signin",
<<<<<<< HEAD
        component: () => import('pages/SignIn.vue') },
        { path: '', 
          component: () => import('pages/Index.vue') },
        { path: '/home',
          name: "home",
         component: () => import('pages/Home.vue') }, 
         { path: '/khub',
          name: "khub",
         component: () => import('pages/Khub.vue') }         
    ]
  },

  {
    path: '/',
    component: () => import('layouts/HomeLayout.vue'),
    children: [
     
=======
        component: () => import('pages/SignIn.vue') }
>>>>>>> 1813c3b045656074250a45846b9f18940a8883d0
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
