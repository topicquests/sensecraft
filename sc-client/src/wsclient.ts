import type { Store } from "vuex";
import RobustWebSocket from "robust-websocket";
import { useMemberStore } from './stores/member'
import { useMembersStore } from './stores/members'
import { useConversationStore } from './stores/conversation'
import { useQuestStore } from './stores/quests'
import { useGuildStore } from './stores/guilds'

export class WSClient {
  const memberStore = useMemberStore();
  const membersStore = useMembersStore();
  const conversationStore = useConversationStore();
  const questStore = useQuestStore();
  const guildStore = useGuildStore();
  ws: RobustWebSocket;
  connected = false;
  login_message: string = null;
  store: Store<any>;
  guild_id: number | boolean = false;
  quest_id: number | boolean = false;
  constructor(store, url) {
    this.store = store;
    function shouldReconnect(event, ws) {
      if (event.type === "online") return 0;
      return Math.pow(1.5, ws.attempts) * 500;
    }

    shouldReconnect.handle1000 = true;
    this.ws = new RobustWebSocket(url, null, { shouldReconnect });
    this.ws.addEventListener("open", (event) => {
      console.log("Connected to server");
      this.connected = true;
      if (
        !this.login_message &&
        memberStore.member.member &&
       memberStore.tokenIsValid()
      ) {
        this.login(
          memberStore.member.member.id,
          memberStore.member.token
        );
      } else if (this.login_message) {
        this.ws.send(this.login_message);
      }
      this.setDefaultQuest(this.quest_id);
      this.setDefaultGuild(this.guild_id);
    });
    this.ws.addEventListener("message", (event: Event) => {
      this.onMessage(event);
    });
    this.ws.addEventListener("close", (event) => {
      console.log("Disconnected from server");
      this.connected = false;
    });
  }
  login(id: number, token: string) {
    this.login_message = `LOGIN ${id} ${token}`;
    if (this.connected) {
      console.log("sending");
      this.ws.send(this.login_message);
    }
  }
  logout() {
    this.login_message = null;
    if (!this.connected) return;
    this.ws.send(`LOGOUT`);
  }
  setDefaultGuild(id: number | boolean) {
    this.guild_id = id;
    if (!this.connected) return;
    if (id === true) this.ws.send("GUILD *");
    else if (id === false) this.ws.send("GUILD");
    else this.ws.send(`GUILD ${id}`);
  }
  setDefaultQuest(id: number | boolean) {
    this.quest_id = id;
    if (!this.connected) return;
    if (id === true) this.ws.send("QUEST *");
    else if (id === false) this.ws.send("QUEST");
    else this.ws.send(`QUEST ${id}`);
  }
  async onMessage(event) {
    const parts = /^([CUD]) (\w+) (\d+)$/.exec(event.data);
    if (!parts) {
      console.error(`Unknown ws event: ${event}`);
      return;
    }
    const [_, crud, otype, id_s] = parts;
    const id = parseInt(id_s);
    // note we will not await the dispatch, as we don't want to block the websocket
    switch (otype) {
      case "conversation_node":
        if (crud == "D") {
          // TODO
        } else {
          await conversationStore.fetchConversationNode({
            params: { id },
          });
        }
        break;
      case "quests":
        if (crud == "D") {
          // TODO
        } else {
          await questStore.fetchQuestById({
            full: true,
            params: { id },
          });
        }
        break;
      case "guilds":
      case "guild_membership":
        if (crud == "D") {
          // TODO
        } else {
          await guildStore.fetchGuildById({
            full: true,
            params: { id },
          });
        }
        break;
      case "members":
        await membersStore.fetchMemberById({
          full: true,
          params: { id },
        });
        if (memberStore.member.id == id)
          await memberStore.fetchLoginUser();
        break;
      default:
        console.warn(`Unhandled ws event: ${event}`);
    }
  }
}

let ws_client: WSClient;

export function initWSClient(store: Store<any>, url: string) {
  // dynamic because of circular dependency in store
  if (!ws_client) {
    ws_client = new WSClient(store, url);
  }
  return ws_client;
}

export function getWSClient() {
  return ws_client;
}
