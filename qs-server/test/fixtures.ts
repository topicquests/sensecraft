import { adminInfo as aig } from './global';

export const adminInfo = aig;

export const sponsorInfo = {
  email: 'sponsor@example.com',
  handle: 'sponsor',
  name: 'Quest Sponsor',
  password: 'supersecret',
  permissions: ['createQuest']
};
export const leaderInfo = {
  email: 'guild_leader@example.com',
  handle: 'guild_leader',
  name: 'Guild Leader',
  password: 'supersecret',
  permissions: ['createGuild']
};
export const quidamInfo = {
  email: 'quidam@example.com',
  handle: 'quidam',
  name: 'Quidam',
  password: 'supersecret'
};
export const guildPlayerInfo = {
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
});
export const publicQuestInfo = {
  name: 'My great quest',
  handle: 'pubquest',
  status: 'registration',
  public: true,
  start: new Date(),
  end: new Date(Date.now() + 100000000000),
};
export const draftPublicQuestInfo = {
  name: 'My great quest',
  handle: 'dpubquest',
  status: 'draft',
  public: true,
  start: new Date(),
  end: new Date(Date.now() + 100000000000),
};
export const privateQuestInfo = {
  name: 'My private quest',
  handle: 'privquest1',
  public: false,
  status: 'draft',
  start: new Date(),
  end: new Date(Date.now() + 100000000000),
};
export const publicQuest2Info = {
  name: 'My lesser quest',
  handle: 'pubquest2',
  status: 'registration',
  public: true,
  start: new Date(),
  end: new Date(Date.now() + 100000000000),
};
export const question1Info = {
  id: 'q1',
  node_type: 'question',
  status: 'published',
  title: 'first question',
  member: sponsorInfo.handle,
};
export const answer1Info = {
  id: 'a1',
  node_type: 'answer',
  parent: question1Info.id,
  title: 'first answer',
  member: quidamInfo.handle,
};
export const argument1Info = {
  id: 'arg1',
  member: quidamInfo.handle,
  node_type: 'pro',
  parent: answer1Info.id,
  title: 'first pro argument'
};