export interface GuildMembership {
  guild_id: number;
  member_id: number;
  permissions: string[];
  available_roles?: string[];
  status: string;
  created_at: string;
  updated_at: string;
}
export interface QuestMembership {
  quest_id: number;
  member_id: number;
  permissions: string[];
  confirmed: boolean;
  created_at: string;
  updated_at: string;
}
export interface Casting {
  guild_id: number;
  quest_id: number;
  member_id: number;
  permissions: string[];
  roles?: string[];
  status: string;
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
  permissions: string[];
  guild_membership?: GuildMembership[];
  quest_membership?: QuestMembership[];
  casting?: Casting[];
}

export interface GamePlay {
  quest_id: number;
  guild_id: number;
  status: string;
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
  status: string;
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
  parent: number;
  ancestry: string;
  node_type: string;
  status: string;
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
