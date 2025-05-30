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
} from '../../types';
import { ChannelsReadMap, ReadStatusMap } from '../../stores/readStatus';
import { registration_status_enum } from '../../enums';

export const admin: Partial<Member> = {
  name: "Admin",
  handle: "admin",
  password: "admin",
  email: "admin@example.com",
};

export const questCreator: Partial<Member> = {
  name: "Quest Creator",
  handle: "questCreator",
  password: "password",
  email: "questcreator@example.com",
};

export const guildCreator1: Partial<Member> = {
  name: "Guild Creator1",
  handle: "guildCreator1",
  password: "password",
  email: "guildcreator1@example.com",
};
export const guildCreator2: Partial<Member> = {
  name: "Guild Creator2",
  handle: "guildCreator2",
  password: "password",
  email: "guildcreator2@example.com",
};

export const player1: Partial<Member> = {
  name: "Player One",
  handle: "playerOne",
  password: "password",
  email: "player1@example.com"
};
export const player2: Partial<Member> = {
  name: "Player Two",
  handle: "playerTwo",
  password: "password",
  email: "player2@example.com"
};
export const player3: Partial<Member> = {
  name: "Player Three",
  handle: "playerThree",
  password: "password",
  email: "player3@example.com"
};
export const player4: Partial<Member> = {
  name: "Player Four",
  handle: "playerFour",
  password: "password",
  email: "player4@example.com"
};
export const player5: Partial<Member> = {
  name: "Player Five",
  handle: "playerFive",
  password: "password",
  email: "player5@example.com"
};
export const player6: Partial<Member> = {
  name: "Player Six",
  handle: "playerSix",
  password: "password",
  email: "player6@example.com"
};
export const player7: Partial<Member> = {
  name: "Player Seven",
  handle: "playerSeven",
  password: "password",
  email: "player7@example.com"
};
export const player8: Partial<Member> = {
  name: "Player Eight",
  handle: "playerEight",
  password: "password",
  email: "player8@example.com"
};export const player9: Partial<Member> = {
  name: "Player Nine",
  handle: "playerNine",
  password: "password",
  email: "player9@example.com"
};
export const player10: Partial<Member> = {
  name: "Player Ten",
  handle: "playerTen",
  password: "password",
  email: "player10@example.com"
};
export const guild1: Partial<GuildData> = {
  name: 'Black Knights',
  description:`Are you seeking a guild that values teamwork, structured communication, and collaborative success? Look no further! Black Knights are now recruiting, and we’re excited to welcome new members who thrive in an organized and supportive environment.

Who We Are:
Black Knight is a community of passionate players dedicated to conquering quests We pride ourselves on our ability to co-construct structured conversations that lead to efficient teamwork and enjoyable gameplay. Whether you’re a veteran player or just starting, you’ll find a home here with us.

What We Offer:
Organized Communication: keeping our discussions and planning structured.
Collaborative Environment: Regularly scheduled events, raids, and activities that are meticulously planned for maximum participation and enjoyment.
Resource Sharing: Access to comprehensive guides, tips, and shared knowledge from experienced members.
Support System: A welcoming community ready to assist with quests, leveling, and in-game challenges.

Our Expectations:
Active Participation: Be present and contribute to guild events and discussions.
Respectful Conduct: Maintain a positive and respectful attitude towards all members.
Effective Communication: Engage in our structured communication channels to stay informed and involved.`,
  handle: "guildOne"
}
export const guild2: Partial<GuildData> = {
  name: "Coherence",
  description:`Welcome to Coherence,
  a guild dedicated to helping learners make sense of complex ideas in a coherent manner!
  Our goal is to create a supportive community to enable members to learn and grow together,
  share their insights and perspectives to help each other gain a deeper understanding of complex topics.
  Whether you're an expert in a particular field or just starting out, we welcome all learners who are passionate about making sense of the world around us.
  Let's work together towards building a more coherent and interconnected world!`,
  handle: "guildTwo"
}

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
  guild_id: 1,
  max_pub_state: 'guild_draft',
  permissions: [],
  role_draft_target_role_id: undefined,
  role_node_constraint: [
    {
      max_pub_state: 'proposed',
      node_type: 'reference',
      role_id: 1,
      role_draft_target_role_id: undefined,
    },
  ],
};
export const mockGuildMembership: GuildMembership = {
  guild_id: 1,
  member_id: 1,
  permissions: [],
  status: registration_status_enum.confirmed,
  created_at: '',
  updated_at: '',
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
  slug: '',
  name: 'Test Guild',
  description: 'This is a test guild',
  creator: 1,
  public: true,
  open_for_applications: true,
  created_at: '',
  updated_at: '',
  application_needs_approval: false,
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
  guild_id: undefined,
  creator_id: 1,
  ancestry: '1',
  node_type: 'question',
  status: 'proposed',
  created_at: '2024-08-02T09:25:27.964354-07:00',
  published_at: '',
  updated_at: '2024-08-02T09:25:27.964354-07:00',
  title: 'Test Node',
  description: 'Test node description',
  url: '',
  meta: 'conversation',
  draft_for_role_id: undefined,
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
  created_at: '',
  updated_at: '',
  name: 'John Smith',
  confirmed: true,
  last_login: '',
  last_login_email_sent: '',
};

export const mockMemberAfterJoin: Member = {
  ...mockMember,
  guild_membership: [mockGuildMembership],
};

export const mockQuest: Partial<QuestData> = {
  handle: 'ClimateChangeConsequences',
  name: 'What are the consequences of global climate change',
  description: `The world is shifting in subtle and dramatic ways. In this quest, your team is challenged to investigate the outcomes of large-scale changes shaping our environment, societies, and ways of life.
What transformations are underway? How are they affecting different regions, communities, or systems? Your task is to explore and interpret the ripple effects of global change—what they are, how they unfold, and why they matter.
Approach this with curiosity, skepticism, or storytelling—there’s no single path forward, only the challenge to make sense of what’s happening and what it might mean.`
};
export const firstNode: Partial<ConversationNode> = {
  title: 'Climate change consequences',
  description: `investigate the outcomes of large-scale changes shaping our environment, societies, and ways of life.
What transformations are underway? How are they affecting different regions, communities, or systems? Your task is to explore and interpret the ripple effects of global change—what they are, how they unfold, and why they matter.
Approach this with curiosity, skepticism, or storytelling—there’s no single path forward, only the challenge to make sense of what’s happening and what it might mean.`,
  node_type: 'question',
  status: 'published'
}

