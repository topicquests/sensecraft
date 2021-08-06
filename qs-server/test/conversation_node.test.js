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
    const publicQuest2Info = {
      name: 'My lesser quest',
      handle: 'pubquest2',
      status: 'registration',
      public: true,
      start: new Date(),
      end: new Date(Date.now() + 100000000000),
    };

    var adminToken, quidamId, leaderId, sponsorId, publicGuildId, publicQuestId, publicQuest2Id, sponsorToken, leaderToken, quidamToken,
      q1Id, a1Id, arg1Id;

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
      if (publicQuest2Id)
        await axiosUtil.delete('quests', {id: publicQuest2Id}, adminToken);
      if (quidamId)
        await axiosUtil.delete('members', {id: quidamId}, adminToken);
      if (leaderId)
        await axiosUtil.delete('members', {id: leaderId}, adminToken);
      if (sponsorId)
        await axiosUtil.delete('members', {id: sponsorId}, adminToken);
    });

    describe('conversation_node tests', () => {
      const game_play_id = {};
      it('creates two public quests', async () => {
        var publicQuestModel = await axiosUtil.create('quests', publicQuestInfo, sponsorToken);
        publicQuestId = publicQuestModel.id;
        game_play_id.quest_id = publicQuestId;
        var quests = await axiosUtil.get('quests', {}, leaderToken);
        assert.equal(quests.length, 1);
        publicQuestModel = await axiosUtil.create('quests', publicQuest2Info, sponsorToken);
        publicQuest2Id = publicQuestModel.id;
        game_play_id.quest_id = publicQuestId;
        quests = await axiosUtil.get('quests', {}, leaderToken);
        assert.equal(quests.length, 2);
      });
      it('sponsor can ask first question', async () => {
        const q1Model = await axiosUtil.create('conversation_node', {
          quest_id: publicQuestId,
          node_type: 'question',
          title: 'first question',
          status: 'published'
        }, sponsorToken);
        q1Id = q1Model.id;
      });
      it('sponsor cannot create a second root', async () => {
        await assert.rejects(async () => {
          await axiosUtil.create('conversation_node', {
            quest_id: publicQuestId,
            node_type: 'question',
            status: 'published',
            title: 'second question'
          }, sponsorToken);
        }, 'GeneralError');
      });
      it('creates public guild', async () => {
        const publicGuildModel = await axiosUtil.create('guilds', publicGuildInfo, leaderToken);
        publicGuildId = publicGuildModel.id;
        game_play_id.guild_id = publicGuildId;
        const guilds = await axiosUtil.get('guilds', {}, leaderToken);
        assert.equal(guilds.length, 1);
      });
      it('quidam can register to guild', async () => {
        const register = await axiosUtil.create('guild_membership', {
          member_id: quidamId,
          guild_id: publicGuildId,
        }, quidamToken);
        assert.ok(register);
      });
      it('guild leader can register guild to quest', async () => {
        const register = await axiosUtil.create('game_play', game_play_id, leaderToken);
        assert.ok(register);
        const game_play = await axiosUtil.get('game_play', game_play_id, leaderToken);
        assert.equal(game_play.length, 1);
        assert.equal(game_play[0].status, 'confirmed');
      });
      it('guild leader can call global registration', async () => {
        await axiosUtil.call('register_all_members', {
          guildid: publicGuildId,
          questid: publicQuestId,
        }, leaderToken);
      });
      it('quidam can create private draft node', async () => {
        const a1Model = await axiosUtil.create('conversation_node', {
          quest_id: publicQuestId,
          node_type: 'answer',
          parent_id: q1Id,
          title: 'first answer'
        }, quidamToken);
        a1Id = a1Model.id;
      });
      it('leader cannot submit node before quest is ongoing', async () => {
        await assert.rejects(async () => {
          await axiosUtil.create('conversation_node', {
            quest_id: publicQuestId,
            node_type: 'answer',
            parent_id: q1Id,
            status: 'submitted',
            title: 'first question'
          }, leaderToken);
        }, 'GeneralError');
      });
      it('sponsor can start quest', async () => {
        await axiosUtil.update('quests', { id: publicQuestId }, { status: 'ongoing' }, sponsorToken);
      });
      it('quidam cannot pile an argument on a question', async () => {
        await assert.rejects(async () => {
          await axiosUtil.create('conversation_node', {
            quest_id: publicQuestId,
            node_type: 'pro',
            parent_id: q1Id,
            title: 'pro argument'
          }, quidamToken);
        }, 'GeneralError');
      });
      it('leader and sponsor cannot see private draft', async () => {
        var node_model = await axiosUtil.get('conversation_node', { id: a1Id }, leaderToken);
        assert.equal(node_model.length, 0);
        node_model = await axiosUtil.get('conversation_node', { id: a1Id }, sponsorToken);
        assert.equal(node_model.length, 0);
      });
      it('quidam can update draft node', async () => {
        await axiosUtil.update('conversation_node', { id: a1Id }, {
          description: 'details about the answer',
          status: 'guild_draft',
        }, quidamToken);
      });
      // Q: should we forbid modification of a proposed node? A: Not for now.
      it('sponsor cannot see guild draft', async () => {
        const node_model = await axiosUtil.get('conversation_node', { id: a1Id }, sponsorToken);
        assert.equal(node_model.length, 0);
      });
      it('leader can see guild draft', async () => {
        const node_model = await axiosUtil.get('conversation_node', { id: a1Id }, leaderToken);
        assert.equal(node_model.length, 1);
      });
      it('guild member can update someone elses guild draft node', async () => {
        await axiosUtil.update('conversation_node', { id: a1Id }, {
          description: 'more details about the answer',
        }, leaderToken);
      });
      it('quidam can pile on draft nodes', async () => {
        const arg1Model = await axiosUtil.create('conversation_node', {
          quest_id: publicQuestId,
          node_type: 'pro',
          parent_id: a1Id,
          title: 'first pro argument'
        }, quidamToken);
        arg1Id = arg1Model.id;
      });
      it('find subtree', async () => {
        const descModels = await axiosUtil.call('node_subtree', { node_id: a1Id }, quidamToken);
        assert.equal(descModels.length, 2);
        assert.deepEqual(descModels.map(x => String(x.id)), [a1Id, arg1Id]);
      });
      it('see neighbourhood', async () => {
        var descModels = await axiosUtil.call('node_neighbourhood', {
          node_id: q1Id, guild: publicGuildId
        }, quidamToken);
        assert.equal(descModels.length, 3);
        descModels = await axiosUtil.call('node_neighbourhood', {
          node_id: q1Id, guild: null
        }, sponsorToken);
        assert.equal(descModels.length, 1);
      });
      it('find subtree does not trump security', async () => {
        const descModels = await axiosUtil.call('node_subtree', { node_id: a1Id }, leaderToken);
        assert.equal(descModels.length, 1);
        assert.deepEqual(descModels.map(x => String(x.id)), [a1Id]);
      });
      it('quidam cannot unroot node', async () => {
        await assert.rejects(async () => {
          await axiosUtil.update('conversation_node', { id: a1Id }, {
            parent_id: null,
          }, quidamToken);
        }, 'GeneralError');
      });
      it('quidam cannot propose child if parent is not proposed', async () => {
        const arg1Models = await axiosUtil.update('conversation_node', { id: arg1Id }, {
          status: 'proposed'
        }, quidamToken);
        assert.equal(arg1Models.length, 1);
        assert.equal(arg1Models[0].status, 'guild_draft');
      });
      it('quidam cannot submit node', async () => {
        await assert.rejects(async () => {
          await axiosUtil.update('conversation_node', { id: a1Id }, {
            status: 'submitted'
          }, quidamToken);
        }, 'GeneralError');
      });
      it('leader can submit node', async () => {
        const arg1Models = await axiosUtil.update('conversation_node', { id: a1Id }, {
          status: 'submitted'
        }, leaderToken);
        assert.equal(arg1Models.length, 1);
        // guild is implicitly in immediate mode
        assert.equal(arg1Models[0].status, 'published');
      });
      // TODO: test I cannot create a node with a parent from a different quest
    });
  });
});
