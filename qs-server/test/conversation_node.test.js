const assert = require('assert');
const { axiosUtil, add_members, delete_members, add_nodes, delete_nodes } = require('./utils');
const { adminInfo, quidamInfo, leaderInfo, publicGuildInfo, sponsorInfo, publicQuestInfo, publicQuest2Info, question1Info, answer1Info, argument1Info } = require('./fixtures');


describe('\'conversation_node\' service', () => {

  describe('guild creation', () => {
    var adminToken, publicGuildId, publicQuestId, publicQuest2Id, sponsorToken, leaderToken, quidamToken,
      q1Id, a1Id, arg1Id, memberIds, memberTokens, nodeIds = {};
    async function my_add_node(node) {
      return await add_nodes([node], publicQuestId, memberTokens, nodeIds);
    }
    before(async () => {
      adminToken = await axiosUtil.call('get_token', {
        mail: adminInfo.email, pass: adminInfo.password
      });
      ({memberIds, memberTokens} = await add_members([leaderInfo, sponsorInfo, quidamInfo]));
      if (Object.keys(memberIds).length != 3)
        throw Error();
      quidamToken = memberTokens[quidamInfo.handle];
      leaderToken = memberTokens[leaderInfo.handle];
      sponsorToken = memberTokens[sponsorInfo.handle];
    });

    after(async () => {
      if (process.env.NOREVERT)
        return;
      await delete_nodes(['arg1', 'a1', 'q1'], nodeIds, adminToken);
      if (publicGuildId)
        await axiosUtil.delete('guilds', {id: publicGuildId}, adminToken);
      if (publicQuestId)
        await axiosUtil.delete('quests', {id: publicQuestId}, adminToken);
      if (publicQuest2Id)
        await axiosUtil.delete('quests', {id: publicQuest2Id}, adminToken);
      delete_members(memberIds, adminToken);
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
        Object.assign(nodeIds, await my_add_node(question1Info));
        q1Id = nodeIds[question1Info.id];
      });
      it('sponsor cannot create a second root', async () => {
        await assert.rejects(async () => {
          await my_add_node({
            id: 'q2',
            node_type: 'question',
            status: 'published',
            title: 'second question',
            member: sponsorInfo.handle,
          });
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
          member_id: memberIds[quidamInfo.handle],
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
        Object.assign(nodeIds, await my_add_node(answer1Info));
        a1Id = nodeIds[answer1Info.id];
      });
      it('leader cannot submit node before quest is ongoing', async () => {
        await assert.rejects(async () => {
          await my_add_node({
            id: 'a2',
            node_type: 'answer',
            parent: 'q1',
            status: 'submitted',
            title: 'first question'
          });
        });
      });
      it('sponsor can start quest', async () => {
        await axiosUtil.update('quests', { id: publicQuestId }, { status: 'ongoing' }, sponsorToken);
      });
      it('quidam cannot pile an argument on a question', async () => {
        await assert.rejects(async () => {
          await my_add_node({
            id: 'arg0',
            member: quidamInfo.handle,
            node_type: 'pro',
            parent: 'q1',
            title: 'pro argument'
          });
        });
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
        Object.assign(nodeIds, await my_add_node(argument1Info));
        arg1Id = nodeIds['arg1'];
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
      it('quidam can update draft node to proposed', async () => {
        const arg1Models = await axiosUtil.update('conversation_node', { id: a1Id }, {
          description: 'details about the answer',
          status: 'proposed',
        }, quidamToken);
        assert.equal(arg1Models[0].status, 'proposed');
      });
      it('leader can submit node', async () => {
        const arg1Models = await axiosUtil.update('conversation_node', { id: a1Id }, {
          status: 'submitted'
        }, leaderToken);
        assert.equal(arg1Models.length, 1);
        // guild is implicitly in immediate mode
        assert.equal(arg1Models[0].status, 'published');
        assert.ok(arg1Models[0].published_at);
      });
      // TODO: test I cannot create a node with a parent from a different quest
      // Test I can add a meta-node to the focus node
      // Test I can add a meta-node to a descendant of the focus node
      // Test I can add a meta-node to an existing meta-node
      // Test I cannot add a meta-node outside of the focus node descendants
      // Question: can I add a meta-node to a meta-node outside of the focus descendants?
      // Test I can add a channel in the game_play
      // Test I can add a channel outside the quest
      // Test I cannot add a non-root channel
      // Test I can add a meta-node to either channel
      // Test I cannot add a quest-less non-meta node
      // Test I cannot add a node in channel state outside of a channel
      // Test I cannot add a non-channel node in a channel
    });
  });
});
