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
      status: 'draft',
      public: true,
      start: new Date(),
      end: new Date(Date.now() + 100000000000),
    };

    var adminToken, quidamId, leaderId, sponsorId, publicGuildId, publicQuestId, sponsorToken, leaderToken, quidamToken;

    before(async () => {
      adminToken = await axiosUtil.call('get_token', {
        mail: 'admin@example.com', pass: 'admin'
      });
      const leader = await axiosUtil.create('members', leaderInfo);
      leaderId = leader.id;
      const sponsor = await axiosUtil.create('members', sponsorInfo);
      sponsorId = sponsor.id;
      const quidam = await axiosUtil.create('members', quidamInfo);
      quidamId = quidam.id;
      quidamToken = await axiosUtil.call('get_token', {
        mail: 'quidam@example.com', pass: 'supersecret'
      });
      leaderToken = await axiosUtil.call('get_token', {
        mail: 'guild_leader@example.com', pass: 'supersecret'
      });
      sponsorToken = await axiosUtil.call('get_token', {
        mail: 'sponsor@example.com', pass: 'supersecret'
      });
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
      it('quidam cannot register to quest', async () => {
        assert.rejects(async () => {
          await axiosUtil.create('game_play', game_play_id, quidamToken);
        }, 'GeneralError');
      });
      it('guild leader cannot register to draft quest', async () => {
        assert.rejects(async () => {
          await axiosUtil.create('game_play', game_play_id, leaderToken);
        }, 'GeneralError');
      });
      it('sponsor can update quest', async () => {
        const update = await axiosUtil.update('quests', {
          id: publicQuestId
        }, {
          status: 'registration'
        }, sponsorToken);
        assert.equal(update.length, 1);
        assert.equal(update[0].status, 'registration');
      });
      it('guild leader can register to quest in registration mode', async () => {
        const register = await axiosUtil.create('game_play', game_play_id, leaderToken);
        assert.ok(register);
        const game_play = await axiosUtil.get('game_play', game_play_id, leaderToken);
        assert.equal(game_play.length, 1);
        assert.equal(game_play[0].status, 'confirmed');
      });
      it('guild leader can deregister from quest', async () => {
        await axiosUtil.delete('game_play', game_play_id, leaderToken);
      });
      it('sponsor can invite guild', async () => {
        const register = await axiosUtil.create('game_play', game_play_id, sponsorToken);
        assert.ok(register);
        const game_play = await axiosUtil.get('game_play', game_play_id, sponsorToken);
        assert.equal(game_play.length, 1);
        assert.equal(game_play[0].status, 'invitation');
      });
      it('leader can accept invitation', async () => {
        const update = await axiosUtil.update('game_play', game_play_id, {
          status: 'confirmed'
        }, leaderToken);
        assert.equal(update.length, 1);
        assert.equal(update[0].status, 'confirmed');
      });
    });
  });
});
