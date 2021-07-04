const assert = require('assert');
const app = require('../../src/app');
const { setRole } = require('../../src/services/rolesequelize/rolesequelize.class');
const sequelize = app.get('sequelizeClient');

describe('\'guilds\' service', () => {
  describe('registered the services', () => {

    it('registered the guilds service', () => {
      assert.ok(app.service('guilds'));
    });

    it('registered the users service', () => {
      assert.ok(app.service('users'));
    });

    it('registered the authentication service', () => {
      assert.ok(app.service('authentication'));
    });
  });

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
      status: 'draft',
      public: true,
      open_for_applications: true,
      application_needs_approval: false,
      start: new Date(),
      end: new Date(Date.now() + 100000000000),
    };
    const quasiPublicGuildInfo = {
      name: 'My other great guild',
      handle: 'pubguild2',
      status: 'draft',
      public: true,
      open_for_applications: true,
      application_needs_approval: true,
      start: new Date(),
      end: new Date(Date.now() + 100000000000),
    };
    const privateGuildInfo = {
      name: 'My private guild',
      handle: 'privguild1',
      public: false,
      open_for_applications: true,
      application_needs_approval: true,
      status: 'draft',
      start: new Date(),
      end: new Date(Date.now() + 100000000000),
    };
<<<<<<< HEAD
    var quidamId, quidam2Id, sponsorId, publicGuildId, quasiPublicGuildId, quasiPublicGuildModel, privateGuildId, user, accessToken, publicGuildModel;
=======
    var quidamId, quidam2Id, sponsorId, publicGuildId, privateGuildId, user, accessToken, publicGuildModel;
>>>>>>> 80f4e71 (WIP)

    before(async () => {
      try {
        const quidam = await app.service('users').create(quidamInfo);
        quidamId = quidam.id;
        const quidam2 = await app.service('users').create(quidam2Info);
        quidam2Id = quidam2.id;
        const sponsor = await app.service('users').create(leaderInfo);
        sponsorId = sponsor.id;
      } catch (error) {
        console.error(error);
      }
    });

    after(async () => {
      try {
        if (publicGuildId)
          await app.service('guilds').remove(publicGuildId, {user: 'owner'});
        if (quasiPublicGuildId)
          await app.service('guilds').remove(quasiPublicGuildId, {user: 'owner'});
        if (privateGuildId)
          await app.service('guilds').remove(privateGuildId, {user: 'owner'});
        if (quidamId)
          await app.service('users').remove(quidamId, {user: 'owner'});
        if (quidam2Id)
          await app.service('users').remove(quidam2Id, {user: 'owner'});
        if (sponsorId)
          await app.service('users').remove(sponsorId, {user: 'owner'});
      } catch (error) {
        console.error(error);
      }
    });

    it('fails to create guild without authentication', async () => {
      await assert.rejects(async () => {
        await app.service('guilds').create(privateGuildInfo);
      }, 'GeneralError');
    });

    describe('guild creation by unauthorized user', () => {
      it('authenticates quidam', async () => {
        const auth = await app.service('authentication').create({
          strategy: 'local',
          ...quidamInfo
        });
        user = auth.user;
        accessToken = auth.accessToken;
        assert.ok(accessToken, 'Created access token for user');
        assert.ok(user, 'Includes user in authentication data');
      });
      it('fails to create guild without authorization', async () => {
        await assert.rejects(async () => {
          await app.service('guilds').create(privateGuildInfo, { user });
        }, 'GeneralError');
        // TODO: Distinguish "permission denied for table guilds" (currently) from
        // new row violates row - level security policy for table "guilds"
        // which is what we'd want
      });
      it('quidam can logout', async () => {
        await app.service('authentication').remove(accessToken, {
          authentication: {
            strategy: 'local',
            accessToken: accessToken,
            ...quidamInfo
          }
        });
        user = null;
      });
    });

    describe('guild creation by authorized user', () => {
      it('authenticates sponsor and creates accessToken', async () => {
        const auth = await app.service('authentication').create({
          strategy: 'local',
          ...leaderInfo
        });
        user = auth.user;
        accessToken = auth.accessToken;
        assert.ok(accessToken, 'Created access token for user');
        assert.ok(user, 'Includes user in authentication data');
      });
      it('creates public guild', async () => {
        publicGuildModel = await app.service('guilds').create(publicGuildInfo, {
          user, sequelize: { raw: false }
        });
        publicGuildId = publicGuildModel.id;
        const guilds = await app.service('guilds').find({user});
        assert.equal(guilds.total, 1);
      });
      it('creates quasiPublic guild', async () => {
        // The returning false is needed because the guild is not readable until after it's created.
        // We'll probably have to apply this at all times when creating objects
        // that can be private
        quasiPublicGuildModel = await app.service('guilds').create(quasiPublicGuildInfo, {
          user, sequelize: { raw: false }
        });
        quasiPublicGuildId = quasiPublicGuildModel.id;
        const guilds = await app.service('guilds').find({ user });
        assert.equal(guilds.total, 2);
      });
      it('creates private guild', async () => {
        // The returning false is needed because the guild is not readable until after it's created.
        // We'll probably have to apply this at all times when creating objects
        // that can be private
        const privateGuild = await app.service('guilds').create(privateGuildInfo, { user });
        privateGuildId = privateGuild.id;
        console.log(privateGuild);
        const guilds = await app.service('guilds').find({ user });
        assert.equal(guilds.total, 3);
      });

      it('sponsor can invite someone else', async () => {
        await app.doAsUser(user, async (transaction) => {
          const guild_membership = await publicGuildModel.createGuildMembership({
            userId: quidamId,
            status: 'confirmed'
          }, { transaction });
          console.log(guild_membership);
          assert.equal(guild_membership.status, 'invitation');
        });
      });
      it('sponsor can delete invitation', async () => {
        await app.doAsUser(user, async (transaction) => {
          var memberships = await publicGuildModel.getGuildMemberships({
            transaction,
            where : { userId: quidamId }
          });
          assert.equal(memberships.length, 1);
          const membership = memberships[0];
          console.log('membership: ', membership);
          await membership.destroy({transaction});
        });
      });
      it('sponsor can reinvite someone else', async () => {
        await app.doAsUser(user, async (transaction) => {
          const guild_membership = await publicGuildModel.createGuildMembership({
            userId: quidamId,
            status: 'confirmed'
          }, { transaction });
          assert.equal(guild_membership.status, 'invitation');
        });
      });

      it('sponsor can invite someone else', async () => {
        await app.doAsUser(user, async (transaction) => {
          const guild_membership = await publicGuildModel.createGuildMembership({
            userId: quidamId,
            status: 'confirmed'
          }, { transaction });
          console.log(guild_membership);
          assert.equal(guild_membership.status, 'invitation');
        });
      });
      it('sponsor can delete invitation', async () => {
        await app.doAsUser(user, async (transaction) => {
          var memberships = await publicGuildModel.getGuildMemberships({
            transaction,
            where : { userId: quidamId }
          });
          assert.equal(memberships.length, 1);
          const membership = memberships[0];
          console.log('membership: ', membership);
          await membership.destroy({transaction});
        });
      });
      it('sponsor can reinvite someone else', async () => {
        await app.doAsUser(user, async (transaction) => {
          const guild_membership = await publicGuildModel.createGuildMembership({
            userId: quidamId,
            status: 'confirmed'
          }, { transaction });
          assert.equal(guild_membership.status, 'invitation');
        });
      });
      it('sponsor can logout', async () => {
        await app.service('authentication').remove(accessToken, {
          authentication: {
            strategy: 'local',
            accessToken: accessToken,
            ...leaderInfo
          }
        });
        user = null;
      });
      it('only public guild is visible w/o authentication', async () => {
        const guilds = await app.service('guilds').find();
        assert.equal(guilds.total, 2);
      });
      it('authenticates quidam and creates accessToken', async () => {
        const auth = await app.service('authentication').create({
          strategy: 'local',
          ...quidamInfo
        });
        user = auth.user;
        accessToken = auth.accessToken;
        assert.ok(accessToken, 'Created access token for user');
        assert.ok(user, 'Includes user in authentication data');
      });
      it('only public guild is visible w/o authorization', async () => {
        const guilds = await app.service('guilds').find({user});
        assert.equal(guilds.total, 2);
      });
      it('quidam can confirm invitation', async () => {
        await app.doAsUser(user, async (transaction) => {
          var memberships = await publicGuildModel.getGuildMemberships({
            transaction,
            where: {
              userId: quidamId
            }
          });
          assert.equal(memberships.length, 1);
          const membership = memberships[0];
          console.log('membership: ', membership);
          membership.set('status', 'confirmed');
          await membership.save({ transaction });
        });
      });
      it('quidam can delete own membership', async () => {
        await app.doAsUser(user, async (transaction) => {
          const memberships = await publicGuildModel.getGuildMemberships({
            transaction,
            where: {
              userId: quidamId
            }
          });
          assert.equal(memberships.length, 1);
          const membership = memberships[0];
          await membership.destroy({ transaction });
        });
        // check they really are destroyed
        await app.doAsUser(user, async (transaction) => {
          await setRole(sequelize, { user, transaction });
          const memberships = await publicGuildModel.getGuildMemberships({
            transaction,
            where: {
              userId: quidamId
            }
          });
          assert.equal(memberships.length, 0);
        });
      });
      it('quidam cannot register someone else', async () => {
        await assert.rejects(async () => {
          await app.doAsUser(user, async (transaction) => {
            const guild_membership = await publicGuildModel.createGuildMembership({
              userId: quidam2Id,
              status: 'confirmed'
            }, { transaction });
            console.error('We should not reach this point anymore.');
            // assert.equal(guild_membership, undefined);
            if (guild_membership) {
              console.error('This membership was not really created, as evidenced below, but sequelize is stupid enough to claim so.');
              console.error(guild_membership);
            }
          });
        }, 'SequelizeDatabaseError');
        await app.doAsUser(user, async (transaction) => {
          var memberships = await publicGuildModel.getGuildMemberships({
            transaction,
            where: {
              userId: quidam2Id
            }
          });
          assert.equal(memberships.length, 0);
        });
      });
      it('quidam can self-register', async () => {
        await app.doAsUser(user, async (transaction) => {
          const guild_membership = await publicGuildModel.createGuildMembership({
            userId: quidamId,
            status: 'confirmed'
          }, { transaction });
          // TODO: Check this really exists and not just as a sequelize bug.
          assert.equal(guild_membership.status, 'confirmed');
        });
      });
      it('quidam cannot self-register in quasi-public guild', async () => {
        await app.doAsUser(user, async (transaction) => {
          const guild_membership = await quasiPublicGuildModel.createGuildMembership({
            userId: quidamId,
            status: 'confirmed'
          }, { transaction });
          assert.equal(guild_membership.status, 'request');
        });
      });
      it('quidam can confirm invitation', async () => {
        await app.doAsUser(user, async (transaction) => {
          var memberships = await publicGuildModel.getGuildMemberships({
            transaction,
            where: {
              userId: quidamId
            }
          });
          assert.equal(memberships.length, 1);
          const membership = memberships[0];
          console.log('membership: ', membership);
          membership.set('status', 'confirmed');
          await membership.save({ transaction });
        });
      });
      it('quidam can delete own membership', async () => {
        await app.doAsUser(user, async (transaction) => {
          const memberships = await publicGuildModel.getGuildMemberships({
            transaction,
            where: {
              userId: quidamId
            }
          });
          assert.equal(memberships.length, 1);
          const membership = memberships[0];
          await membership.destroy({ transaction });
        });
        // check they really are destroyed
        await app.doAsUser(user, async (transaction) => {
          await setRole(sequelize, { user, transaction });
          const memberships = await publicGuildModel.getGuildMemberships({
            transaction,
            where: {
              userId: quidamId
            }
          });
          assert.equal(memberships.length, 0);
        });
      });
      it('quidam cannot register someone else', async () => {
        await app.doAsUser(user, async (transaction) => {
          const guild_membership = await publicGuildModel.createGuildMembership({
            userId: quidam2Id,
            status: 'confirmed'
          }, { transaction });
          // assert.equal(guild_membership, undefined);
          if (guild_membership) {
            console.error('This membership was not really created, as evidenced below, but sequelize is stupid enough to claim so.');
            console.error(guild_membership);
          }
        });
        await app.doAsUser(user, async (transaction) => {
          var memberships = await publicGuildModel.getGuildMemberships({
            transaction,
            where: {
              userId: quidam2Id
            }
          });
          assert.equal(memberships.length, 0);
        });
      });
      it('quidam cannot self-register', async () => {
        await app.doAsUser(user, async (transaction) => {
          const guild_membership = await publicGuildModel.createGuildMembership({
            userId: quidamId,
            status: 'confirmed'
          }, { transaction });
          assert.equal(guild_membership.status, 'request');
        });
      });
      it('quidam can logout', async () => {
        await app.service('authentication').remove(accessToken, {
          authentication: {
            strategy: 'local',
            accessToken: accessToken,
            ...quidamInfo
          }
        });
        user = null;
      });
      // TODO: Add private guild membership to quidam, check access
      // TODO: check update access
    });
  });

});
