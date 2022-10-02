import assert from 'assert';
import { axiosUtil, add_members, delete_members } from './utils';
import { adminInfo, quidamInfo, sponsorInfo, draftPublicQuestInfo, privateQuestInfo } from './fixtures';

describe('\'quests\' service', function() {
  describe('quest creation', function() {
    let adminToken, publicQuestId, privateQuestId, quidamToken, sponsorToken, memberIds, memberTokens;

    before(async function() {
      adminToken = await axiosUtil.call('get_token', {
        mail: adminInfo.email, pass: adminInfo.password
      });
      ({memberIds, memberTokens} = await add_members([sponsorInfo, quidamInfo], adminToken));
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      quidamToken = memberTokens[quidamInfo.handle!];
      sponsorToken = memberTokens[sponsorInfo.handle!];
      /* eslint-ensable @typescript-eslint/no-non-null-assertion */
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
      }, /AxiosError/);
    });

    describe('quest creation by unauthorized user', function() {
      it('fails to create quest without authorization', async function() {
        await assert.rejects(async () => {
          await axiosUtil.create('quests', privateQuestInfo, quidamToken);
        }, /AxiosError/);
        // TODO: Distinguish "permission denied for table quests" (currently) from
        // new row violates row - level security policy for table "quests"
        // which is what we'd want
      });
    });

    describe('quest creation by authorized user', function() {
      it('creates draft public quest', async function() {
        const publicQuestModel = await axiosUtil.create('quests', draftPublicQuestInfo, sponsorToken);
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
      it('draft public quest is not visible w/o authentication', async function() {
        const quests = await axiosUtil.get('quests', {});
        assert.equal(quests.length, 0);
      });
      it('draft public quest is not visible w/o authorization', async function() {
        const quests = await axiosUtil.get('quests', {}, quidamToken);
        assert.equal(quests.length, 0);
      });
      it('changes the status of the public quest', async function () {
        await axiosUtil.update('quests', publicQuestId, {status: 'registration'}, sponsorToken);
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
