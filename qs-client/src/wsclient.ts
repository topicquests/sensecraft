import type { Store } from "vuex";
import RobustWebSocket from "robust-websocket";
import store from "./boot/store";

export default class WSClient {
  ws: RobustWebSocket;
  connected = false;
  login_message: string = null;
  constructor(url) {
    function shouldReconnect (event, ws) {
      if (event.type === 'online') return 0
      return Math.pow(1.5, ws.attempts) * 500
    }

    shouldReconnect.handle1000 = true;
    this.ws = new RobustWebSocket(url, null, { shouldReconnect });
    this.ws.addEventListener('open', (event) => {
      console.log("Connected to server");
      this.connected = true;
      if (!this.login_message && store.state.member.member) {
          this.login(store.state.member.member.id, store.state.member.token);
      } else
        if (this.login_message) {
        this.ws.send(this.login_message);
      }
    })
    this.ws.addEventListener('message', (event) => {
      this.onMessage(event)
    })
    this.ws.addEventListener('close', (event) => {
      console.log("Disconnected from server");
      this.connected = false;
    })
  }
  login(id: number, token: string) {
    this.login_message = `LOGIN ${id} ${token}`;
    if (this.connected) {
      console.log("sending")
      this.ws.send(this.login_message);
    }
  }
  logout() {
    this.login_message = null;
    if (!this.connected) return;
    this.ws.send(`LOGOUT`)
  }
  setDefaultGuild(id: number) {
    if (!this.connected) return;
    if (id)
      this.ws.send(`GUILD ${id}`)
    else
      this.ws.send('GUILD')
  }
  setDefaultQuest(id: number) {
    if (!this.connected) return;
    if (id)
      this.ws.send(`QUEST ${id}`)
    else
    this.ws.send('QUEST')
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
          store.dispatch("conversation/fetchConversationNode", { params: { id } });
        }
        break;
      default:
        console.warn(`Unhandled ws event: ${event}`);
    }
  }
}

let ws_client: WSClient;

export function initWSClient(url) {
  // dynamic because of circular dependency in store
  if (!ws_client) {
    ws_client = new WSClient(url);
  }
  return ws_client;
}

export function getWSClient() {
  return ws_client;
}
