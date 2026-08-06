import { boot } from 'quasar/wrappers';
import { useMemberStore } from '../stores/member';
import { useConversationStore } from '../stores/conversation';
import { useQuestStore } from '../stores/quests';
import { useGuildStore } from '../stores/guilds';
import { useChannelStore } from '../stores/channel';
//import { trackStores } from '../stores/baseStore';
import type { Member } from '../types'; // Adjust to your actual Member type

// Declare $userLoaded on Vue's global properties
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    /** Resolves once the current user is loaded */
    $userLoaded: Promise<Member | null>;
  }
}

let lastUserId: number | undefined;

/**
 * Resets all relevant stores if the logged-in member changes.
 *
 * A transient member_id of undefined (e.g. the brief window between
 * a token being set and the member record being fetched) must not
 * update lastUserId — otherwise a later, unrelated refetch of the same
 * still-logged-in member's data looks like a "new" member and wipes
 * guild/quest/conversation state out from under the current page.
 */
export function resetIfMemberChanged(member_id: number | undefined): void {
  if (member_id === undefined) return;
  if (member_id !== lastUserId) {
    const questsStore = useQuestStore();
    const guildsStore = useGuildStore();
    const conversationStore = useConversationStore();
    const channelStore = useChannelStore();

    questsStore.resetQuests();
    guildsStore.resetGuilds();
    conversationStore.resetConversation();
    channelStore.resetChannel();

    lastUserId = member_id;
  }
}

export default boot(async ({ app }) => {
  let userLoadedResolve: ((member: Member | null) => void) | null = null;

  app.config.globalProperties.$userLoaded = new Promise<Member | null>(
    (resolve) => {
      userLoadedResolve = resolve;
    },
  );

  const memberStore = useMemberStore();
  const member = await memberStore.ensureLoginUser();

  userLoadedResolve?.(member ?? null);
  if (member) {
    const prevTokenExpiry = Number.parseInt(
      window.localStorage.getItem('tokenExpiry') ?? '0',
      10,
    );
    const prevToken = window.localStorage.getItem('token') ?? '';
    const interval = Math.max(0, prevTokenExpiry - Date.now() - 10_000);

    window.setTimeout(() => {
      memberStore.renewToken(prevToken).catch(console.error);
    }, interval);
  }

  memberStore.$subscribe((_mutation, state) => {
    const member_id = state.member?.id;
    resetIfMemberChanged(member_id ? member_id : undefined);

    const router = app.config.globalProperties.$router;
    if (!member_id && router.currentRoute.value.path === '/login') {
      router.push('/account');
    }
  });
});
