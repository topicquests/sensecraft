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

export interface Conversation {
  title: string;
  conv: string;
}
export const admin: Partial<Member> = {
  name: 'Admin',
  handle: 'admin',
  password: 'admin',
  email: 'admin@example.com',
};

export const questCreator: Partial<Member> = {
  name: 'Quest Creator',
  handle: 'questCreator',
  password: 'password',
  email: 'questcreator@example.com',
};

export const guildCreator1: Partial<Member> = {
  name: 'Guild Creator1',
  handle: 'guildCreator1',
  password: 'password',
  email: 'guildcreator1@example.com',
};
export const guildCreator1Conv: Conversation = {
  title: 'Welcome Black Knights',
  conv: `Welcome, brave soul! We're thrilled to have you with us.
  The Black Knights are more than a guild — we're a team built on strategy, shared purpose, and respect.
  Before we charge into quests together, let's get to know you.`,
};

export const guildCreator1QuestConv: Conversation = {
  title: 'What systemic changes are needed to combat climate change?',
  conv: 'As game leader, I propose we investigate the core systemic shifts required across energy, policy, and behaviour to meaningfully address climate change.',
};
export const player1Conv: Conversation = {
  title: 'Climate responsibility as a moral imperative',
  conv: 'From a philosophical perspective, we have an ethical obligation to future generations. Climate action is not merely practical — it is a matter of moral duty rooted in justice and care.',
};
export const player2Conv: Conversation = {
  title: 'Economic barriers to effective climate policy',
  conv: 'While climate action is critical, economic constraints pose significant challenges. Short-term costs, unequal burdens on developing nations, and political resistance create real headwinds to systemic change.',
};
export const player3Conv: Conversation = {
  title: 'IPCC Synthesis Report: Key climate findings',
  conv: 'The Intergovernmental Panel on Climate Change reports that global temperatures have already risen 1.1°C above pre-industrial levels, with cascading effects on ecosystems, sea levels, and extreme weather events.',
};
export const player4Conv: Conversation = {
  title: 'Guild 1 climate consequences overview',
  conv: 'Summarising our guild\'s exploration of climate change consequences: rising temperatures, disrupted ecosystems, displaced communities, and economic instability are the dominant themes emerging from our discussion.',
};
export const player5Conv: Conversation = {
  title: 'NASA climate data and accelerating trends',
  conv: 'NASA satellite data reveals accelerating changes in global climate patterns, including shrinking ice sheets, rising sea levels, and increasing frequency of extreme weather events over the past three decades.',
};

export const guildCreator2QuestConv: Conversation = {
  title: 'How can communities adapt to climate change impacts?',
  conv: 'As game leader of Coherence, I challenge us to explore community-level adaptations — how can societies reorganise, innovate, and support one another in the face of accelerating climate disruption?',
};
export const player6Conv: Conversation = {
  title: 'Environmental ethics and our climate responsibility',
  conv: 'Philosophically, our relationship with nature demands a rethinking of human values. A coherent environmental ethics places long-term ecological wellbeing at the centre of human decision-making.',
};
export const player7Conv: Conversation = {
  title: 'Structural challenges in international climate cooperation',
  conv: 'Despite broad scientific consensus, international climate cooperation faces deep structural barriers: diverging national interests, enforcement gaps in existing agreements, and inequitable distribution of historical emissions.',
};
export const player8Conv: Conversation = {
  title: 'World Bank climate adaptation strategies',
  conv: 'World Bank research identifies key adaptation strategies for developing nations including early warning systems, climate-resilient infrastructure, social protection programmes, and ecosystem-based approaches.',
};
export const player9Conv: Conversation = {
  title: 'Guild 2 climate adaptation synthesis',
  conv: 'Our guild\'s diverse perspectives converge on the need for multi-level adaptation: international frameworks, national policy, community resilience, and individual behaviour change must all advance together.',
};
export const player10Conv: Conversation = {
  title: 'UNEP Emissions Gap Report: Critical findings',
  conv: 'The UNEP Emissions Gap Report highlights a widening gap between current national pledges and the reductions needed to limit warming to 1.5°C, calling for immediate and drastic scaling of climate action.',
};

// Cross-guild responses — added after both guilds have published their trees.
// Guild 1 players respond to Guild 2 published nodes.
export const guildCreator1Response: Conversation = {
  title: 'What can Black Knights learn from Coherence\'s adaptation approach?',
  conv: 'Coherence raises vital questions about community-level adaptation. How might our guild integrate their frameworks into our own systemic analysis?',
};
export const player1Response: Conversation = {
  title: 'Philosophical grounds for cooperation across guilds',
  conv: 'The structural challenges player7 raises are real, but philosophy offers a counter: shared values and ethical commitments can bridge institutional gaps where policy alone fails.',
};
export const player2Response: Conversation = {
  title: 'Coherence\'s adaptation framing misses economic drivers',
  conv: 'While player6\'s ethical framing is compelling, it underestimates the economic incentives that shape or block adaptation at scale. A critical lens reveals deeper structural constraints.',
};
export const player3Response: Conversation = {
  title: 'World Bank adaptation strategies: corroborating evidence',
  conv: 'Player8\'s World Bank findings align with and extend the IPCC data. Together these sources build a stronger empirical case for targeted investment in climate-resilient infrastructure.',
};
export const player4Response: Conversation = {
  title: 'Guild 1 reflection on Guild 2 synthesis',
  conv: 'Player9\'s synthesis captures the multi-level nature of adaptation well. Documenting this cross-guild convergence strengthens the overall quest narrative.',
};
export const player5Response: Conversation = {
  title: 'UNEP and NASA data: a converging picture',
  conv: 'The UNEP Emissions Gap data in player10\'s reference converges with NASA satellite observations, reinforcing the urgency of accelerating emissions reductions alongside adaptation efforts.',
};

// Guild 2 players respond to Guild 1 published nodes.
export const guildCreator2Response: Conversation = {
  title: 'How does systemic change connect to community adaptation?',
  conv: 'Black Knights\' systemic focus complements Coherence\'s community lens. What bridges can we build between top-down systemic reform and bottom-up community resilience?',
};
export const player6Response: Conversation = {
  title: 'Ethics as a foundation for overcoming economic barriers',
  conv: 'Player2 correctly identifies economic barriers, yet environmental ethics provides the moral framework that motivates action even where immediate economic incentives are absent.',
};
export const player7Response: Conversation = {
  title: 'Climate responsibility framing overlooks power asymmetries',
  conv: 'Player1\'s moral imperative argument is persuasive in principle, but in practice responsibility is unevenly distributed. Structural power must be addressed alongside ethical obligation.',
};
export const player8Response: Conversation = {
  title: 'IPCC findings and adaptation: bridging mitigation and resilience',
  conv: 'Player3\'s IPCC reference highlights mitigation imperatives. Pairing these with World Bank adaptation strategies reveals a complementary framework: reduce emissions and build resilience simultaneously.',
};
export const player9Response: Conversation = {
  title: 'Synthesising both guilds\' climate perspectives',
  conv: 'Guild 1\'s systemic analysis and Guild 2\'s adaptation focus together form a complete picture: meaningful climate action requires structural transformation and community-level resilience in parallel.',
};
export const player10Response: Conversation = {
  title: 'NASA and UNEP data: cross-referencing planetary boundaries',
  conv: 'Player5\'s NASA data and the UNEP Emissions Gap Report together define the scale of the challenge. Both datasets point to the same conclusion: current pledges are insufficient.',
};

export const guildCreator2: Partial<Member> = {
  name: 'Guild Creator2',
  handle: 'guildCreator2',
  password: 'password',
  email: 'guildcreator2@example.com',
};

export const player1: Partial<Member> = {
  name: 'Player One',
  handle: 'playerOne',
  password: 'password',
  email: 'player1@example.com',
};
export const player2: Partial<Member> = {
  name: 'Player Two',
  handle: 'playerTwo',
  password: 'password',
  email: 'player2@example.com',
};
export const player3: Partial<Member> = {
  name: 'Player Three',
  handle: 'playerThree',
  password: 'password',
  email: 'player3@example.com',
};
export const player4: Partial<Member> = {
  name: 'Player Four',
  handle: 'playerFour',
  password: 'password',
  email: 'player4@example.com',
};
export const player5: Partial<Member> = {
  name: 'Player Five',
  handle: 'playerFive',
  password: 'password',
  email: 'player5@example.com',
};
export const player6: Partial<Member> = {
  name: 'Player Six',
  handle: 'playerSix',
  password: 'password',
  email: 'player6@example.com',
};
export const player7: Partial<Member> = {
  name: 'Player Seven',
  handle: 'playerSeven',
  password: 'password',
  email: 'player7@example.com',
};
export const player8: Partial<Member> = {
  name: 'Player Eight',
  handle: 'playerEight',
  password: 'password',
  email: 'player8@example.com',
};
export const player9: Partial<Member> = {
  name: 'Player Nine',
  handle: 'playerNine',
  password: 'password',
  email: 'player9@example.com',
};
export const player10: Partial<Member> = {
  name: 'Player Ten',
  handle: 'playerTen',
  password: 'password',
  email: 'player10@example.com',
};
export const guild1: Partial<GuildData> = {
  name: 'Black Knights',
  description: `Are you seeking a guild that values teamwork, structured communication, and collaborative success? Look no further! Black Knights are now recruiting, and we're excited to welcome new members who thrive in an organized and supportive environment.

Who We Are:
Black Knight is a community of passionate players dedicated to conquering quests We pride ourselves on our ability to co-construct structured conversations that lead to efficient teamwork and enjoyable gameplay. Whether you're a veteran player or just starting, you'll find a home here with us.

What We Offer:
Organized Communication: keeping our discussions and planning structured.
Collaborative Environment: Regularly scheduled events, raids, and activities that are meticulously planned for maximum participation and enjoyment.
Resource Sharing: Access to comprehensive guides, tips, and shared knowledge from experienced members.
Support System: A welcoming community ready to assist with quests, leveling, and in-game challenges.

Our Expectations:
Active Participation: Be present and contribute to guild events and discussions.
Respectful Conduct: Maintain a positive and respectful attitude towards all members.
Effective Communication: Engage in our structured communication channels to stay informed and involved.`,
  handle: 'guildOne',
};
export const guild2: Partial<GuildData> = {
  name: 'Coherence',
  description: `Welcome to Coherence,
  a guild dedicated to helping learners make sense of complex ideas in a coherent manner!
  Our goal is to create a supportive community to enable members to learn and grow together,
  share their insights and perspectives to help each other gain a deeper understanding of complex topics.
  Whether you're an expert in a particular field or just starting out, we welcome all learners who are passionate about making sense of the world around us.
  Let's work together towards building a more coherent and interconnected world!`,
  handle: 'guildTwo',
};

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
  role_id: 1,
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
    seconds_shown: 0,
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
Approach this with curiosity, skepticism, or storytelling—there's no single path forward, only the challenge to make sense of what's happening and what it might mean.`,
};
export const firstNode: Partial<ConversationNode> = {
  title: 'Updated Root Question',
  description: `investigate the outcomes of large-scale changes shaping our environment, societies, and ways of life.
What transformations are underway? How are they affecting different regions, communities, or systems? Your task is to explore and interpret the ripple effects of global change—what they are, how they unfold, and why they matter.
Approach this with curiosity, skepticism, or storytelling—there's no single path forward, only the challenge to make sense of what's happening and what it might mean.`,
  node_type: 'question',
  status: 'published',
};
