import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { PseudoNode, ConversationNode, Member } from '../../qs-client/src/types';

function enhanceError(err) {
  const response = err.response || { data: {} };
  if (response)
    err.message = `${err.message}: ${response.data.message}`;
  console.log(response.status, response.data.message);
}


const postgrest_operators = Object.fromEntries(['eq', 'gt', 'gte', 'lt', 'lte', 'neq', 'like', 'ilike', 'is', 'fts', 'plfts', 'phfts', 'wfts', 'cs', 'cd', 'ov', 'sl', 'sr', 'nxr', 'nxl', 'adj', 'not'].map(x=>[x, true]));

class AxiosUtil {
  axios: AxiosInstance;
  constructor(baseURL) {
    this.axios = axios.create({ baseURL });
  }
  headers(token: string, headers: { [key: string]: string } = {}): { headers?: { [key: string]: string } } {
    if (token)
      headers.Authorization = `Bearer ${token}`;
    return Object.keys(headers).length ? { headers } : {};
  }

  as_params(id) {
    return Object.fromEntries(
      Object.entries(id).map(([key, value]) => [key, (postgrest_operators[String(value).split('.')[0]]) ? value : `eq.${value}`]));
  }

  async get(path, id, token) {
    const params = this.as_params(id);
    try {
      const response = await this.axios.get(path, { params, ... this.headers(token) });
      return response.data;
    } catch (error) {
      enhanceError(error);
      throw error;
    }
  }

  async delete(path, id, token) {
    const params = this.as_params(id);
    try {
      const headers = this.headers(token, { Prefer: 'return=representation' });
      const response = await this.axios.delete(path, { params, ...headers });
      return response.data;
    } catch (error) {
      enhanceError(error);
      throw error;
    }
  }

  async create(path, data, token) {
    try {
      const headers = this.headers(token, { Prefer: 'return=representation' });
      const params = { select: '*' }; // TODO: identify pkeys to only ask for them
      const response = await this.axios.post(path, data, { params, ...headers });
      const locationParts = response.headers.location.split('?')[1].split('&');
      const location = Object.fromEntries(locationParts.map((p) => {
        const [k, v] = p.split('=');
        return [k, v.substring(3)];
      }));
      return location;
    } catch (error) {
      enhanceError(error);
      throw error;
    }
  }

  async update(path, id, data, token) {
    try {
      const params = this.as_params(id);
      const headers = this.headers(token, { Prefer: 'return=representation' });
      const response = await this.axios({
        method: 'patch',
        url: path,
        data, params,
        ...headers
      });
      return response.data;
    } catch (error) {
      enhanceError(error);
      throw error;
    }
  }

  async call(fn, params, token?, readonly=false) {
    try {
      if (readonly) {
        const response = await this.axios.get(`/rpc/${fn}`, { params, ... this.headers(token) });
        return response.data;
      } else {
        const response = await this.axios.post(`/rpc/${fn}`, params, this.headers(token));
        return response.data;
      }
    } catch (error) {
      enhanceError(error);
      throw error;
    }
  }
}

export const axiosUtil = new AxiosUtil('http://localhost:3001');

export async function add_members(members: Partial<Member>[]) {
  const memberIds = {};
  const memberTokens = {};
  for (const member of members) {
    try {
      memberIds[member.handle] = await axiosUtil.call('create_member', member);
      memberTokens[member.handle] = await axiosUtil.call('get_token', {
        mail: member.email, pass: member.password
      }, null, false);
    } catch (err) {
      break;
    }
  }
  return {memberIds, memberTokens};
}

export async function get_base_roles(adminToken) {
  return await axiosUtil.get('role', {}, adminToken);
}

export function get_system_role_by_name(roles, name) {
  return roles.find((role) => role.name === name && role.guild_id === null);
}

export async function delete_members(memberIds, adminToken) {
  for (const memberId of Object.values(memberIds || {})) {
    await axiosUtil.delete('members', {id: memberId}, adminToken);
  }
}

export async function add_nodes(nodes: Partial<PseudoNode>[], quest_id: number, member_tokens, node_ids: { [key: string]: number }) {
  node_ids = node_ids || {};
  for (const nodeData of nodes) {
    const {id, creator_id, parent_id, guild_id, ...rest} = nodeData;
    const parent_dbid = (parent_id)?node_ids[parent_id]:undefined;
    if (parent_id && !parent_dbid) {
      throw Error('missing parent');
    }
    const node: Partial<ConversationNode> = {
      parent_id: parent_dbid,
      ...rest,
      quest_id,
      guild_id: (typeof(guild_id) == 'string') ? parseInt(guild_id): guild_id,
    };
    const member_token = member_tokens[creator_id];
    console.log(node);
    const id_data = await axiosUtil.create('conversation_node', node, member_token);
    node_ids[id] = parseInt(id_data.id);
  }
  return node_ids;
}

export async function delete_nodes(nodes, node_ids, adminToken) {
  for (const local_id of nodes) {
    const id = node_ids[local_id];
    await axiosUtil.delete('conversation_node', {id}, adminToken);
    delete node_ids[local_id];
  }
}
