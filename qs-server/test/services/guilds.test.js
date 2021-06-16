const assert = require('assert');
const app = require('../../src/app');

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
      start: new Date(),
      end: new Date(Date.now() + 100000000000),
    };
    const privateGuildInfo = {
      name: 'My private guild',
      handle: 'privguild1',
      public: false,
      status: 'draft',
      start: new Date(),
      end: new Date(Date.now() + 100000000000),
    };
    var quidamId, sponsorId, publicGuildId, privateGuildId, user, accessToken;

    before(async () => {
      try {

        const quidam = await app.service('users').create(quidamInfo);
        quidamId = quidam.id;
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
        if (privateGuildId)
          await app.service('guilds').remove(privateGuildId, {user: 'owner'});
        if (quidamId)
          await app.service('users').remove(quidamId, {user: 'owner'});
        if (sponsorId)
          await app.service('users').remove(sponsorId, {user: 'owner'});
      } catch (error) {
        console.error(error);
      }
    });

    it('fails to create guild without authentication', async () => {
      assert.rejects(async () => {
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
        assert.rejects(async () => {
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
        const publicGuild = await app.service('guilds').create(publicGuildInfo, {user});
        publicGuildId = publicGuild.id;
        console.log(publicGuild);
        const guilds = await app.service('guilds').find({user});
        assert.equal(guilds.total, 1);
      });
      it('creates private guild', async () => {
        // The returning false is needed because the guild is not readable until after it's created.
        // We'll probably have to apply this at all times when creating objects
        // that can be private
        const privateGuild = await app.service('guilds').create(privateGuildInfo, { user });
        privateGuildId = privateGuild.id;
        console.log(privateGuild);
        const guilds = await app.service('guilds').find({ user });
        assert.equal(guilds.total, 2);
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
        assert.equal(guilds.total, 1);
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
        assert.equal(guilds.total, 1);
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
