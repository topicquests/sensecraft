import {
  permission_type,
  registration_status_type,
  quest_status_type,
  ibis_node_type_type,
  publication_state_type,
} from "./enums";

export interface GuildMembership {
  guild_id: number;
  member_id: number;
  permissions: permission_type[];
  available_roles?: string[];
  status: registration_status_type;
  created_at: string;
  updated_at: string;
}
export interface QuestMembership {
  quest_id: number;
  member_id: number;
  permissions: permission_type[];
  confirmed: boolean;
  created_at: string;
  updated_at: string;
}
export interface Casting {
  guild_id: number;
  quest_id: number;
  member_id: number;
  permissions: permission_type[];
  roles?: string[];
  status: registration_status_type;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: number;
  email: string;
  password: string;
  handle: string;
  created_at: string;
  updated_at: string;
  name: string;
  permissions: permission_type[];
  guild_membership?: GuildMembership[];
  quest_membership?: QuestMembership[];
  casting?: Casting[];
}

export interface GamePlay {
  quest_id: number;
  guild_id: number;
  status: registration_status_type;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  scores?: Object;
  focus_node_id?: number;
}
export interface Quest {
  id: number;
  handle: string;
  name: string;
  description?: string;
  creator: number;
  public: boolean;
  status: quest_status_type;
  start?: string;
  end?: string;
  created_at: string;
  updated_at: string;
  quest_membership?: QuestMembership[];
  casting?: Casting[];
  game_play?: GamePlay[];
}

export interface ConversationNode {
  id: number;
  quest_id: number;
  guild_id?: number;
  creator: number;
  parent_id?: number;
  ancestry: string;
  node_type: ibis_node_type_type;
  status: publication_state_type;
  created_at: string;
  published_at: string;
  title: string;
  description: string;
}

export interface Guild {
  id: number;
  handle: string;
  name: string;
  description?: string;
  creator: number;
  public: boolean;
  open_for_applications: boolean;
  created_at: string;
  updated_at: string;
  application_needs_approval: boolean;
  guild_membership?: GuildMembership[];
  game_play?: GamePlay[];
}
