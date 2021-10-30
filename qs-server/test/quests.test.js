const assert = require('assert');
const { axiosUtil } = require('./utils');
const { quidamInfo, sponsorInfo, publicQuestInfo, privateQuestInfo } = require('./fixtures.cjs');

describe('\'quests\' service', () => {
  describe('quest creation', () => {
    var adminToken, quidamId, sponsorId, publicQuestId, privateQuestId, accessToken;

    before(async () => {
      adminToken = await axiosUtil.call('get_token', {
        mail: 'admin@example.com', pass: 'admin'
      }, null, true);
      sponsorId = await axiosUtil.call('create_member', sponsorInfo);
      quidamId = await axiosUtil.call('create_member', quidamInfo);
    });

    after(async () => {
      if (publicQuestId)
        await axiosUtil.delete('quests', {id: publicQuestId}, adminToken);
      if (privateQuestId)
        await axiosUtil.delete('quests', {id: privateQuestId}, adminToken);
      if (quidamId)
        await axiosUtil.delete('members', {id: quidamId}, adminToken);
      if (sponsorId)
        await axiosUtil.delete('members', {id: sponsorId}, adminToken);
    });

    it('fails to create quest without authentication', async () => {
      await assert.rejects(async () => {
        await axiosUtil.create('quests', privateQuestInfo);
      }, 'GeneralError');
    });

    describe('quest creation by unauthorized user', () => {
      it('authenticates quidam', async () => {
        accessToken = await axiosUtil.call('get_token', {
          mail: quidamInfo.email, pass: quidamInfo.password
        }, null, true);
        assert.ok(accessToken, 'Created access token for user');
      });
      it('fails to create quest without authorization', async () => {
        await assert.rejects(async () => {
          await axiosUtil.create('quests', privateQuestInfo, accessToken);
        }, 'GeneralError');
        // TODO: Distinguish "permission denied for table quests" (currently) from
        // new row violates row - level security policy for table "quests"
        // which is what we'd want
      });
    });

    describe('quest creation by authorized user', () => {
      it('authenticates sponsor and creates accessToken', async () => {
        accessToken = await axiosUtil.call('get_token', {
          mail: sponsorInfo.email, pass: sponsorInfo.password
        }, null, true);
        assert.ok(accessToken, 'Created access token for user');
      });
      it('creates public quest', async () => {
        const publicQuestModel = await axiosUtil.create('quests', publicQuestInfo, accessToken);
        publicQuestId = publicQuestModel.id;
        const quests = await axiosUtil.get('quests', {}, accessToken);
        assert.equal(quests.length, 1);
      });
      it('creates private quest', async () => {
        const privateQuestModel = await axiosUtil.create('quests', privateQuestInfo, accessToken);
        privateQuestId = privateQuestModel.id;
        const quests = await axiosUtil.get('quests', {}, accessToken);
        assert.equal(quests.length, 2);
      });
      it('only public quest is visible w/o authentication', async () => {
        const quests = await axiosUtil.get('quests', {});
        assert.equal(quests.length, 1);
      });
      it('authenticates quidam and creates accessToken', async () => {
        accessToken = await axiosUtil.call('get_token', {
          mail: quidamInfo.email, pass: quidamInfo.password
        }, null, true);
        assert.ok(accessToken, 'Created access token for user');
      });
      it('only public quest is visible w/o authorization', async () => {
        const quests = await axiosUtil.get('quests', {});
        assert.equal(quests.length, 1);
      });
      // TODO: Add private quest membership to quidam, check access
      // TODO: check update access
    });
  });

});
