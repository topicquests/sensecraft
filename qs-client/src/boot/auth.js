import { LocalStorage, Notify } from "quasar";

export default async ({ router, store }) => {
  router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!auth.loggedIn()) {
        next({
          path: '/signon',
          query: { redirect: to.fullPath }
        })
      } else {
        next()
      }
    } else {
      next() // make sure to always call next()!
    }
  })
};
