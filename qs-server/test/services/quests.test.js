const assert = require('assert');
const app = require('../../src/app');
const sequelize = app.get('sequelizeClient');

describe('\'quests\' service', () => {
  describe('registered the services', () => {

    it('registered the quests service', () => {
      assert.ok(app.service('quests'));
    });

    it('registered the users service', () => {
      assert.ok(app.service('users'));
    });

    it('registered the authentication service', () => {
      assert.ok(app.service('authentication'));
    });
  });

  describe('quest creation', () => {
    const quidamInfo = {
      email: 'quidam@example.com',
      handle: 'quidam',
      name: 'Quidam',
      password: 'supersecret'
    };
    const sponsorInfo = {
      email: 'sponsor@example.com',
      handle: 'sponsor',
      name: 'Quest Sponsor',
      password: 'supersecret',
      permissions: ['createQuest']
    };
    const publicQuestInfo = {
      name: 'My great quest',
      handle: 'pubquest',
      status: 'draft',
      public: true,
      start: new Date(),
      end: new Date(Date.now() + 100000000000),
    };
    const privateQuestInfo = {
      name: 'My private quest',
      handle: 'privquest1',
      public: false,
      status: 'draft',
      start: new Date(),
      end: new Date(Date.now() + 100000000000),
    };
    var quidamId, sponsorId, publicQuestId, privateQuestId, user, accessToken;

    before(async () => {
      try {

        const quidam = await app.service('users').create(quidamInfo);
        quidamId = quidam.id;
        const sponsor = await app.service('users').create(sponsorInfo);
        sponsorId = sponsor.id;
      } catch (error) {
        console.error(error);
      }
    });

    after(async () => {
      try {
        if (publicQuestId)
          await app.service('quests').remove(publicQuestId, {user: 'owner'});
        if (privateQuestId)
          await app.service('quests').remove(privateQuestId, {user: 'owner'});
        if (quidamId)
          await app.service('users').remove(quidamId, {user: 'owner'});
        if (sponsorId)
          await app.service('users').remove(sponsorId, {user: 'owner'});
      } catch (error) {
        console.error(error);
      }
    });

    it('fails to create quest without authentication', async () => {
      assert.rejects(async () => {
        await app.service('quests').create(privateQuestInfo);
      }, 'GeneralError');
    });

    describe('quest creation by unauthorized user', () => {
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
      it('fails to create quest without authorization', async () => {
        assert.rejects(async () => {
          await app.service('quests').create(privateQuestInfo, { user });
        }, 'GeneralError');
        // TODO: Distinguish "permission denied for table quests" (currently) from
        // new row violates row - level security policy for table "quests"
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

    describe('quest creation by authorized user', () => {
      it('authenticates sponsor and creates accessToken', async () => {
        const auth = await app.service('authentication').create({
          strategy: 'local',
          ...sponsorInfo
        });
        user = auth.user;
        accessToken = auth.accessToken;
        assert.ok(accessToken, 'Created access token for user');
        assert.ok(user, 'Includes user in authentication data');
      });
      it('creates public quest', async () => {
        const publicQuest = await app.service('quests').create(publicQuestInfo, {user});
        publicQuestId = publicQuest.id;
        console.log(publicQuest);
        const quests = await app.service('quests').find({user});
        assert.equal(quests.total, 1);
      });
      it('creates private quest', async () => {
        // The returning false is needed because the quest is not readable until after it's created.
        // We'll probably have to apply this at all times when creating objects
        // that can be private
        const privateQuest = await app.service('quests').create(privateQuestInfo, { user });
        privateQuestId = privateQuest.id;
        console.log(privateQuest);
        const quests = await app.service('quests').find({ user });
        assert.equal(quests.total, 2);
      });
      it('sponsor can logout', async () => {
        await app.service('authentication').remove(accessToken, {
          authentication: {
            strategy: 'local',
            accessToken: accessToken,
            ...sponsorInfo
          }
        });
        user = null;
      });
      it('only public quest is visible w/o authentication', async () => {
        const quests = await app.service('quests').find();
        assert.equal(quests.total, 1);
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
      it('only public quest is visible w/o authorization', async () => {
        const quests = await app.service('quests').find({user});
        assert.equal(quests.total, 1);
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
      // TODO: Add private quest membership to quidam, check access
      // TODO: check update access
    });
  });

});
