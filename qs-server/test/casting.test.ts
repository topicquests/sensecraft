import assert from 'assert';
import { axiosUtil, get_base_roles, get_system_role_by_name } from './utils';
import { adminInfo, quidamInfo, leaderInfo, publicGuildInfo, sponsorInfo, publicQuestInfo } from './fixtures';

describe('\'casting\' service', () => {

  describe('guild creation', () => {
    let adminToken, quidamId, leaderId, sponsorId, publicGuildId, publicQuestId, sponsorToken, leaderToken, quidamToken, roles, researcherRoleId;

    before(async () => {
      adminToken = await axiosUtil.call('get_token', {
        mail: adminInfo.email, pass: adminInfo.password
      });
      leaderId = await axiosUtil.call('create_member', leaderInfo);
      sponsorId = await axiosUtil.call('create_member', sponsorInfo);
      quidamId = await axiosUtil.call('create_member', quidamInfo);
      quidamToken = await axiosUtil.call('get_token', {
        mail: quidamInfo.email, pass: quidamInfo.password
      }, null, false);
      leaderToken = await axiosUtil.call('get_token', {
        mail: leaderInfo.email, pass: leaderInfo.password
      }, null, false);
      sponsorToken = await axiosUtil.call('get_token', {
        mail: sponsorInfo.email, pass: sponsorInfo.password
      }, null, false);
      roles = await get_base_roles(adminToken);
      researcherRoleId = get_system_role_by_name(roles, 'Researcher').id;
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
        const publicGuildModel = await axiosUtil.create('guilds', publicGuildInfo(researcherRoleId), leaderToken);
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
        const quidam_casting = { member_id: quidamId, ...game_play_id };
        let r = await axiosUtil.delete('casting', quidam_casting, quidamToken);
        assert.ok(r);
        r = await axiosUtil.get('casting', quidam_casting, quidamToken);
        assert.deepEqual(r, []);
      });
      it('quidam can self-register', async () => {
        const r = await axiosUtil.create('casting', {
          member_id: quidamId,
          ...game_play_id
        }, quidamToken);
        assert.ok(r);
      });
      it('quidam has the guild default role', async () => {
        const r = await axiosUtil.get('guild_member_available_role', {
          member_id: quidamId,
          guild_id: publicGuildId
        }, quidamToken);
        assert.equal(r.length, 1);
        assert.equal(r[0].role_id, researcherRoleId);
      });
    });
  });
});
