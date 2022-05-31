import assert from 'assert';
import { axiosUtil } from './utils';
import { adminInfo, quidamInfo, sponsorInfo, publicQuestInfo, privateQuestInfo } from './fixtures';

describe('\'quests\' service', function() {
  describe('quest creation', function() {
    let adminToken, quidamId, sponsorId, publicQuestId, privateQuestId, accessToken;

    before(async function() {
      adminToken = await axiosUtil.call('get_token', {
        mail: adminInfo.email, pass: adminInfo.password
      }, null, true);
      sponsorId = await axiosUtil.call('create_member', sponsorInfo);
      quidamId = await axiosUtil.call('create_member', quidamInfo);
    });

    after(async function() {
      if (publicQuestId)
        await axiosUtil.delete('quests', {id: publicQuestId}, adminToken);
      if (privateQuestId)
        await axiosUtil.delete('quests', {id: privateQuestId}, adminToken);
      if (quidamId)
        await axiosUtil.delete('members', {id: quidamId}, adminToken);
      if (sponsorId)
        await axiosUtil.delete('members', {id: sponsorId}, adminToken);
    });

    it('fails to create quest without authentication', async function() {
      await assert.rejects(async () => {
        await axiosUtil.create('quests', privateQuestInfo, null);
      }, 'GeneralError');
    });

    describe('quest creation by unauthorized user', function() {
      it('authenticates quidam', async function() {
        accessToken = await axiosUtil.call('get_token', {
          mail: quidamInfo.email, pass: quidamInfo.password
        }, null, true);
        assert.ok(accessToken, 'Created access token for user');
      });
      it('fails to create quest without authorization', async function() {
        await assert.rejects(async () => {
          await axiosUtil.create('quests', privateQuestInfo, accessToken);
        }, 'GeneralError');
        // TODO: Distinguish "permission denied for table quests" (currently) from
        // new row violates row - level security policy for table "quests"
        // which is what we'd want
      });
    });

    describe('quest creation by authorized user', function() {
      it('authenticates sponsor and creates accessToken', async function() {
        accessToken = await axiosUtil.call('get_token', {
          mail: sponsorInfo.email, pass: sponsorInfo.password
        }, null, true);
        assert.ok(accessToken, 'Created access token for user');
      });
      it('creates public quest', async function() {
        const publicQuestModel = await axiosUtil.create('quests', publicQuestInfo, accessToken);
        publicQuestId = publicQuestModel.id;
        const quests = await axiosUtil.get('quests', {}, accessToken);
        assert.equal(quests.length, 1);
      });
      it('creates private quest', async function() {
        const privateQuestModel = await axiosUtil.create('quests', privateQuestInfo, accessToken);
        privateQuestId = privateQuestModel.id;
        const quests = await axiosUtil.get('quests', {}, accessToken);
        assert.equal(quests.length, 2);
      });
      it('only public quest is visible w/o authentication', async function() {
        const quests = await axiosUtil.get('quests', {}, null);
        assert.equal(quests.length, 1);
      });
      it('authenticates quidam and creates accessToken', async function() {
        accessToken = await axiosUtil.call('get_token', {
          mail: quidamInfo.email, pass: quidamInfo.password
        }, null, true);
        assert.ok(accessToken, 'Created access token for user');
      });
      it('only public quest is visible w/o authorization', async function() {
        const quests = await axiosUtil.get('quests', {}, null);
        assert.equal(quests.length, 1);
      });
      // TODO: Add private quest membership to quidam, check access
      // TODO: check update access
    });
  });

});
