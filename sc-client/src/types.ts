import {
  permission_type,
  registration_status_type,
  quest_status_type,
  ibis_node_type_type,
  publication_state_type,
  meta_state_type,
  game_play_status_type,
} from './enums';

export type KeyArray<T> = Array<keyof T>;

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
  confirmed: boolean;
  last_login: string;
  last_login_email_sent: string;
}

export const memberPatchKeys: KeyArray<Member> = [
  'id',
  'email',
  'handle',
  'permissions',
  'password',
  'name',
  'confirmed',
];

export interface GamePlay {
  quest_id: number;
  guild_id: number;
  status: registration_status_type;
  game_status: game_play_status_type;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  scores?: { [key: generic_id]: number };
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
  turn_based: boolean;
  status: quest_status_type;
  start: string;
  end: string;
  created_at: string;
  updated_at: string;
  quest_membership?: QuestMembership[];
  casting?: Casting[];
  game_play: [];
}

export const questPatchKeys: KeyArray<Quest> = [
  'id',
  'handle',
  'name',
  'description',
  'public',
  'turn_based',
  'status',
  'start',
  'end',
];

export interface QuestData extends Quest {
  last_node_published_at: string;
  node_count: number;
  confirmed_guild_count: number;
  interested_guild_count: number;
  player_count: number;
  is_playing: boolean;
  my_confirmed_guild_count: number;
  my_recruiting_guild_count: number;
  is_quest_member: boolean;
}

export interface BaseConversationNode {
  node_type: ibis_node_type_type;
  status: publication_state_type;
  created_at: string;
  published_at: string;
  updated_at: string;
  title: string;
  description: string;
  url: string;
  meta: meta_state_type;
  draft_for_role_id: number;
}

export interface ConversationNode extends BaseConversationNode {
  id: number;
  quest_id: number;
  guild_id?: number;
  creator_id: number;
  parent_id?: number;
  ancestry: string;
}

export const conversationNodePatchKeys: KeyArray<ConversationNode> = [
  'id',
  'quest_id',
  'guild_id',
  'creator_id',
  'parent_id',
  'node_type',
  'status',
  'title',
  'description',
  'url',
  'meta',
  'draft_for_role_id',
];

export interface QTreeNode extends ConversationNode {
  // id: number | string;
  children?: QTreeNode[];
  label: string;
  color?: string;
  icon?: string;
  parent?: QTreeNode;
}

export interface ReadStatus {
  node_id: number;
  member_id: number;
  seconds_shown: number;
  status: boolean;
}

export interface ReadStatusData extends ReadStatus {
  node_count: number;
  read_count: number;
}

export type generic_id = number | string;
export interface PseudoNode extends BaseConversationNode {
  id: generic_id;
  quest_id: generic_id;
  guild_id?: generic_id;
  creator_id: generic_id;
  parent_id?: generic_id;
  children?: PseudoNode[];
}

export type MaybeRealNode = PseudoNode | QTreeNode;

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
  default_role_id: number | null | undefined;
  guild_membership?: GuildMembership[];
  game_play: GamePlay[];
  casting?: Casting[];
}

export const guildPatchKeys: KeyArray<Guild> = [
  'id',
  'handle',
  'name',
  'description',
  'creator',
  'public',
  'open_for_applications',
  'application_needs_approval',
  'default_role_id',
];

export interface GuildData extends Guild {
  member_count: number;
  member_request_count: number;
  is_member: boolean;
  is_admin: boolean;
  last_node_published_at: string;
  node_count: number;
  ongoing_quests_count: number;
  finished_quests_count: number;
  recruiting_for_quest_count: number;
}

export interface RoleNodeConstraint {
  role_id: number;
  node_type: ibis_node_type_type;
  max_pub_state?: publication_state_type;
  role_draft_target_role_id?: number;
}

export interface Role {
  id: number | null;
  name: string;
  guild_id: number;
  permissions?: permission_type[];
  max_pub_state?: publication_state_type;
  role_draft_target_role_id?: number;
  role_node_constraint?: RoleNodeConstraint[];
}

export const rolePatchKeys: KeyArray<Role> = [
  'id',
  'name',
  'guild_id',
  'permissions',
  'max_pub_state',
  'role_draft_target_role_id',
];

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

export interface defaultNodeType {
  quest_id?: number;
  title?: string;
  description?: string;
  status: string;
  node_type: string;
}

export type ServerData = {
  smtp_server: string;
  smtp_port: number;
  smtp_auth_method: string;
  smtp_secure: boolean;
  smtp_username: string;
  smtp_password: string;
  server_url: string;
  confirm_account_mail_template_title: string;
  confirm_account_mail_template_text: string;
  confirm_account_mail_template_html: string;
  reset_password_mail_template_title: string;
  reset_password_mail_template_text: string;
  reset_password_mail_template_html: string;
};
