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
    const quidam2Info = {
      email: 'quidam2@example.com',
      handle: 'quidam2',
      name: 'Quidam2',
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
    const quasiPublicGuildInfo = {
      name: 'My other great guild',
      handle: 'pubguild2',
      public: true,
      open_for_applications: true,
      application_needs_approval: true,
    };
    const privateGuildInfo = {
      name: 'My private guild',
      handle: 'privguild1',
      public: false,
      open_for_applications: true,
      application_needs_approval: true,
    };
    var adminToken, quidamId, quidam2Id, sponsorId, publicGuildId, quasiPublicGuildId, quasiPublicGuildModel, privateGuildId, accessToken, publicGuildModel;

    before(async () => {
      adminToken = await axiosUtil.call('get_token', {
        mail: 'admin@example.com', pass: 'admin'
      }, null, true);
      const quidam = await axiosUtil.create('members', quidamInfo);
      quidamId = quidam.id;
      const quidam2 = await axiosUtil.create('members', quidam2Info);
      quidam2Id = quidam2.id;
      const sponsor = await axiosUtil.create('members', leaderInfo);
      sponsorId = sponsor.id;
    });

    after(async () => {
      if (publicGuildId)
        await axiosUtil.delete('guilds', {id: publicGuildId}, adminToken);
      if (quasiPublicGuildId)
        await axiosUtil.delete('guilds', {id: quasiPublicGuildId}, adminToken);
      if (privateGuildId)
        await axiosUtil.delete('guilds', {id: privateGuildId}, adminToken);
      if (quidamId)
        await axiosUtil.delete('members', {id: quidamId}, adminToken);
      if (quidam2Id)
        await axiosUtil.delete('members', {id: quidam2Id}, adminToken);
      if (sponsorId)
        await axiosUtil.delete('members', {id: sponsorId}, adminToken);
    });

    it('fails to create guild without authentication', async () => {
      await assert.rejects(async () => {
        await axiosUtil.create('guilds', privateGuildInfo);
      }, 'GeneralError');
    });

    describe('guild creation by unauthorized user', () => {
      it('authenticates quidam', async () => {
        accessToken = await axiosUtil.call('get_token', {
          mail: quidamInfo.email, pass: quidamInfo.password
        }, null, true);
        assert.ok(accessToken, 'Created access token for user');
      });
      it('fails to create guild without authorization', async () => {
        await assert.rejects(async () => {
          await axiosUtil.create('guilds', privateGuildInfo, accessToken);
        }, 'GeneralError');
        // TODO: Distinguish "permission denied for table guilds" (currently) from
        // new row violates row - level security policy for table "guilds"
        // which is what we'd want
      });
    });

    describe('guild creation by authorized user', () => {
      it('authenticates sponsor and creates accessToken', async () => {
        accessToken = await axiosUtil.call('get_token', {
          mail: leaderInfo.email, pass: leaderInfo.password
        }, null, true);
        assert.ok(accessToken, 'Created access token for user');
      });
      it('creates public guild', async () => {
        publicGuildModel = await axiosUtil.create('guilds', publicGuildInfo, accessToken);
        publicGuildId = publicGuildModel.id;
        const guilds = await axiosUtil.get('guilds', {}, accessToken);
        assert.equal(guilds.length, 1);
      });
      it('creates quasiPublic guild', async () => {
        // The returning false is needed because the guild is not readable until after it's created.
        // We'll probably have to apply this at all times when creating objects
        // that can be private
        quasiPublicGuildModel = await axiosUtil.create('guilds', quasiPublicGuildInfo, accessToken);
        quasiPublicGuildId = quasiPublicGuildModel.id;
        const guilds = await axiosUtil.get('guilds', {}, accessToken);
        assert.equal(guilds.length, 2);
      });
      it('creates private guild', async () => {
        // The returning false is needed because the guild is not readable until after it's created.
        // We'll probably have to apply this at all times when creating objects
        // that can be private
        const privateGuild = await axiosUtil.create('guilds', privateGuildInfo, accessToken);
        privateGuildId = privateGuild.id;
        const guilds = await axiosUtil.get('guilds', {}, accessToken);
        assert.equal(guilds.length, 3);
      });

      it('sponsor can invite someone else', async () => {
        const guild_membership_id = await axiosUtil.create('guild_membership', {
          member_id: quidamId,
          guild_id: publicGuildId,
          status: 'confirmed'
        }, accessToken);
        const guild_membership = await axiosUtil.get('guild_membership', guild_membership_id, accessToken);
        assert.equal(guild_membership.length, 1);
        assert.equal(guild_membership[0].status, 'invitation');
      });
      it('sponsor can delete invitation', async () => {
        const guild_membership = await axiosUtil.delete('guild_membership',
          { member_id: quidamId }, accessToken);
        assert.equal(guild_membership.length, 1);
      });
      it('sponsor can reinvite someone else', async () => {
        const guild_membership_id = await axiosUtil.create('guild_membership', {
          member_id: quidamId,
          guild_id: publicGuildId,
          status: 'confirmed'
        }, accessToken);
        const guild_membership = await axiosUtil.get('guild_membership', guild_membership_id, accessToken);
        assert.equal(guild_membership.length, 1);
        assert.equal(guild_membership[0].status, 'invitation');
      });
      it('only public guild is visible w/o authentication', async () => {
        const guilds = await axiosUtil.get('guilds', {});
        assert.equal(guilds.length, 2);
      });
      it('authenticates quidam and creates accessToken', async () => {
        accessToken = await axiosUtil.call('get_token', {
          mail: quidamInfo.email, pass: quidamInfo.password
        }, null, true);
        assert.ok(accessToken, 'Created access token for user');
      });
      it('only public guild is visible w/o authorization', async () => {
        const guilds = await axiosUtil.get('guilds', {}, accessToken);
        assert.equal(guilds.length, 2);
      });
      it('quidam can confirm invitation', async () => {
        const memberships = await axiosUtil.update(
          'guild_membership',
          { member_id: quidamId, guild_id: publicGuildId },
          { status: 'confirmed' },
          accessToken);
        assert.equal(memberships.length, 1);
        assert.equal(memberships[0].status, 'confirmed');
      });
      it('quidam can delete own membership', async () => {
        await axiosUtil.delete('guild_membership',
          { member_id: quidamId }, accessToken);
        const memberships = await axiosUtil.get('guild_membership',
          { member_id: quidamId }, accessToken);
        assert.equal(memberships.length, 0);
      });
      it('quidam cannot register someone else', async () => {
        await assert.rejects(async () => {
          await axiosUtil.create('guild_membership', {
            member_id: quidam2Id,
            guild_id: publicGuildId,
            status: 'confirmed'
          }, accessToken);
        }, 'SequelizeDatabaseError');
        const memberships = await axiosUtil.get('guild_membership',
          { member_id: quidam2Id }, accessToken);
        assert.equal(memberships.length, 0);
      });
      it('quidam can self-register', async () => {
        const membership_id = await axiosUtil.create('guild_membership', {
          member_id: quidamId,
          guild_id: publicGuildId,
          status: 'confirmed'
        }, accessToken);
        const membership = await axiosUtil.get('guild_membership', membership_id, accessToken);
        assert.equal(membership.length, 1);
        assert.equal(membership[0].status, 'confirmed');
      });
      it('quidam cannot self-register in quasi-public guild', async () => {
        const membership_id = await axiosUtil.create('guild_membership', {
          member_id: quidamId,
          guild_id: quasiPublicGuildId,
          status: 'confirmed'
        }, accessToken);
        const membership = await axiosUtil.get('guild_membership', membership_id, accessToken);
        assert.equal(membership.length, 1);
        assert.equal(membership[0].status, 'request');
      });
      // TODO: Add private guild membership to quidam, check access
      // TODO: check update access
    });
  });
});
