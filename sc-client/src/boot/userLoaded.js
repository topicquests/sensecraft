export var userLoadedResolve = null;
export const userLoaded = new Promise((resolve) => {
  userLoadedResolve = resolve;
});
