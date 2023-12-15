// TODO: This is clearly dead code
export default async ({ router, store }) => {
  router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      if (!store.getters["member/getUserId"]) {
        next({
          path: "/signon",
          query: { redirect: to.fullPath },
        });
      } else {
        next();
      }
    } else {
      next(); // make sure to always call next()!
    }
  });
};
