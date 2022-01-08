const assert = require('assert');
const { axiosUtil, get_base_roles, get_system_role_by_name } = require('./utils');
const { adminInfo, quidamInfo, leaderInfo, publicGuildInfo, sponsorInfo, publicQuestInfo, guildPlayerInfo } = require('./fixtures');

describe('\'role\' service', () => {
  describe('guild creation', () => {
    var adminToken, quidamId, leaderId, playerId, sponsorId,
      publicGuildId, publicQuestId, sponsorToken, leaderToken,
      quidamToken, playerToken, sysRoleId, guildRoleId, roles,
      researcherRoleId;

    before(async () => {
      adminToken = await axiosUtil.call('get_token', {
        mail: adminInfo.email, pass: adminInfo.password
      }, null, true);
      leaderId = await axiosUtil.call('create_member', leaderInfo);
      playerId = await axiosUtil.call('create_member', guildPlayerInfo);
      sponsorId = await axiosUtil.call('create_member', sponsorInfo);
      quidamId = await axiosUtil.call('create_member', quidamInfo);
      quidamToken = await axiosUtil.call('get_token', {
        mail: quidamInfo.email, pass: quidamInfo.password
      }, null, false);
      leaderToken = await axiosUtil.call('get_token', {
        mail: leaderInfo.email, pass: leaderInfo.password
      }, null, false);
      playerToken = await axiosUtil.call('get_token', {
        mail: guildPlayerInfo.email, pass: guildPlayerInfo.password
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
      if (playerId)
        await axiosUtil.delete('members', {id: playerId}, adminToken);
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
      it('quidam can register to guild', async () => {
        const register = await axiosUtil.create('guild_membership', {
          member_id: quidamId,
          guild_id: publicGuildId,
        }, quidamToken);
        assert.ok(register);
      });
      it('player can register to guild', async () => {
        const register = await axiosUtil.create('guild_membership', {
          member_id: playerId,
          guild_id: publicGuildId,
        }, playerToken);
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
        assert.equal(registers.length, 3);
        const quidam_r = registers.find(r => r.member_id == quidamId);
        console.log(registers);
        assert.ok(quidam_r);
      });
      //Role tests
      //GuildAdm create new role
      it('guild admin create new role', async () => {
        var newRole = {
          guild_id: publicGuildId,
          name: 'test_role'
        };
        const guildRole = await axiosUtil.create('role', newRole, leaderToken);
        guildRoleId = guildRole.id;
      });
      //Superadmin create new role
      it('superadmin create new role', async () => {
        const sysRole = await axiosUtil.create('role', {
          name: 'super_role'}, adminToken);
        sysRoleId = sysRole.id;
      });
      //player cannot create new role
      it('player cannot create new role', async () => {
        await assert.rejects( async() => {
          await axiosUtil.create('role', {
            name: 'player_role',}, playerToken);
        }, 'GeneralError');
      });
      //guildadmin cannot create new role without guildId
      it('guildadmin cannot create new role without guildId', async () => {
        await assert.rejects(async() => {
          await axiosUtil.create('role', {
            name: 'guild_role',}, leaderToken);
        }, 'GeneralError');
      });
      //Player attempts to select casting role before guild admin creates
      it('Cannot select casting role before guildadmin allows', async() => {
        await assert.rejects( async() => {
          await axiosUtil.create('casting_role', {
            member_id: playerId,
            quest_id: publicQuestId,
            guild_id: publicGuildId,
            role_id: sysRoleId}, playerToken);
        }, 'GeneralError');
      });
      //GuildAdmin select sys roles for player
      it('guildadmin select sys roles for player', async () => {
        const sysRole = await axiosUtil.create('guild_member_available_role', {
          member_id: playerId,
          role_id: sysRoleId,
          guild_id: publicGuildId},
        leaderToken);
        assert.ok(sysRole);
      });
      //GuildAdmin select roles for player
      it('guildadmin select guild roles for player', async () => {
        const guildRole = await axiosUtil.create('guild_member_available_role', {
          member_id: playerId,
          guild_id: publicGuildId,
          role_id: guildRoleId},
        leaderToken);
        assert.ok(guildRole);
      });
      //Player selects casting role after guild admin creates
      it('Player select casting role', async() => {
        await axiosUtil.create('casting_role', {
          member_id: playerId,
          quest_id: publicQuestId,
          guild_id: publicGuildId,
          role_id: sysRoleId}, playerToken);
      });
      //Player selects second casting role after guild admin creates
      it('Player select casting role', async() => {
        await axiosUtil.create('casting_role', {
          member_id: playerId,
          quest_id: publicQuestId,
          guild_id: publicGuildId,
          role_id: guildRoleId}, playerToken);
      });
      it('Leader cannot delete an available role in use', async () => {
        await assert.rejects(async () => {
          await axiosUtil.delete('guild_member_available_role', {
            member_id: playerId,
            guild_id: publicGuildId,
            role_id: guildRoleId
          }, leaderToken);
        }, /casting_role_available_role_fkey/);
      });
      it('Leader cannot delete a role in use', async () => {
        await assert.rejects(async () => {
          await axiosUtil.delete('role', {
            id: guildRoleId
          }, leaderToken);
        }, /casting_role_role_id_fkey/);
      });
    });
  });
});