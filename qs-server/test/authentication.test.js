const assert = require('assert');
const app = require('../src/app');
const sequelize = app.get('sequelizeClient');
const db_name = sequelize.getDatabaseName();

describe('authentication', () => {
  it('registered the authentication service', () => {
    assert.ok(app.service('authentication'));
  });
  
  describe('local strategy', () => {
    const userInfo = {
      email: 'someone@example.com',
      handle: 'someone',
      name: 'Someone',
      password: 'supersecret'
    };
    var userId, token;

    before(async () => {
      try {
        const user = await app.service('users').create(userInfo);
        userId = user.id;
      } catch (error) {
        // Do nothing, it just means the user already exists and can be tested
      }
    });

    after(async () => {
      try {
        if (userId) {
          await app.service('users').remove(userId, {user: 'owner'});
        }
      } catch (error) {
        console.error(error);
      }
    });

    it('authenticates user and creates accessToken', async () => {
      const { user, accessToken } = await app.service('authentication').create({
        strategy: 'local',
        ...userInfo
      });
      assert.ok(accessToken, 'Created access token for user');
      assert.ok(user, 'Includes user in authentication data');
      token = accessToken;
    });
    it('can logout', async () => {
      await app.service('authentication').remove(token, {
        authentication: {
          strategy: 'local',
          accessToken: token,
          ...userInfo
        }
      });
    });
  });
});
