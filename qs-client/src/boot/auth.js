import { LocalStorage, Notify } from "quasar";

export default async ({ router, store }) => {
  router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
      if (store.state.auth.user) {
        
      } else {
        if (to.path !== "/signon") {
          next("/signon");
        } else {
          next();
        }
      }
    } else {
      next();
    }
    //next();
  });
};
