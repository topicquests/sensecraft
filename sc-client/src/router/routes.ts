import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/',
        name: 'root',
        component: () => import('pages/HomePage.vue'),
      },
      {
        path: '/home',
        name: 'home',
        component: () => import('pages/HomePage.vue'),
      },
      {
        path: '/signin',
        name: 'signin',
        component: () => import('pages/SignInPage.vue'),
      },
      {
        path: '/register',
        name: 'register',
        component: () => import('pages/RegisterPage.vue'),
      },
      {
        path: 'house_rules',
        name: 'house_rules',
        component: () => import('pages/HouseRules.vue'),
      },
      {
        path: '/lobby',
        name: 'lobby',
        component: () => import('pages/LobbyPage.vue'),
      },
      {
        path: '/quest',
        name: 'quest_list',
        component: () => import('pages/QuestList.vue'),
      },
      {
        path: "/quest/create",
        name: "create_quest",
        component: () => import("pages/CreateQuest.vue"),
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
