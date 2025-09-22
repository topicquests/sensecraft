import { getCurrentInstance } from 'vue';
import { resetIfMemberChanged } from './boot/userLoaded';
import { Member } from './types';
export function useCurrentApp() {
  return getCurrentInstance()?.appContext.app;
}

export async function waitUserLoaded() {
  let userLoaded: Member | null = null;
  const app = useCurrentApp();
  if (app) {
    
    userLoaded = await app.config.globalProperties.$userLoaded;
    resetIfMemberChanged(userLoaded ? userLoaded.id : undefined);
  } else {
    console.warn('empty app in waitUserLoaded');
  }
  return userLoaded;
}
