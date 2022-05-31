import assert from 'assert';
import { axiosUtil } from './utils';
import { adminInfo } from './fixtures';

describe('authentication', function() {
  it('authenticates admin and creates accessToken', async function() {
    const accessToken = await axiosUtil.call('get_token', {
      mail: adminInfo.email, pass: adminInfo.password
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
