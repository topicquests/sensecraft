import createSubscriber from 'pg-listen';
import type { Subscriber } from 'pg-listen';
import { Client as PGClient } from 'pg';
import WebSocket from 'ws';
import express from 'express';
import { createServer } from 'http';
import axios from 'axios';
import propertiesReader from 'properties-reader';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { SentMessageInfo, Options as SMTPOptions } from 'nodemailer/lib/smtp-transport';

const config = propertiesReader('config.ini')
const _env = process.argv[2] || 'development'
const database: string = config.getRaw(`${_env}.database`) || 'sensecraft'
const databaseURL = `postgres://${config.getRaw(`${_env}.owner`)}:${config.getRaw(`${_env}.owner_password`)}@${config.getRaw('postgres.host')}:${config.getRaw('postgres.port') || 5432}/${database}`
const port = Number(process.env['DISPATCHER_PORT'] || '4000');
const pgst_config = propertiesReader(`postgrest_${_env}.conf`)
const postgrestURL = `http://localhost:${pgst_config.getRaw('server-port')}`


const app: express.Express = express();

const server = createServer(app);
const wss = new WebSocket.Server({ server })

import { registration_status_enum } from '../../qs-client/src/enums'
import { PublicMember, Casting, Role } from '../../qs-client/src/types'

enum ClientStatus {
  CONNECTED,
  IDENTIFIED,
  CLOSED
}

const axiosClient = axios.create({ url: postgrestURL });

const memberQueryString = '*,quest_membership!member_id(*),guild_membership!member_id(*),casting!member_id(*),casting_role!member_id(*),guild_member_available_role!member_id(*)';

type ServerData = {
  smtp_server: string,
  smtp_port: number,
  smtp_auth_method: string,
  smtp_secure: boolean,
  smtp_username: string,
  smtp_password: string,
  server_url: string,
  confirm_account_mail_template_title: string,
  confirm_account_mail_template_text: string,
  confirm_account_mail_template_html: string,
  reset_password_mail_template_title: string,
  reset_password_mail_template_text: string,
  reset_password_mail_template_html: string
}

class Client {
  // The member-specific websocket and member-focused information
  static clients = new Set<Client>();
  static constraintRe = /^([gqpm])(\d+)(:([pr])(\w+))?$/i;
  static messageRe = /^(([CUD] \w+ \d+) (\d+)([ |][gqpGPQM]\d+(:(p\w+|r\d+))?)*)|(E (\w+) (\d+ .*))$/;
  static roles: Map<number, Role> = new Map();
  static guildRolesLoaded: Set<number> = new Set();
  static systemRolesLoaded = false;
  ws: WebSocket.WebSocket;
  status: ClientStatus;
  member?: PublicMember = undefined;
  currentGuild?: number;
  currentQuest?: number;
  token?: string;
  constructor(ws: WebSocket.WebSocket) {
    this.ws = ws
    this.status = ClientStatus.CONNECTED
    this.ws.on('message', this.onMessage.bind(this))
    this.ws.on('close', this.onMessage.bind(this))
    Client.clients.add(this)
  }
  onClose() {
    Client.clients.delete(this)
    this.status = ClientStatus.CLOSED
  }
  hasPermission(permission: string, quest_id?: number, guild_id?: number) {
    const member = this.member
    if (!member) return false
    if (member?.permissions?.find(p => p === permission)) return true
    if (guild_id) {
      const guild_membership = member?.guild_membership?.find(
        gm => gm.guild_id === guild_id && gm.status == registration_status_enum.confirmed)
      if (guild_membership) {
        if (guild_membership.permissions?.find(p => p === permission)) return true
      }
    }
    if (quest_id) {
      const quest_membership = member?.quest_membership?.find(qm => qm.quest_id === quest_id && qm.confirmed)
      if (quest_membership) {
        if (quest_membership.permissions?.find(p => p === permission)) return true
      }
      const casting = member?.casting?.find(gp => gp.quest_id === quest_id)
      if (casting) {
        if (casting.permissions?.find(p => p === permission)) return true
      }
      const castingRoles = member?.casting_role?.filter(cr => cr.quest_id === quest_id) || []
      for (const castingRole of castingRoles) {
        const role = Client.roles.get(castingRole.role_id)
        if (role?.permissions?.find(p => p === permission)) return true
      }
    }
    return false
  }
  hasRole(role_id: number, quest_id?: number, guild_id?: number) {
    const member = this.member
    if (!member) return false
    if (quest_id) {
      return !!(member?.casting_role?.find(cr => cr.quest_id === quest_id && cr.role_id == role_id))
    } else if (guild_id) {
      return !!(member?.guild_member_available_role?.find(ar => ar.guild_id === guild_id && ar.role_id == role_id))
    }
    return false
  }
  async loadMember(id: number) {
    const token = this.token as string;
    const r = await axiosClient.get(
      `${postgrestURL}/members?id=eq.${id}&select=${memberQueryString}`,
      { headers: { Authorization: `Bearer ${token}` } })
    if (r.data.length > 0) {
      this.member = r.data[0]
      this.status = ClientStatus.IDENTIFIED
      const guilds = (this.member?.guild_membership?.filter(
        gm => gm.status == registration_status_enum.confirmed) || []).map(
        gm => gm.guild_id);
      await Client.loadRoles(token, guilds)
    } else {
      throw new Error(`no answer from axios: ${r}`)
    }
  }
  async onMessage(message: Uint8Array | Buffer | number | string) {
    if (typeof (message) === 'number') {
      if (message > 1000 && message < 2000) {
        this.ws.close();
      } else {
        console.warn(`Unknown message: ${message}`)
      }
      return;
    }
    if (typeof message === 'object') {
      message = message.toString();
    }
    console.log(message)
    const parts = message.split(' ')
    try {
      if (parts[0] === 'LOGIN') {
        if (parts.length !== 3) {
          throw new Error(`invalid message: ${message}`)
        }
        const [_, id_s, token] = parts
        const id = Number(id_s)
        this.token = token
        if (id != this.member?.id) {
          // we may just be renewing the token
          await this.loadMember(id)
        }
      } else if (parts[0] === 'LOGOUT') {
        if (parts.length !== 1) {
          throw new Error(`invalid message: ${message}`)
        }
        this.member = undefined;
      } else {
        if (parts.length > 2) {
          throw new Error(`invalid message: ${message}`)
        }
        if (parts[0] == 'GUILD') {
          this.currentGuild = (parts.length > 0) ? Number(parts[1]) : undefined
        } else if (parts[0] == 'QUEST') {
          this.currentQuest = (parts.length > 0) ? Number(parts[1]) : undefined
        } else {
          throw new Error(`invalid message: ${message}`)
        }
      }
    } catch (e) {
      console.error(e)
      this.ws.close()
    }
  }
  static async loadRoles(token: string, guilds: number[]) {
    if (!Client.systemRolesLoaded) {
      const r = await axiosClient.get(
        `${postgrestURL}/role?guild_id=is.null`,
        { headers: { Authorization: `Bearer ${token}` } })
      for (const role of r.data) {
        Client.roles.set(role.id, role)
      }
      Client.systemRolesLoaded = true
    }
    const missingGuilds = guilds.filter(guild => !Client.guildRolesLoaded.has(guild))
    if (missingGuilds.length > 0) {
      const r = await axiosClient.get(
        `${postgrestURL}/role?guild_id=in.(${missingGuilds.join(',')})`,
        { headers: { Authorization: `Bearer ${token}` } })
      for (const role of r.data) {
        Client.roles.set(role.id, role)
      }
      for (const guild of missingGuilds) {
        Client.guildRolesLoaded.add(guild)
      }
    }
  }
  checkConstraint(constraint: string[]) {
    const [type, id, _, subtype, subname] = constraint
    const id_num = Number(id)
    let casting: Casting | undefined;
    switch (type) {
    case 'g':
      return id_num == this.currentGuild;
    case 'q':
      return id_num == this.currentQuest;
    case 'p':
      if (id_num != this.currentQuest) return false;
      casting = this.member?.casting?.find(c => c.quest_id == id_num)
      return casting?.guild_id == this.currentGuild;
    case 'M':
      return this.member?.id == id_num;
    case 'G':
      if (!(this.member?.guild_membership?.some(
        gm => gm.guild_id === id_num && gm.status == registration_status_enum.confirmed)))
        return false;
      if (subtype == 'r')
        return this.hasRole(Number.parseInt(subname), undefined, id_num);
      else if (subtype == 'p')
        return this.hasPermission(subname, undefined, id_num);
      return true;
    case 'Q':
      if (!(this.member?.quest_membership?.some(qm => qm.quest_id === id_num && qm.confirmed)))
        return false;
      if (subtype == 'p')
        return this.hasPermission(subname, id_num)
      break;
    case 'P':
      casting = this.member?.casting?.find(c => c.quest_id == id_num);
      if (!casting) return false;
      if (subtype == 'r')
        return this.hasRole(Number.parseInt(subname), id_num, casting.guild_id);
      else if (subtype == 'p')
        return this.hasPermission(subname, id_num, casting.guild_id);
      return true;
    }
  }

  async onReceive(base: string, member_id: number, constraints_conj_disj: string[][][]) {
    // constraints is a conjunction of disjunctions of constraints
    const [crud, type, id] = base.split(' ')
    if (type == 'role') {
      // update roles
    } else if (this.member?.id == member_id &&
      ['casting', 'guild_member_available_role', 'casting_role', 'quest_membership', 'guild_membership'].includes(type)) {
      // heavy-handed but works
      await this.loadMember(member_id)
    }
    for (const constraint_dis of constraints_conj_disj) {
      let disjunction = false
      for (const constraint of constraint_dis) {
        const [type, id, _, subtype, subname] = constraint
        if (this.checkConstraint(constraint)) {
          disjunction = true;
          break;  // inner
        }
      }
      if (!disjunction) return;
    }
    await this.ws.send(base);
  }
}

class Dispatcher {
  // singleton
  channel: string;
  subscriber: Subscriber;
  pgClient: PGClient;
  next_automation: number | null = null;
  serverData: ServerData | null = null;
  mailer: Transporter<SentMessageInfo> | null = null;

  constructor(channel: string) {
    this.channel = channel;
    this.pgClient = new PGClient({ connectionString: databaseURL })
    this.subscriber = createSubscriber(
      { connectionString: databaseURL },
      {
        parse: (x) => x,
        serialize: (x) => x,
      })
    this.subscriber.notifications.on(channel, this.onReceive.bind(this))
    this.subscriber.events.on('error', this.onError.bind(this))
  }

  async connect() {
    await this.subscriber.connect()
    await this.subscriber.listenTo(database)
    await this.pgClient.connect()
    await this.automation()
    const r = await this.pgClient.query<ServerData>('SELECT * from server_data;')
    const data = r.rows[0]
    this.serverData = data
    const options: SMTPOptions = {
      port: data.smtp_port,
      host: data.smtp_server,
      auth: {
        user: data.smtp_username,
        pass: data.smtp_password,
      },
      secure: data.smtp_secure,
    }
    this.mailer = createTransport(options)
  }

  /*
  Call the automation function and schedule the next call.
  Cases:
  1. First call: timer == next_automation == null => schedule
  2. Called by timer, no other call happened: timer == next_automation != null => schedule
  3. Called because of a quest change: timer = null, next_automation != null
    -> schedule only if next_automation changed.
  4. Called by timer, but another call happened: timer != next_automation != null => don't schedule
  */
  async automation(timer: number | null = null) {
    const r = await this.pgClient.query('SELECT quests_automation()');
    const new_date = r.rows[0].quests_automation as Date;
    if (new_date != null) {
      const new_time = new_date.getTime()
      if (new_time != this.next_automation
        && !(
          timer != null &&
          timer != this.next_automation &&
          this.next_automation == new_time)) {
        console.log(`next automation: ${new_time}`)
        setTimeout(this.automation.bind(this, new_time), new_time - Date.now())
        this.next_automation = new_time
      }
    }
  }

  onError(error: Error) {
    console.error('Fatal database connection error:', error)
    process.exit(1)
  }

  async onReceive(message: string) {
    const parts = Client.messageRe.exec(message)
    if (parts === null) {
      throw new Error(`invalid message: ${message}`)
    }
    const [_, base, member_id_s, constraints_s, _1, _2, _3, _4, command, command_args] = parts
    if (base) {
      const constraints = (constraints_s || '').trim().split(' ').map(c => c.split('|').map(s => {
        const result = ((s != null) ? Client.constraintRe.exec(s) : null);
        return (result !== null) ? result.slice(1, 6) : null;
      }).filter(x => x !== null)) as string[][][];
      const member_id = Number(member_id_s)
      const [crud, type, id] = base.split(' ')
      if (type == 'quests') {
        this.automation();
      }
      for (const client of Client.clients) {
        client.onReceive(base, member_id, constraints)
      }
    } else if (command == 'email') {
      const [member_id, email, confirmed, token, name] = command_args.split(' ', 5);
      const link = `${this.serverData?.server_url}/mail_login?confirmed=${confirmed}&token=${token}`
      console.log('confirmed', confirmed)
      let mailTxt = (confirmed=='t') ? this.serverData?.reset_password_mail_template_text : this.serverData?.confirm_account_mail_template_text;
      let mailHtml = (confirmed=='t') ? this.serverData?.reset_password_mail_template_html : this.serverData?.confirm_account_mail_template_html;
      let mailTitle = (confirmed=='t') ? this.serverData?.reset_password_mail_template_title : this.serverData?.confirm_account_mail_template_title;
      for (const [k, v] of Object.entries({ name, link, email })) {
        mailTxt = mailTxt?.replace(`{${k}}`, v)
        mailHtml = mailHtml?.replace(`{${k}}`, v)
        mailTitle = mailTitle?.replace(`{${k}}`, v)
      }
      await this.mailer?.sendMail({
        from: `sensecraft@${this.serverData?.smtp_server}`,
        to: `${name} <${email}>`,
        subject: mailTitle,
        text: mailTxt,
        html: mailHtml,
      })
      this.pgClient.query(`UPDATE members SET last_login_email_sent=now() WHERE id=${member_id}`)
    } else if (command) {
      console.error('unknown command: ', command);
    } else {
      console.error('neither base nor command', message);
    }
  }
  close() {
    this.subscriber.close()
  }
}

wss.on('connection', function (ws) {
  new Client(ws)
});

const dispatcher = new Dispatcher(database);

process.on('exit', () => {
  dispatcher.close()
})

async function main() {
  await dispatcher.connect();
  server.listen(port, '127.0.0.1', function () {
    console.log(`Listening on http://localhost:${port}`);
  });
}


(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e)
  }
})();
