const assert = require('assert');
const { axiosUtil } = require('./utils');

describe('authentication', () => {
  describe('', () => {
    it('authenticates admin and creates accessToken', async () => {
      const accessToken = await axiosUtil.call('get_token', {
        mail: 'admin@example.com', pass: 'admin'
      }, null, true);
      assert.ok(accessToken, 'Created access token for user');
      const member = await axiosUtil.get(
        'members',
        { email: 'admin@example.com' },
        accessToken
      );
      assert.equal(member.length, 1);
      assert.ok(member, 'Obtained user using accessToken');
    });
  });
});
