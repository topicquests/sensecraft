import assert from 'assert';
import { axiosUtil, get_base_roles, get_system_role_by_name, multiId, add_members, delete_members } from './utils';
import { adminInfo, quidamInfo, leaderInfo, publicGuildInfo, sponsorInfo, draftPublicQuestInfo } from './fixtures';

describe('\'game_play\' service', function() {

  describe('guild creation', function() {
    let adminToken, publicGuildId, publicQuestId, sponsorToken, leaderToken, quidamToken, roles, researcherRoleId, memberIds, memberTokens;

    before(async function() {
      adminToken = await axiosUtil.call('get_token', {
        mail: adminInfo.email, pass: adminInfo.password
      }, undefined, true);
      ({ memberIds, memberTokens } = await add_members([leaderInfo, sponsorInfo, quidamInfo], adminToken));
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      quidamToken = memberTokens[quidamInfo.handle!];
      leaderToken = memberTokens[leaderInfo.handle!];
      sponsorToken = memberTokens[sponsorInfo.handle!];
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
      roles = await get_base_roles(adminToken);
      researcherRoleId = get_system_role_by_name(roles, 'Researcher')?.id;
    });

    after(async function() {
      if (process.env.NOREVERT)
        return;
      if (publicGuildId)
        await axiosUtil.delete('guilds', {id: publicGuildId}, adminToken);
      if (publicQuestId)
        await axiosUtil.delete('quests', { id: publicQuestId }, adminToken);
      await delete_members(memberIds, adminToken);
    });

    describe('guild creation by authorized user', function() {
      let game_play_id: multiId;
      it('creates public quest', async function() {
        const publicQuestModel = await axiosUtil.create('quests', draftPublicQuestInfo, sponsorToken);
        publicQuestId = publicQuestModel.id;
        const quests = await axiosUtil.get('quests', {}, sponsorToken);
        assert.equal(quests.length, 1);
      });
      it('creates public guild', async function() {
        const publicGuildModel = await axiosUtil.create('guilds', publicGuildInfo(researcherRoleId), leaderToken);
        publicGuildId = publicGuildModel.id;
        const guilds = await axiosUtil.get('guilds', {}, leaderToken);
        assert.equal(guilds.length, 1);
        game_play_id = {
          guild_id: publicGuildId,
          quest_id: publicQuestId
        };
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
