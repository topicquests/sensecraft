import assert from 'assert';
import { axiosUtil, add_members, delete_members } from './utils';
import { adminInfo, quidamInfo, sponsorInfo, publicQuestInfo, privateQuestInfo } from './fixtures';

describe('\'quests\' service', function() {
  describe('quest creation', function() {
    let adminToken, quidamId, sponsorId, publicQuestId, privateQuestId, quidamToken, sponsorToken, memberIds, memberTokens;

    before(async function() {
      adminToken = await axiosUtil.call('get_token', {
        mail: adminInfo.email, pass: adminInfo.password
      }, undefined, true);
      ({memberIds, memberTokens} = await add_members([sponsorInfo, quidamInfo], adminToken));
      quidamToken = memberTokens[quidamInfo.handle];
      sponsorToken = memberTokens[sponsorInfo.handle];
      quidamId = memberIds[quidamInfo.handle];
      sponsorId = memberIds[sponsorInfo.handle];
    });

    after(async function() {
      if (publicQuestId)
        await axiosUtil.delete('quests', {id: publicQuestId}, adminToken);
      if (privateQuestId)
        await axiosUtil.delete('quests', { id: privateQuestId }, adminToken);
      await delete_members(memberIds, adminToken);
    });

    it('fails to create quest without authentication', async function() {
      await assert.rejects(async () => {
        await axiosUtil.create('quests', privateQuestInfo);
      }, 'GeneralError');
    });

    describe('quest creation by unauthorized user', function() {
      it('fails to create quest without authorization', async function() {
        await assert.rejects(async () => {
          await axiosUtil.create('quests', privateQuestInfo, quidamToken);
        }, 'GeneralError');
        // TODO: Distinguish "permission denied for table quests" (currently) from
        // new row violates row - level security policy for table "quests"
        // which is what we'd want
      });
    });

    describe('quest creation by authorized user', function() {
      it('creates public quest', async function() {
        const publicQuestModel = await axiosUtil.create('quests', publicQuestInfo, sponsorToken);
        publicQuestId = publicQuestModel.id;
        const quests = await axiosUtil.get('quests', {}, sponsorToken);
        assert.equal(quests.length, 1);
      });
      it('creates private quest', async function() {
        const privateQuestModel = await axiosUtil.create('quests', privateQuestInfo, sponsorToken);
        privateQuestId = privateQuestModel.id;
        const quests = await axiosUtil.get('quests', {}, sponsorToken);
        assert.equal(quests.length, 2);
      });
      it('only public quest is visible w/o authentication', async function() {
        const quests = await axiosUtil.get('quests', {});
        assert.equal(quests.length, 1);
      });
      it('only public quest is visible w/o authorization', async function() {
        const quests = await axiosUtil.get('quests', {}, quidamToken);
        assert.equal(quests.length, 1);
      });
      // TODO: Add private quest membership to quidam, check access
      // TODO: check update access
    });
  });

});
