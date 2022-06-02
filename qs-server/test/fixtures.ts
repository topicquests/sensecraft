import { adminInfo as aig } from './global';
import type { PseudoNode, Member, Guild, Quest } from '../../qs-client/src/types';

export const adminInfo = aig;

export const sponsorInfo: Partial<Member> = {
  email: 'sponsor@example.com',
  handle: 'sponsor',
  name: 'Quest Sponsor',
  password: 'supersecret',
  permissions: ['createQuest']
};
export const leaderInfo: Partial<Member> = {
  email: 'guild_leader@example.com',
  handle: 'guild_leader',
  name: 'Guild Leader',
  password: 'supersecret',
  permissions: ['createGuild']
};
export const quidamInfo: Partial<Member> = {
  email: 'quidam@example.com',
  handle: 'quidam',
  name: 'Quidam',
  password: 'supersecret'
};
export const guildPlayerInfo: Partial<Member> = {
  email: 'guild_player@example.com',
  handle: 'guild_player',
  name: 'Guild Player',
  password: 'supersecret',
};
export const publicGuildInfo = (role_id) => ({
  name: 'My great guild',
  handle: 'pubguild',
  public: true,
  default_role_id: role_id,
  open_for_applications: true,
  application_needs_approval: false,
} as Partial<Guild>);
export const publicQuestInfo: Partial<Quest> = {
  name: 'My great quest',
  handle: 'pubquest',
  status: 'registration',
  public: true,
  start: new Date(),
  end: new Date(Date.now() + 100000000000),
};
export const draftPublicQuestInfo: Partial<Quest> = {
  name: 'My great quest',
  handle: 'dpubquest',
  status: 'draft',
  public: true,
  start: new Date().toISOString(),
  end: new Date(Date.now() + 100000000000).toISOString(),
};
export const privateQuestInfo: Partial<Quest> = {
  name: 'My private quest',
  handle: 'privquest1',
  public: false,
  status: 'draft',
  start: new Date().toISOString(),
  end: new Date(Date.now() + 100000000000).toISOString(),
};
export const publicQuest2Info: Partial<Quest> = {
  name: 'My lesser quest',
  handle: 'pubquest2',
  status: 'registration',
  public: true,
  start: new Date().toISOString(),
  end: new Date(Date.now() + 100000000000).toISOString(),
};
export const question1Info: Partial<PseudoNode> = {
  id: 'q1',
  node_type: 'question',
  status: 'published',
  title: 'first question',
  creator_id: sponsorInfo.handle,
};
export const answer1Info: Partial<PseudoNode> = {
  id: 'a1',
  node_type: 'answer',
  parent_id: question1Info.id,
  title: 'first answer',
  creator_id: quidamInfo.handle,
};
export const argument1Info: Partial<PseudoNode> = {
  id: 'arg1',
  creator_id: quidamInfo.handle,
  node_type: 'pro',
  parent_id: answer1Info.id,
  title: 'first pro argument'
};
