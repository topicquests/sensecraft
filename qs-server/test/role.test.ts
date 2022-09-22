import assert from 'assert';
import { axiosUtil, get_base_roles, get_system_role_by_name, multiId } from './utils';
import { adminInfo, quidamInfo, leaderInfo, publicGuildInfo, sponsorInfo, publicQuestInfo, guildPlayerInfo } from './fixtures';
import type { CastingRole, Casting, GuildMembership, GuildMemberAvailableRole, Role } from '../../qs-client/src/types';

describe('\'role\' service', function() {
  describe('guild creation', function() {
    let adminToken, quidamId, leaderId, playerId, sponsorId,
      publicGuildId, publicQuestId, sponsorToken, leaderToken,
      quidamToken, playerToken, sysRoleId, guildRoleId, roles,
      researcherRoleId;

    before(async function() {
      adminToken = await axiosUtil.call('get_token', {
        mail: adminInfo.email, pass: adminInfo.password
      }, undefined, true);
      leaderId = await axiosUtil.call('create_member', leaderInfo, adminToken);
      playerId = await axiosUtil.call('create_member', guildPlayerInfo, adminToken);
      sponsorId = await axiosUtil.call('create_member', sponsorInfo, adminToken);
      quidamId = await axiosUtil.call('create_member', quidamInfo, adminToken);
      quidamToken = await axiosUtil.call('get_token', {
        mail: quidamInfo.email, pass: quidamInfo.password
      }, undefined, false);
      leaderToken = await axiosUtil.call('get_token', {
        mail: leaderInfo.email, pass: leaderInfo.password
      }, undefined, false);
      playerToken = await axiosUtil.call('get_token', {
        mail: guildPlayerInfo.email, pass: guildPlayerInfo.password
      }, undefined, false);
      sponsorToken = await axiosUtil.call('get_token', {
        mail: sponsorInfo.email, pass: sponsorInfo.password
      }, undefined, false);
      roles = await get_base_roles(adminToken);
      researcherRoleId = get_system_role_by_name(roles, 'Researcher')?.id;
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
      if (playerId)
        await axiosUtil.delete('members', {id: playerId}, adminToken);
      if (sponsorId)
        await axiosUtil.delete('members', {id: sponsorId}, adminToken);
    });

    describe('guild creation by authorized user', function() {
      let game_play_id: multiId;
      it('creates public quest', async function() {
        const publicQuestModel = await axiosUtil.create('quests', publicQuestInfo, sponsorToken);
        publicQuestId = publicQuestModel.id;
        const quests = await axiosUtil.get('quests', {}, leaderToken);
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
      it('quidam can register to guild', async function() {
        const register = await axiosUtil.create('guild_membership', {
          member_id: quidamId,
          guild_id: publicGuildId,
        } as Partial<GuildMembership>, quidamToken);
        assert.ok(register);
      });
      it('player can register to guild', async function() {
        const register = await axiosUtil.create('guild_membership', {
          member_id: playerId,
          guild_id: publicGuildId,
        } as Partial<GuildMembership>, playerToken);
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
        assert.equal(registers.length, 3);
        const quidam_r = registers.find(r => r.member_id == quidamId);
        console.log(registers);
        assert.ok(quidam_r);
      });
      //Role tests
      //GuildAdm create new role
      it('guild admin create new role', async function() {
        const newRole = {
          guild_id: publicGuildId,
          name: 'test_role'
        };
        const guildRole = await axiosUtil.create('role', newRole, leaderToken);
        guildRoleId = guildRole.id;
      });
      //Superadmin create new role
      it('superadmin create new role', async function() {
        const sysRole = await axiosUtil.create('role', {
          name: 'super_role'} as Partial<Role>, adminToken);
        sysRoleId = sysRole.id;
      });
      //player cannot create new role
      it('player cannot create new role', async function() {
        await assert.rejects( async() => {
          await axiosUtil.create('role', {
            name: 'player_role',} as Partial<Role>, playerToken);
        }, 'GeneralError');
      });
      //guildadmin cannot create new role without guildId
      it('guildadmin cannot create new role without guildId', async function() {
        await assert.rejects(async() => {
          await axiosUtil.create('role', {
            name: 'guild_role',} as Partial<Role>, leaderToken);
        }, 'GeneralError');
      });
      //Player attempts to select casting role before guild admin creates
      it('Cannot select casting role before guildadmin allows', async function() {
        await assert.rejects( async() => {
          await axiosUtil.create('casting_role', {
            member_id: playerId,
            quest_id: publicQuestId,
            guild_id: publicGuildId,
            role_id: sysRoleId} as Partial<CastingRole>, playerToken);
        }, 'GeneralError');
      });
      //GuildAdmin select sys roles for player
      it('guildadmin select sys roles for player', async function() {
        const sysRole = await axiosUtil.create('guild_member_available_role', {
          member_id: playerId,
          role_id: sysRoleId,
          guild_id: publicGuildId} as Partial<GuildMemberAvailableRole>,
        leaderToken);
        assert.ok(sysRole);
      });
      //GuildAdmin select roles for player
      it('guildadmin select guild roles for player', async function() {
        const guildRole = await axiosUtil.create('guild_member_available_role', {
          member_id: playerId,
          guild_id: publicGuildId,
          role_id: guildRoleId} as Partial<GuildMemberAvailableRole>,
        leaderToken);
        assert.ok(guildRole);
      });
      //Player selects casting role after guild admin creates
      it('Player select casting role', async function() {
        await axiosUtil.create('casting_role', {
          member_id: playerId,
          quest_id: publicQuestId,
          guild_id: publicGuildId,
          role_id: sysRoleId} as Partial<CastingRole>, playerToken);
      });
      //Player selects second casting role after guild admin creates
      it('Player select second casting role', async function() {
        await axiosUtil.create('casting_role', {
          member_id: playerId,
          quest_id: publicQuestId,
          guild_id: publicGuildId,
          role_id: guildRoleId} as Partial<CastingRole>, playerToken);
      });
      it('Leader cannot delete an available role in use', async function() {
        await assert.rejects(async () => {
          await axiosUtil.delete('guild_member_available_role', {
            member_id: playerId,
            guild_id: publicGuildId,
            role_id: guildRoleId
          } as Partial<CastingRole>, leaderToken);
        }, /casting_role_available_role_fkey/);
      });
      it('Leader cannot delete a role in use', async function() {
        await assert.rejects(async () => {
          await axiosUtil.delete('role', {
            id: guildRoleId
          }, leaderToken);
        }, /casting_role_role_id_fkey/);
      });
    });
  });
});