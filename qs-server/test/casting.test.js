const assert = require('assert');
const { axiosUtil } = require('./utils');

describe('\'guilds\' service', () => {

  describe('guild creation', () => {
    const quidamInfo = {
      email: 'quidam@example.com',
      handle: 'quidam',
      name: 'Quidam',
      password: 'supersecret'
    };
    const leaderInfo = {
      email: 'guild_leader@example.com',
      handle: 'guild_leader',
      name: 'Guild Leader',
      password: 'supersecret',
      permissions: ['createGuild']
    };
    const publicGuildInfo = {
      name: 'My great guild',
      handle: 'pubguild',
      public: true,
      open_for_applications: true,
      application_needs_approval: false,
    };
    const sponsorInfo = {
      email: 'sponsor@example.com',
      handle: 'sponsor',
      name: 'Quest Sponsor',
      password: 'supersecret',
      permissions: ['createQuest']
    };
    const publicQuestInfo = {
      name: 'My great quest',
      handle: 'pubquest',
      status: 'registration',
      public: true,
      start: new Date(),
      end: new Date(Date.now() + 100000000000),
    };

    var adminToken, quidamId, leaderId, sponsorId, publicGuildId, publicQuestId, sponsorToken, leaderToken, quidamToken;

    before(async () => {
      adminToken = await axiosUtil.call('get_token', {
        mail: 'admin@example.com', pass: 'admin'
      });
      leaderId = await axiosUtil.call('create_member', leaderInfo);
      sponsorId = await axiosUtil.call('create_member', sponsorInfo);
      quidamId = await axiosUtil.call('create_member', quidamInfo);
      quidamToken = await axiosUtil.call('get_token', {
        mail: 'quidam@example.com', pass: 'supersecret'
      }, null, false);
      leaderToken = await axiosUtil.call('get_token', {
        mail: 'guild_leader@example.com', pass: 'supersecret'
      }, null, false);
      sponsorToken = await axiosUtil.call('get_token', {
        mail: 'sponsor@example.com', pass: 'supersecret'
      }, null, false);
    });

    after(async () => {
      if (process.env.NOREVERT)
        return;
      if (publicGuildId)
        await axiosUtil.delete('guilds', {id: publicGuildId}, adminToken);
      if (publicQuestId)
        await axiosUtil.delete('quests', {id: publicQuestId}, adminToken);
      if (quidamId)
        await axiosUtil.delete('members', {id: quidamId}, adminToken);
      if (leaderId)
        await axiosUtil.delete('members', {id: leaderId}, adminToken);
      if (sponsorId)
        await axiosUtil.delete('members', {id: sponsorId}, adminToken);
    });

    describe('guild creation by authorized user', () => {
      const game_play_id = {};
      it('creates public quest', async () => {
        const publicQuestModel = await axiosUtil.create('quests', publicQuestInfo, sponsorToken);
        publicQuestId = publicQuestModel.id;
        game_play_id.quest_id = publicQuestId;
        const quests = await axiosUtil.get('quests', {}, leaderToken);
        assert.equal(quests.length, 1);
      });
      it('creates public guild', async () => {
        const publicGuildModel = await axiosUtil.create('guilds', publicGuildInfo, leaderToken);
        publicGuildId = publicGuildModel.id;
        game_play_id.guild_id = publicGuildId;
        const guilds = await axiosUtil.get('guilds', {}, leaderToken);
        assert.equal(guilds.length, 1);
      });
      it('guild leader can register guild to quest', async () => {
        const register = await axiosUtil.create('game_play', game_play_id, leaderToken);
        assert.ok(register);
        const game_play = await axiosUtil.get('game_play', game_play_id, leaderToken);
        assert.equal(game_play.length, 1);
        assert.equal(game_play[0].status, 'confirmed');
      });
      it('guild leader can then self-register to quest', async () => {
        const register = await axiosUtil.create('casting', {
          member_id: leaderId,
          ...game_play_id
        }, leaderToken);
        assert.ok(register);
      });
      it('quidam cannot register to quest from outside guild', async () => {
        await assert.rejects(async () => {
          await axiosUtil.create('casting', {
            member_id: quidamId,
            ...game_play_id
          }, quidamToken);
        }, 'GeneralError');
      });
      it('quidam can register to guild', async () => {
        const register = await axiosUtil.create('guild_membership', {
          member_id: quidamId,
          guild_id: publicGuildId,
        }, quidamToken);
        console.log(register);
        assert.ok(register);
      });
      it('guild leader can call global registration', async () => {
        await axiosUtil.call('register_all_members', {
          guildid: publicGuildId,
          questid: publicQuestId,
        }, leaderToken);
      });
      // TODO: Should we prevent others from calling this function?
      it('global registration registered quidam', async () => {
        const registers = await axiosUtil.get('casting', game_play_id, leaderToken);
        assert.equal(registers.length, 2);
        const quidam_r = registers.find(r => r.member_id == quidamId);
        assert.ok(quidam_r);
      });
      it('quidam can deregister', async () => {
        await axiosUtil.delete('casting', {
          member_id: quidamId,
          ...game_play_id
        }, quidamToken);
      });
    });
  });
});
