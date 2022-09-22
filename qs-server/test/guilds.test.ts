import assert from 'assert';
import { axiosUtil, get_base_roles, get_system_role_by_name, add_members, delete_members } from './utils';
import { adminInfo, quidamInfo, leaderInfo, publicGuildInfo } from './fixtures';
import type { Guild, Member, GuildMembership } from '../../qs-client/src/types';

describe('\'guilds\' service', function() {

  describe('guild creation', function() {

    const quidam2Info: Partial<Member> = {
      email: 'quidam2@example.com',
      handle: 'quidam2',
      name: 'Quidam2',
      password: 'supersecret'
    };
    const quasiPublicGuildInfo: Partial<Guild> = {
      name: 'My other great guild',
      handle: 'pubguild2',
      public: true,
      open_for_applications: true,
      application_needs_approval: true,
    };
    const privateGuildInfo: Partial<Guild> = {
      name: 'My private guild',
      handle: 'privguild1',
      public: false,
      open_for_applications: true,
      application_needs_approval: true,
    };
    let adminToken, quidamId, quidam2Id, quidamToken, sponsorToken, publicGuildId, quasiPublicGuildId, quasiPublicGuildModel, privateGuildId, publicGuildModel, roles, researcherRoleId, memberIds, memberTokens;

    before(async function() {
      adminToken = await axiosUtil.call('get_token', {
        mail: adminInfo.email, pass: adminInfo.password
      }, undefined, true);
      ({memberIds, memberTokens} = await add_members([quidam2Info, leaderInfo, quidamInfo], adminToken));
      quidamToken = memberTokens[quidamInfo.handle];
      sponsorToken = memberTokens[leaderInfo.handle];
      quidam2Id = memberIds[quidam2Info.handle];
      quidamId = memberIds[quidamInfo.handle];
      roles = await get_base_roles(adminToken);
      researcherRoleId = get_system_role_by_name(roles, 'Researcher')?.id;
    });

    after(async function() {
      if (publicGuildId)
        await axiosUtil.delete('guilds', {id: publicGuildId}, adminToken);
      if (quasiPublicGuildId)
        await axiosUtil.delete('guilds', {id: quasiPublicGuildId}, adminToken);
      if (privateGuildId)
        await axiosUtil.delete('guilds', { id: privateGuildId }, adminToken);
      await delete_members(memberIds, adminToken);
    });

    it('fails to create guild without authentication', async function() {
      await assert.rejects(async () => {
        await axiosUtil.create('guilds', privateGuildInfo);
      }, 'GeneralError');
    });

    describe('guild creation by unauthorized user', function() {
      it('fails to create guild without authorization', async function() {
        await assert.rejects(async () => {
          await axiosUtil.create('guilds', privateGuildInfo, quidamToken);
        }, 'GeneralError');
        // TODO: Distinguish "permission denied for table guilds" (currently) from
        // new row violates row - level security policy for table "guilds"
        // which is what we'd want
      });
    });

    describe('guild creation by authorized user', function() {
      it('creates public guild', async function() {
        publicGuildModel = await axiosUtil.create('guilds', publicGuildInfo(researcherRoleId), sponsorToken);
        publicGuildId = publicGuildModel.id;
        const guilds = await axiosUtil.get('guilds', {}, sponsorToken);
        assert.equal(guilds.length, 1);
      });
      it('creates quasiPublic guild', async function() {
        // The returning false is needed because the guild is not readable until after it's created.
        // We'll probably have to apply this at all times when creating objects
        // that can be private
        quasiPublicGuildModel = await axiosUtil.create('guilds', quasiPublicGuildInfo, sponsorToken);
        quasiPublicGuildId = quasiPublicGuildModel.id;
        const guilds = await axiosUtil.get('guilds', {}, sponsorToken);
        assert.equal(guilds.length, 2);
      });
      it('creates private guild', async function() {
        // The returning false is needed because the guild is not readable until after it's created.
        // We'll probably have to apply this at all times when creating objects
        // that can be private
        const privateGuild = await axiosUtil.create('guilds', privateGuildInfo, sponsorToken);
        privateGuildId = privateGuild.id;
        const guilds = await axiosUtil.get('guilds', {}, sponsorToken);
        assert.equal(guilds.length, 3);
      });

      it('sponsor can invite someone else', async function() {
        const guild_membership = await axiosUtil.create('guild_membership', {
          member_id: quidamId,
          guild_id: publicGuildId,
          status: 'confirmed'
        }, sponsorToken);
        assert.equal(guild_membership.status, 'invitation');
      });
      it('sponsor can delete invitation', async function() {
        const guild_membership = await axiosUtil.delete('guild_membership',
          { member_id: quidamId }, sponsorToken);
        assert.equal(guild_membership.length, 1);
      });
      it('sponsor can reinvite someone else', async function() {
        const guild_membership = await axiosUtil.create('guild_membership', {
          member_id: quidamId,
          guild_id: publicGuildId,
          status: 'confirmed'
        }, sponsorToken);
        assert.equal(guild_membership.status, 'invitation');
      });
      it('only public guild is visible w/o authentication', async function() {
        const guilds = await axiosUtil.get('guilds', {});
        assert.equal(guilds.length, 2);
      });
      it('only public guild is visible w/o authorization', async function() {
        const guilds = await axiosUtil.get('guilds', {}, quidamToken);
        assert.equal(guilds.length, 2);
      });
      it('quidam can confirm invitation', async function() {
        const memberships = await axiosUtil.update(
          'guild_membership',
          { member_id: quidamId, guild_id: publicGuildId },
          { status: 'confirmed' },
          quidamToken);
        assert.equal(memberships.length, 1);
        assert.equal(memberships[0].status, 'confirmed');
      });
      it('quidam can delete own membership', async function() {
        await axiosUtil.delete('guild_membership',
          { member_id: quidamId }, quidamToken);
        const memberships = await axiosUtil.get('guild_membership',
          { member_id: quidamId }, quidamToken);
        assert.equal(memberships.length, 0);
      });
      it('quidam cannot register someone else', async function() {
        await assert.rejects(async () => {
          await axiosUtil.create('guild_membership', {
            member_id: quidam2Id,
            guild_id: publicGuildId,
            status: 'confirmed'
          } as Partial<GuildMembership>, quidamToken);
        }, 'SequelizeDatabaseError');
        const memberships = await axiosUtil.get('guild_membership',
          { member_id: quidam2Id }, quidamToken);
        assert.equal(memberships.length, 0);
      });
      it('quidam can self-register', async function() {
        const membership = await axiosUtil.create('guild_membership', {
          member_id: quidamId,
          guild_id: publicGuildId,
          status: 'confirmed'
        }, quidamToken);
        assert.equal(membership.status, 'confirmed');
      });
      it('quidam cannot self-register in quasi-public guild', async function() {
        const membership = await axiosUtil.create('guild_membership', {
          member_id: quidamId,
          guild_id: quasiPublicGuildId,
          status: 'confirmed'
        } as Partial<GuildMembership>, quidamToken);
        assert.equal(membership.status, 'request');
      });
      // TODO: Add private guild membership to quidam, check access
      // TODO: check update access
    });
  });
});
