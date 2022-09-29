import assert from 'assert';
import { axiosUtil, get_base_roles, get_system_role_by_name, multiId, add_members, delete_members } from './utils';
import { adminInfo, quidamInfo, leaderInfo, publicGuildInfo, sponsorInfo, publicQuestInfo } from './fixtures';
import type { GuildMembership, Casting } from '../../qs-client/src/types';

describe('\'casting\' service', function() {

  describe('guild creation', function() {
    let adminToken, quidamId, leaderId, publicGuildId, publicQuestId, memberIds, memberTokens, sponsorToken, leaderToken, quidamToken, roles, researcherRoleId;

    before(async function() {
      adminToken = await axiosUtil.call('get_token', {
        mail: adminInfo.email, pass: adminInfo.password
      });
      ({memberIds, memberTokens} = await add_members([leaderInfo, sponsorInfo, quidamInfo], adminToken));
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      quidamToken = memberTokens[quidamInfo.handle!];
      leaderToken = memberTokens[leaderInfo.handle!];
      sponsorToken = memberTokens[sponsorInfo.handle!];
      leaderId = memberIds[leaderInfo.handle!];
      quidamId = memberIds[quidamInfo.handle!];
      /* eslint-ensable @typescript-eslint/no-non-null-assertion */
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

    describe('guild creation by authorized user', function () {
      let game_play_id: multiId;
      it('creates public quest', async function() {
        const publicQuestModel = await axiosUtil.create('quests', publicQuestInfo, sponsorToken);
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
      it('guild leader can register guild to quest', async function() {
        const register = await axiosUtil.create('game_play', game_play_id, leaderToken);
        assert.ok(register);
        const game_play = await axiosUtil.get('game_play', game_play_id, leaderToken);
        assert.equal(game_play.length, 1);
        assert.equal(game_play[0].status, 'confirmed');
      });
      it('guild leader can then self-register to quest', async function() {
        const register = await axiosUtil.create('casting', {
          member_id: leaderId,
          ...game_play_id
        } as Partial<Casting>, leaderToken);
        assert.ok(register);
      });
      it('quidam cannot register to quest from outside guild', async function() {
        await assert.rejects(async () => {
          await axiosUtil.create('casting', {
            member_id: quidamId,
            ...game_play_id
          } as Partial<Casting>, quidamToken);
        }, 'GeneralError');
      });
      it('quidam can register to guild', async function() {
        const register = await axiosUtil.create('guild_membership', {
          member_id: quidamId,
          guild_id: publicGuildId,
        } as Partial<GuildMembership>, quidamToken);
        console.log(register);
        assert.ok(register);
      });
      it('guild leader can call global registration', async function() {
        await axiosUtil.call('register_all_members', {
          guildid: publicGuildId,
          questid: publicQuestId,
        }, leaderToken);
      });
      // TODO: Should we prevent others from calling this function?
      it('global registration registered quidam', async function() {
        const registers = await axiosUtil.get('casting', game_play_id, leaderToken);
        assert.equal(registers.length, 2);
        const quidam_r = registers.find(r => r.member_id == quidamId);
        assert.ok(quidam_r);
      });
      it('quidam can deregister', async function() {
        const quidam_casting = { member_id: quidamId, ...game_play_id };
        let r = await axiosUtil.delete('casting', quidam_casting, quidamToken);
        assert.ok(r);
        r = await axiosUtil.get('casting', quidam_casting, quidamToken);
        assert.deepEqual(r, []);
      });
      it('quidam can self-register', async function() {
        const r = await axiosUtil.create('casting', {
          member_id: quidamId,
          ...game_play_id
        } as Partial<Casting>, quidamToken);
        assert.ok(r);
      });
      it('quidam has the guild default role', async function() {
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
