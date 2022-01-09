import {
  permission_type,
  registration_status_type,
  quest_status_type,
  ibis_node_type_type,
  publication_state_type,
  meta_state_type,
} from "./enums";

export interface GuildMembership {
  guild_id: number;
  member_id: number;
  permissions: permission_type[];
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
  status: registration_status_type;
  created_at: string;
  updated_at: string;
}

export interface PublicMember {
  id: number;
  email: string;
  handle: string;
  slug: string;
  permissions: permission_type[];
  guild_membership?: GuildMembership[];
  quest_membership?: QuestMembership[];
  casting?: Casting[];
  casting_role?: CastingRole[];
  guild_member_available_role?: GuildMemberAvailableRole[];
}

export interface Member extends PublicMember {
  password: string;
  created_at: string;
  updated_at: string;
  name: string;
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
  slug: string;
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
  creator_id: number;
  parent_id?: number;
  ancestry: string;
  node_type: ibis_node_type_type;
  status: publication_state_type;
  created_at: string;
  published_at: string;
  title: string;
  description: string;
  url: string;
  meta: meta_state_type;
  draft_for_role_id: number;
}

export interface Guild {
  id: number;
  handle: string;
  slug: string;
  name: string;
  description?: string;
  creator: number;
  public: boolean;
  open_for_applications: boolean;
  created_at: string;
  updated_at: string;
  application_needs_approval: boolean;
  default_role_id: number;
  guild_membership?: GuildMembership[];
  game_play?: GamePlay[];
}

export interface RoleNodeConstraint {
  role_id: number;
  node_type: ibis_node_type_type;
  max_pub_state?: publication_state_type;
  role_draft_target_role_id?: number;
}

export interface Role {
  id: number;
  name: string;
  guild_id: number;
  permissions?: permission_type[];
  max_pub_state?: publication_state_type;
  role_draft_target_role_id?: number;
  role_node_constraint?: RoleNodeConstraint[];
}

export interface GuildMemberAvailableRole {
  guild_id: number;
  member_id: number;
  role_id: number;
}

export interface CastingRole {
  guild_id: number;
  member_id: number;
  role_id: number;
  quest_id: number;
}
