import assert from 'assert';
import { axiosUtil, get_base_roles, get_system_role_by_name } from './utils';
import { adminInfo, quidamInfo, leaderInfo, publicGuildInfo, sponsorInfo, draftPublicQuestInfo } from './fixtures';
import type { GamePlay } from '../../qs-client/src/types';

describe('\'game_play\' service', function() {

  describe('guild creation', function() {
    let adminToken, quidamId, leaderId, sponsorId, publicGuildId, publicQuestId, sponsorToken, leaderToken, quidamToken, roles, researcherRoleId;

    before(async function() {
      adminToken = await axiosUtil.call('get_token', {
        mail: adminInfo.email, pass: adminInfo.password
      }, null, true);
      leaderId = await axiosUtil.call('create_member', leaderInfo);
      sponsorId = await axiosUtil.call('create_member', sponsorInfo);
      quidamId = await axiosUtil.call('create_member', quidamInfo);
      quidamToken = await axiosUtil.call('get_token', {
        mail: quidamInfo.email, pass: quidamInfo.password
      }, null, true);
      leaderToken = await axiosUtil.call('get_token', {
        mail: leaderInfo.email, pass: leaderInfo.password
      }, null, true);
      sponsorToken = await axiosUtil.call('get_token', {
        mail: sponsorInfo.email, pass: sponsorInfo.password
      }, null, true);
      roles = await get_base_roles(adminToken);
      researcherRoleId = get_system_role_by_name(roles, 'Researcher').id;
    });

    after(async function() {
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

    describe('guild creation by authorized user', function() {
      const game_play_id: Partial<GamePlay> = {};
      it('creates public quest', async function() {
        const publicQuestModel = await axiosUtil.create('quests', draftPublicQuestInfo, sponsorToken);
        publicQuestId = publicQuestModel.id;
        game_play_id.quest_id = publicQuestId;
        const quests = await axiosUtil.get('quests', {}, leaderToken);
        assert.equal(quests.length, 1);
      });
      it('creates public guild', async function() {
        const publicGuildModel = await axiosUtil.create('guilds', publicGuildInfo(researcherRoleId), leaderToken);
        publicGuildId = publicGuildModel.id;
        game_play_id.guild_id = publicGuildId;
        const guilds = await axiosUtil.get('guilds', {}, leaderToken);
        assert.equal(guilds.length, 1);
      });
      it('quidam cannot register to quest', async function() {
        assert.rejects(async () => {
          await axiosUtil.create('game_play', game_play_id, quidamToken);
        }, 'GeneralError');
      });
      it('guild leader cannot register to draft quest', async function() {
        assert.rejects(async () => {
          await axiosUtil.create('game_play', game_play_id, leaderToken);
        }, 'GeneralError');
      });
      it('sponsor can update quest', async function() {
        const update = await axiosUtil.update('quests', {
          id: publicQuestId
        }, {
          status: 'registration'
        }, sponsorToken);
        assert.equal(update.length, 1);
        assert.equal(update[0].status, 'registration');
      });
      it('guild leader can register to quest in registration mode', async function() {
        const register = await axiosUtil.create('game_play', game_play_id, leaderToken);
        assert.ok(register);
        const game_play = await axiosUtil.get('game_play', game_play_id, leaderToken);
        assert.equal(game_play.length, 1);
        assert.equal(game_play[0].status, 'confirmed');
      });
      it('guild leader can deregister from quest', async function() {
        await axiosUtil.delete('game_play', game_play_id, leaderToken);
      });
      it('sponsor can invite guild', async function() {
        const register = await axiosUtil.create('game_play', game_play_id, sponsorToken);
        assert.ok(register);
        const game_play = await axiosUtil.get('game_play', game_play_id, sponsorToken);
        assert.equal(game_play.length, 1);
        assert.equal(game_play[0].status, 'invitation');
      });
      it('leader can accept invitation', async function() {
        const update = await axiosUtil.update('game_play', game_play_id, {
          status: 'confirmed'
        }, leaderToken);
        assert.equal(update.length, 1);
        assert.equal(update[0].status, 'confirmed');
      });
    });
  });
});
