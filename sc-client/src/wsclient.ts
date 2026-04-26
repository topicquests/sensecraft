import RobustWebSocket from 'robust-websocket';
import { useMemberStore } from './stores/member';
import { useMembersStore } from './stores/members';
import { useConversationStore } from './stores/conversation';
import { useReadStatusStore } from './stores/readStatus';
import { useQuestStore } from './stores/quests';
import { useGuildStore } from './stores/guilds';
import { token_store } from './boot/axios';

export class WSClient {
  ws: RobustWebSocket;
  connected = false;
  login_message: string | null = null;
  guild_id: number | boolean = false;
  quest_id: number | boolean = false;
  memberStore: any;
  membersStore: any;
  questStore: any;
  guildStore: any;
  conversationStore: any;
  readStatusStore: any;
  constructor(url: string) {
    const memberStore = useMemberStore();
    this.memberStore = memberStore;
    this.membersStore = useMembersStore();
    this.conversationStore = useConversationStore();
    this.readStatusStore = useReadStatusStore();
    this.questStore = useQuestStore();
    this.guildStore = useGuildStore();

    function shouldReconnect(event, ws) {
      if (event.type === 'online') return 0;
      return Math.pow(1.5, ws.attempts) * 500;
    }

    shouldReconnect.handle1000 = true;
    this.ws = new RobustWebSocket(url, null, { shouldReconnect });
    this.ws.addEventListener('open', () => {
      console.log('Connected to server');
      this.connected = true;
      if (
        !this.login_message &&
        memberStore.member &&
        token_store.tokenIsValid()
      ) {
        this.login(memberStore.member.id!, memberStore.token!);
      } else if (this.login_message) {
        this._send(this.login_message);
      }
      this.setDefaultQuest(this.quest_id);
      this.setDefaultGuild(this.guild_id);
    });
    this.ws.addEventListener('message', async (event: Event) => {
      console.log('WS<-', (event as MessageEvent).data);
      await this.onMessage(event);
    });
    this.ws.addEventListener('close', () => {
      console.log('Disconnected from server');
      this.connected = false;
    });
  }
  _send(msg: string) {
    console.log('WS->', msg);
    this.ws.send(msg);
  }
  login(id: number, token: string) {
    this.login_message = `LOGIN ${id} ${token}`;
    if (this.connected) {
      this._send(this.login_message);
    }
  }
  logout() {
    this.login_message = null;
    if (!this.connected) return;
    this._send('LOGOUT');
  }
  setDefaultGuild(id: number | boolean) {
    this.guild_id = id;
    if (!this.connected) return;
    if (id === true) this._send('GUILD *');
    else if (id === false) this._send('GUILD');
    else this._send(`GUILD ${id}`);
  }
  setDefaultQuest(id: number | boolean) {
    this.quest_id = id;
    if (!this.connected) return;
    if (id === true) this._send('QUEST *');
    else if (id === false) this._send('QUEST');
    else this._send(`QUEST ${id}`);
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
      case 'conversation_node':
        if (crud == 'D') {
          // TODO
        } else {
          const node = await this.conversationStore.fetchConversationNode(id);
          const rootid: number = Number(node.ancestry.split('.')[0]);
          if (
            node.meta == 'channel' ||
            this.readStatusStore.readStatus[rootid] !== undefined
          ) {
            await this.readStatusStore.fetchReadStatus({ rootid });
          }
        }
        break;
      case 'quests':
        if (crud == 'D') {
          // TODO
        } else {
          await this.questStore.fetchQuestById(id, true);
        }
        break;
      case 'guilds':
      case 'guild_membership':
        if (crud == 'D') {
          // TODO
        } else {
          await this.guildStore.fetchGuildsById(id, true);
        }
        break;
      case 'members':
      case 'casting':
      case 'casting_role':
        await this.membersStore.fetchMemberById(id, true);
        if (this.questStore.currentQuest && typeof this.questStore.currentQuest === 'number')                                                                                       
          await this.questStore.fetchQuestById(this.questStore.currentQuest, true);                                                                                                   
        if (this.memberStore.member.id == id)
          await this.memberStore.fetchLoginUser();
        break;
      default:
        console.warn(`Unhandled ws event: ${event}`);
    }
  }
}

let ws_client: WSClient;

export function initWSClient(url: string) {
  // dynamic because of circular dependency in store
  if (!ws_client) {
    ws_client = new WSClient(url);
  }
  return ws_client;
}

export function getWSClient() {
  return ws_client;
}
