import {
  Casting,
  ConversationNode,
  GamePlay,
  GuildData,
  GuildMemberAvailableRole,
  GuildMembership,
  Member,
  QuestData,
  QuestMembership,
  Role,
} from 'src/types';
import { ChannelsReadMap, ReadStatusMap } from 'src/stores/readStatus';
import { registration_status_enum } from 'src/enums';
export const mockCasting: Casting = {
  guild_id: 1,
  quest_id: 1,
  member_id: 1,
  permissions: [],
  status: 'request',
  created_at: '',
  updated_at: '',
};

export const mockGuildMemberAvailableRole: GuildMemberAvailableRole = {
  guild_id: 1,
  member_id: 1,
  role_id: 1
};
export const mockRole: Role = {
  id: 1,
  name: 'Researcher',
  guild_id: null,
  max_pub_state: 'guild_draft',
  permissions: null,
  role_draft_target_role_id: null,
  role_node_constraint: [
    {
      max_pub_state: 'proposed',
      node_type: 'reference',
      role_id: 1,
      role_draft_target_role_id: null,
    },
  ],
};
export const mockGuildMembership: GuildMembership = {
  guild_id: 1,
  member_id: 1,
  permissions: [],
  status: registration_status_enum.confirmed,
  created_at: undefined,
  updated_at: undefined,
};
export const mockQuestMembership: QuestMembership = {
  quest_id: 1,
  member_id: 1,
  permissions: [],
  confirmed: true,
  created_at: '',
  updated_at: '',
};
export const mockGamePlay: GamePlay = {
  quest_id: 1,
  guild_id: 1,
  status: 'request',
  game_status: 'confirmed',
  created_at: '',
  updated_at: '',
};
export const mockConversation: ConversationNode = {
  id: 1,
  quest_id: 1,
  creator_id: 0,
  ancestry: '',
  node_type: 'reference',
  status: 'guild_draft',
  created_at: '',
  published_at: '',
  updated_at: '',
  title: '',
  description: '',
  url: '',
  meta: 'channel',
  draft_for_role_id: 0,
};
export const mockGuild: GuildData = {
  id: 1,
  handle: 'TestGuild',
  slug: undefined,
  name: 'Test Guild',
  description: 'This is a test guild',
  creator: undefined,
  public: true,
  open_for_applications: false,
  created_at: undefined,
  updated_at: undefined,
  application_needs_approval: undefined,
  default_role_id: undefined,
  guild_membership: [],
  game_play: [mockGamePlay],
  casting: [mockCasting],
  member_count: 0,
  member_request_count: 0,
  is_member: false,
  is_admin: false,
  last_node_published_at: '2024-09-16T08:38:43.907127-07:00',
  node_count: 0,
  ongoing_quests_count: 0,
  finished_quests_count: 0,
  recruiting_for_quest_count: 0,
};

export const mockGuildAfterJoin = {
  ...mockGuild,
  guild_membership: [mockGuildMembership],
  is_member: true,
  member_count: 1,
};

export const mockNode: ConversationNode = {
  id: 1,
  quest_id: 1,
  guild_id: null,
  creator_id: 1,
  ancestry: '1',
  node_type: 'question',
  status: 'proposed',
  created_at: '2024-08-02T09:25:27.964354-07:00',
  published_at: '',
  updated_at: '2024-08-02T09:25:27.964354-07:00',
  title: 'Test Node',
  description: 'Test node description',
  url: null,
  meta: 'conversation',
  draft_for_role_id: null,
};
export const mockChannel: ConversationNode = {
  id: 2,
  quest_id: 1,
  creator_id: 1,
  ancestry: '',
  node_type: 'question',
  status: 'obsolete',
  created_at: '',
  published_at: '',
  updated_at: '',
  title: '',
  description: '',
  url: '',
  meta: 'meta',
  draft_for_role_id: 0,
};

export const mockChannelsReadStatus: ChannelsReadMap = {
  2: {
    quest_id: 1,
    read: 1,
    unread: 1,
  },
};

export const mockChannelStatusMap: ReadStatusMap = {
  2: {
    node_count: 2,
    read_count: 1,
    node_id: 1,
    member_id: 1,
    status: true,
    seconds_shown: 0
  },
};

export const mockMember: Member = {
  id: 1,
  email: 'johnsmith@email.com',
  handle: 'JohnSmith',
  slug: 'johnsmith',
  permissions: [],
  guild_membership: [],
  quest_membership: undefined,
  casting: undefined,
  casting_role: undefined,
  guild_member_available_role: [],
  password: undefined,
  created_at: undefined,
  updated_at: undefined,
  name: 'John Smith',
  confirmed: true,
  last_login: undefined,
  last_login_email_sent: undefined,
};

export const mockMemberAfterJoin: Member = {
  ...mockMember,
  guild_membership: [mockGuildMembership],
};

export const mockQuest: QuestData = {
  last_node_published_at: '2024-09-16T08:38:43.907127-07:00',
  node_count: 0,
  confirmed_guild_count: 0,
  interested_guild_count: 0,
  player_count: 0,
  is_playing: true,
  my_confirmed_guild_count: 0,
  my_recruiting_guild_count: 0,
  is_quest_member: false,
  id: 1,
  handle: 'TestQuest',
  slug: '',
  name: 'Test Quest',
  description: 'This is a test quest',
  creator: 0,
  public: true,
  turn_based: false,
  status: 'ongoing',
  start: '',
  end: '',
  created_at: '',
  updated_at: '',
  quest_membership: [mockQuestMembership],
  casting: [mockCasting],
  game_play: [mockGamePlay],
};
