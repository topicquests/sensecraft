import assert from "assert";
import {
  axiosUtil,
  get_base_roles,
  get_system_role_by_name,
  add_members,
  delete_members,
  add_nodes,
  delete_nodes,
  multiId,
} from "./utils";
import {
  adminInfo,
  quidamInfo,
  leaderInfo,
  publicGuildInfo,
  sponsorInfo,
  publicQuestInfo,
  publicQuest2Info,
  question1Info,
  answer1Info,
  argument1Info,
} from "./fixtures";
import type {
  PseudoNode,
  GuildMemberAvailableRole,
  GuildMembership,
  Casting,
  CastingRole,
} from "../../client/src/types";
//import { devNull } from 'os';

function num_nodes_in_json(json) {
  let i = 1;
  for (const j of json.children || []) {
    i += num_nodes_in_json(j);
  }
  return i;
}

function remove_ids(recNode) {
  delete recNode.id;
  for (const child of recNode.children || []) {
    remove_ids(child);
  }
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
describe("'conversation_node' service", function () {
  describe("guild creation", function () {
    const nodeIds: { [key: string]: number } = {};
    let adminToken,
      publicGuildId,
      publicQuestId,
      publicQuest2Id,
      sponsorToken,
      leaderToken,
      quidamToken,
      q1Id,
      a1Id,
      arg1Id,
      memberIds,
      memberTokens,
      roles,
      researcherRoleId,
      philosopherRoleId,
      gameLeaderRoleId,
      tree_info;

    async function my_add_node(node: Partial<PseudoNode>, qId = publicQuestId) {
      return await add_nodes([node], qId, memberTokens, nodeIds);
    }

    before(async function () {
      adminToken = await axiosUtil.call("get_token", {
        mail: adminInfo.email,
        pass: adminInfo.password,
      });
      ({ memberIds, memberTokens } = await add_members(
        [leaderInfo, sponsorInfo, quidamInfo],
        adminToken
      ));
      if (Object.keys(memberIds).length != 3) throw Error();
      quidamToken = memberTokens[quidamInfo.handle!];
      leaderToken = memberTokens[leaderInfo.handle!];
      sponsorToken = memberTokens[sponsorInfo.handle!];
      roles = await get_base_roles(adminToken);
      researcherRoleId = get_system_role_by_name(roles, "Researcher")?.id;
      philosopherRoleId = get_system_role_by_name(roles, "Philosopher")?.id;
      gameLeaderRoleId = get_system_role_by_name(roles, "Game leader")?.id;
    });

    after(async function () {
      if (process.env.NOREVERT) return;
      await delete_nodes(Object.keys(nodeIds), nodeIds, adminToken);
      if (publicGuildId)
        await axiosUtil.delete("guilds", { id: publicGuildId }, adminToken);
      if (publicQuestId)
        await axiosUtil.delete("quests", { id: publicQuestId }, adminToken);
      if (publicQuest2Id)
        await axiosUtil.delete("quests", { id: publicQuest2Id }, adminToken);
      delete_members(memberIds, adminToken);
    });

    describe("conversation_node tests", function () {
      let game_play_id: multiId;
      it("creates two public quests", async function () {
        let publicQuestModel = await axiosUtil.create(
          "quests",
          publicQuestInfo,
          sponsorToken
        );
        publicQuestId = publicQuestModel.id;
        let quests = await axiosUtil.get("quests", {}, sponsorToken);
        assert.equal(quests.length, 1);
        publicQuestModel = await axiosUtil.create(
          "quests",
          publicQuest2Info,
          sponsorToken
        );
        publicQuest2Id = publicQuestModel.id;
        quests = await axiosUtil.get("quests", {}, leaderToken);
        assert.equal(quests.length, 2);
      });
      it("sponsor can ask first question", async function () {
        Object.assign(nodeIds, await my_add_node(question1Info));
        q1Id = nodeIds[question1Info.id!];
      });
      it("sponsor cannot create a second root", async function () {
        await assert.rejects(async () => {
          await my_add_node({
            id: "q2",
            node_type: "question",
            status: "published",
            title: "second question",
            creator_id: sponsorInfo.handle,
          });
        }, /Each quest must have a single root/);
      });
      it("creates public guild", async function () {
        const publicGuildModel = await axiosUtil.create(
          "guilds",
          publicGuildInfo(researcherRoleId),
          leaderToken
        );
        publicGuildId = publicGuildModel.id;
        const guilds = await axiosUtil.get("guilds", {}, leaderToken);
        assert.equal(guilds.length, 1);
        game_play_id = {
          guild_id: publicGuildId,
          quest_id: publicQuestId,
        };
      });
      it("quidam can register to guild", async function () {
        const register = await axiosUtil.create(
          "guild_membership",
          {
            member_id: memberIds[quidamInfo.handle!],
            guild_id: publicGuildId,
          } as Partial<GuildMembership>,
          quidamToken
        );
        assert.ok(register);
      });
      it("guild leader can register guild to quest", async function () {
        const register = await axiosUtil.create(
          "game_play",
          game_play_id,
          leaderToken
        );
        assert.ok(register);
        const game_play = await axiosUtil.get(
          "game_play",
          game_play_id,
          leaderToken
        );
        assert.equal(game_play.length, 1);
        assert.equal(game_play[0].status, "confirmed");
      });
      it("leader can self-register", async function () {
        const r = await axiosUtil.create(
          "casting",
          {
            member_id: memberIds[leaderInfo.handle!],
            guild_id: publicGuildId,
            quest_id: publicQuestId,
          } as Partial<Casting>,
          leaderToken
        );
        assert.ok(r);
      });
      it("leader can make game leader role available for self", async function () {
        const r = await axiosUtil.create(
          "guild_member_available_role",
          {
            member_id: memberIds[leaderInfo.handle!],
            guild_id: publicGuildId,
            role_id: gameLeaderRoleId,
          } as Partial<GuildMemberAvailableRole>,
          leaderToken
        );
        assert.ok(r);
      });
      it("leader can self-assign game leader role", async function () {
        const r = await axiosUtil.create(
          "casting_role",
          {
            member_id: memberIds[leaderInfo.handle!],
            guild_id: publicGuildId,
            quest_id: publicQuestId,
            role_id: gameLeaderRoleId,
          } as Partial<CastingRole>,
          leaderToken
        );
        assert.ok(r);
      });
      it("quidam can self-register", async function () {
        const r = await axiosUtil.create(
          "casting",
          {
            member_id: memberIds[quidamInfo.handle!],
            guild_id: publicGuildId,
            quest_id: publicQuestId,
          } as Partial<Casting>,
          quidamToken
        );
        assert.ok(r);
      });
      it("quidam can self-cast with default role", async function () {
        const r = await axiosUtil.create(
          "casting_role",
          {
            member_id: memberIds[quidamInfo.handle!],
            guild_id: publicGuildId,
            quest_id: publicQuestId,
            role_id: researcherRoleId,
          } as Partial<CastingRole>,
          quidamToken
        );
        assert.ok(r);
      });
      it("quidam can create private draft node", async function () {
        Object.assign(nodeIds, await my_add_node(answer1Info));
        a1Id = nodeIds[answer1Info.id!];
      });
      it("leader cannot submit node before quest is ongoing", async function () {
        await assert.rejects(async () => {
          await my_add_node({
            id: "a2",
            node_type: "answer",
            parent_id: "q1",
            status: "submitted",
            title: "first question",
          });
        });
      });
      it("sponsor can start quest", async function () {
        await axiosUtil.update(
          "quests",
          { id: publicQuestId },
          { status: "ongoing" },
          sponsorToken
        );
      });
      it("quidam cannot pile an argument on a question", async function () {
        await assert.rejects(async () => {
          await my_add_node({
            id: "arg0",
            creator_id: quidamInfo.handle,
            node_type: "pro",
            parent_id: "q1",
            title: "pro argument",
          });
        });
      });
      it("leader and sponsor cannot see private draft", async function () {
        let node_model = await axiosUtil.get(
          "conversation_node",
          { id: a1Id },
          leaderToken
        );
        assert.equal(node_model.length, 0);
        node_model = await axiosUtil.get(
          "conversation_node",
          { id: a1Id },
          sponsorToken
        );
        assert.equal(node_model.length, 0);
      });
      it("quidam can update draft node to role_draft", async function () {
        await axiosUtil.update(
          "conversation_node",
          { id: a1Id },
          {
            description: "details about the answer",
            status: "role_draft",
            draft_for_role_id: philosopherRoleId,
          },
          quidamToken
        );
      });
      it("sponsor cannot see role draft", async function () {
        const node_model = await axiosUtil.get(
          "conversation_node",
          { id: a1Id },
          sponsorToken
        );
        assert.equal(node_model.length, 0);
      });
      it("leader cannot see role draft", async function () {
        const node_model = await axiosUtil.get(
          "conversation_node",
          { id: a1Id },
          leaderToken
        );
        assert.equal(node_model.length, 0);
      });
      it("leader can make philosopher role available for self", async function () {
        const r = await axiosUtil.create(
          "guild_member_available_role",
          {
            member_id: memberIds[leaderInfo.handle!],
            guild_id: publicGuildId,
            role_id: philosopherRoleId,
          } as Partial<GuildMemberAvailableRole>,
          leaderToken
        );
        assert.ok(r);
      });
      it("leader can self-assign philosopher role", async function () {
        const r = await axiosUtil.create(
          "casting_role",
          {
            member_id: memberIds[leaderInfo.handle!],
            guild_id: publicGuildId,
            quest_id: publicQuestId,
            role_id: philosopherRoleId,
          } as Partial<CastingRole>,
          leaderToken
        );
        assert.ok(r);
      });
      it("leader can see role draft with appropriate role", async function () {
        const node_model = await axiosUtil.get(
          "conversation_node",
          { id: a1Id },
          leaderToken
        );
        assert.equal(node_model.length, 1);
      });
      it("quidam can update role_draft node to guild_draft", async function () {
        await axiosUtil.update(
          "conversation_node",
          { id: a1Id },
          {
            description: "details about the answer",
            status: "guild_draft",
          },
          quidamToken
        );
      });
      // Q: should we forbid modification of a proposed node? A: Not for now.
      it("sponsor cannot see guild draft", async function () {
        const node_model = await axiosUtil.get(
          "conversation_node",
          { id: a1Id },
          sponsorToken
        );
        assert.equal(node_model.length, 0);
      });
      it("leader can see guild draft", async function () {
        const node_model = await axiosUtil.get(
          "conversation_node",
          { id: a1Id },
          leaderToken
        );
        assert.equal(node_model.length, 1);
      });
      it("guild member can update someone elses guild draft node", async function () {
        await axiosUtil.update(
          "conversation_node",
          { id: a1Id },
          {
            description: "more details about the answer",
          },
          leaderToken
        );
      });
      it("quidam can pile on draft nodes", async function () {
        Object.assign(nodeIds, await my_add_node(argument1Info));
        arg1Id = nodeIds["arg1"];
      });
      it("find subtree", async function () {
        const descModels = await axiosUtil.call(
          "node_subtree",
          { node_id: a1Id },
          quidamToken
        );
        assert.equal(descModels.length, 2);
        assert.deepEqual(
          descModels.map((x) => String(x.id)),
          [a1Id, arg1Id]
        );
      });
      it("see neighbourhood", async function () {
        let descModels = await axiosUtil.call(
          "node_neighbourhood",
          {
            node_id: q1Id,
            guild: publicGuildId,
          },
          quidamToken
        );
        assert.equal(descModels.length, 3);
        descModels = await axiosUtil.call(
          "node_neighbourhood",
          {
            node_id: q1Id,
            guild: null,
          },
          sponsorToken
        );
        assert.equal(descModels.length, 1);
      });
      it("find subtree does not trump security", async function () {
        const descModels = await axiosUtil.call(
          "node_subtree",
          { node_id: a1Id },
          leaderToken
        );
        assert.equal(descModels.length, 1);
        assert.deepEqual(
          descModels.map((x) => String(x.id)),
          [a1Id]
        );
      });
      it("quidam cannot unroot node", async function () {
        await assert.rejects(async () => {
          await axiosUtil.update(
            "conversation_node",
            { id: a1Id },
            {
              parent_id: null,
            },
            quidamToken
          );
        }, /Root node type must be /);
      });
      it("quidam cannot propose child if parent is not proposed", async function () {
        const arg1Models = await axiosUtil.update(
          "conversation_node",
          { id: arg1Id },
          {
            status: "proposed",
          },
          quidamToken
        );
        assert.equal(arg1Models.length, 1);
        assert.equal(arg1Models[0].status, "guild_draft");
      });
      it("quidam cannot submit node", async function () {
        const arg1Models = await axiosUtil.update(
          "conversation_node",
          { id: a1Id },
          {
            status: "submitted",
          },
          quidamToken
        );
        assert.equal(arg1Models.length, 1);
        assert.equal(arg1Models[0].status, "guild_draft");
      });
      it("quidam cannot update draft node to proposed as researcher", async function () {
        const arg1Models = await axiosUtil.update(
          "conversation_node",
          { id: a1Id },
          {
            description: "details about the answer",
            status: "proposed",
          },
          quidamToken
        );
        assert.equal(arg1Models[0].status, "guild_draft");
      });
      it("guild leader can assign philosopher role to quidam", async function () {
        const r = await axiosUtil.create(
          "guild_member_available_role",
          {
            member_id: memberIds[quidamInfo.handle!],
            guild_id: publicGuildId,
            role_id: philosopherRoleId,
          } as Partial<GuildMemberAvailableRole>,
          leaderToken
        );
        assert.ok(r);
      });
      it("quidam can self-cast", async function () {
        const r = await axiosUtil.create(
          "casting_role",
          {
            member_id: memberIds[quidamInfo.handle!],
            guild_id: publicGuildId,
            quest_id: publicQuestId,
            role_id: philosopherRoleId,
          } as Partial<CastingRole>,
          quidamToken
        );
        assert.ok(r);
      });
      it("quidam can update draft node to proposed as philosopher", async function () {
        const arg1Models = await axiosUtil.update(
          "conversation_node",
          { id: a1Id },
          {
            description: "details about the answer",
            status: "proposed",
          },
          quidamToken
        );
        assert.equal(arg1Models[0].status, "proposed");
      });
      it("leader can submit node", async function () {
        const arg1Models = await axiosUtil.update(
          "conversation_node",
          { id: a1Id },
          {
            status: "submitted",
          },
          leaderToken
        );
        assert.equal(arg1Models.length, 1);
        // guild is implicitly in immediate mode
        assert.equal(arg1Models[0].status, "published");
        assert.ok(arg1Models[0].published_at);
      });
      it("cannot create a node with parent from a different quest", async function () {
        // create a node in quest2
        Object.assign(
          nodeIds,
          await my_add_node(
            {
              id: "q2",
              node_type: "question",
              status: "published",
              title: "second question",
              creator_id: sponsorInfo.handle,
            },
            publicQuest2Id
          )
        );
        // now add a node in quest1 with the q2 node as parent
        await assert.rejects(async () => {
          await my_add_node({
            id: "q30",
            parent_id: "q2",
            node_type: "question",
            status: "published",
            title: "another question",
            creator_id: quidamInfo.handle,
          });
        }, /Parent node does not belong to the same quest/);
      });
      it("can add a meta-node to the focus node", async function () {
        // set the focus node to first answer
        await axiosUtil.update(
          "game_play",
          game_play_id,
          { focus_node_id: a1Id },
          leaderToken
        );
        // create a meta node
        Object.assign(
          nodeIds,
          await my_add_node({
            id: "q29",
            parent_id: answer1Info.id,
            node_type: "question",
            meta: "meta",
            status: "guild_draft",
            title: "third question",
            creator_id: quidamInfo.handle,
          })
        );
      });
      it("can add a meta-node to a descendant of the focus node", async function () {
        Object.assign(
          nodeIds,
          await my_add_node({
            id: "q3111",
            parent_id: argument1Info.id,
            node_type: "question",
            meta: "meta",
            status: "guild_draft",
            title: "yet still another question",
            creator_id: quidamInfo.handle,
          })
        );
      });
      it("can add a meta-node to an existing meta-node", async function () {
        Object.assign(
          nodeIds,
          await my_add_node({
            id: "q3112",
            parent_id: "q3111",
            node_type: "question",
            meta: "meta",
            status: "guild_draft",
            title: "yet still another question",
            creator_id: quidamInfo.handle,
          })
        );
      });
      it.skip("cannot add a meta-node outside of the focus node descendants", async function () {
        await assert.rejects(async () => {
          await my_add_node({
            id: "q2921",
            parent_id: "q2",
            node_type: "question",
            meta: "meta",
            status: "guild_draft",
            title: "yet still another question",
            creator_id: quidamInfo.handle,
          });
        }, /Parent node out of focus/);
        // not implemented yet
      });
      // TODO Question: can I add a meta-node to a meta-node outside of the focus descendants?
      it("can add a channel in the game_play", async function () {
        Object.assign(
          nodeIds,
          await my_add_node({
            id: "q898",
            node_type: "channel",
            status: "guild_draft",
            meta: "channel",
            title: "My Channel",
            creator_id: leaderInfo.handle,
          })
        );
      });
      ///// Test I can add a channel in the game_play
      // root channel node_type = channel, meta = channel
      //   after that, ibis types
      it("can add a channel outside the game_play", async function () {
        Object.assign(
          nodeIds,
          await my_add_node(
            {
              id: "q899",
              node_type: "channel",
              status: "guild_draft",
              // meta: 'channel', can remain implicit because implied by node_type
              title: "My Channel",
              guild_id: publicGuildId, // explicit, not given by game_play
              creator_id: leaderInfo.handle,
            },
            null
          )
        );
      });
      it("cannot add a non-root channel", async function () {
        await assert.rejects(async () => {
          await my_add_node({
            id: "q8991",
            node_type: "channel",
            status: "guild_draft",
            parent_id: "q899",
            meta: "channel",
            title: "My Channel",
            creator_id: leaderInfo.handle,
          });
        }, /Channels must be at root/);
      });
      it("can add a meta-node to either channel", async function () {
        Object.assign(
          nodeIds,
          await my_add_node({
            id: "q31123",
            parent_id: "q899",
            node_type: "question",
            meta: "meta",
            status: "guild_draft",
            title: "yet still another question",
            creator_id: quidamInfo.handle,
          })
        );
      });
      it("cannot add a quest-less non-meta node", async function () {
        await assert.rejects(async () => {
          await my_add_node(
            {
              id: "q343434",
              node_type: "question",
              status: "guild_draft",
              title: "great question",
              creator_id: leaderInfo.handle,
            },
            null
          );
        }, /Quest Id must be defined/);
      });
      it("cannot add a node in channel state outside of a channel", async function () {
        Object.assign(
          nodeIds,
          await my_add_node({
            id: "q3434348",
            node_type: "question",
            status: "guild_draft",
            meta: "channel",
            title: "great question",
            creator_id: leaderInfo.handle,
          })
        );
        const node = await axiosUtil.get(
          "conversation_node",
          { id: nodeIds.q3434348 },
          leaderToken
        );
        assert(node.length === 1);
        assert(node[0].meta === "conversation");
      });
      it("cannot add a node in non-channel state inside a channel", async function () {
        Object.assign(
          nodeIds,
          await my_add_node({
            id: "q3434349",
            parent_id: "q898",
            node_type: "question",
            status: "guild_draft",
            title: "great question",
            creator_id: leaderInfo.handle,
          })
        );
        const node = await axiosUtil.get(
          "conversation_node",
          { id: nodeIds.q3434349 },
          leaderToken
        );
        assert(node.length === 1);
        assert(node[0].meta === "channel");
      });
      it("can add a guild draft meta-node to a guild channel", async function () {
        Object.assign(
          nodeIds,
          await my_add_node({
            id: "q8992",
            parent_id: "q899",
            node_type: "question",
            meta: "meta",
            status: "role_draft",
            draft_for_role_id: philosopherRoleId,
            title: "yet still another question",
            creator_id: quidamInfo.handle,
          })
        );
      });
      it("role member can see that meta-node", async function () {
        const node_model = await axiosUtil.get(
          "conversation_node",
          { id: nodeIds.q8992 },
          leaderToken
        );
        assert.equal(node_model.length, 1);
      });
      it("can retrieve conversation tree", async function () {
        const result = await axiosUtil.call(
          "nodes2json",
          { node_id: nodeIds.q1 },
          adminToken,
          true
        );
        // console.log(result);
        assert.equal(num_nodes_in_json(result), 2);
        tree_info = await axiosUtil.call(
          "nodes2json",
          {
            node_id: nodeIds.q1,
            include_level: "private_draft",
            include_meta: true,
          },
          adminToken,
          true
        );
        console.log(JSON.stringify(tree_info));
        remove_ids(tree_info);
        assert.notEqual(
          num_nodes_in_json(tree_info),
          num_nodes_in_json(result)
        );
      });
      it("can reconstruct the conversation tree", async function () {
        await axiosUtil.delete(
          "conversation_node",
          { quest_id: publicQuestId },
          adminToken
        );
        await axiosUtil.call("populate_nodes", { data: tree_info }, adminToken);
        const root = await axiosUtil.get(
          "conversation_node",
          { parent_id: "is.null", quest_id: publicQuestId },
          adminToken
        );
        const result = await axiosUtil.call(
          "nodes2json",
          {
            node_id: root[0].id,
            include_level: "private_draft",
            include_meta: true,
          },
          adminToken,
          true
        );
        remove_ids(result);
        assert.equal(num_nodes_in_json(tree_info), num_nodes_in_json(result));
        assert.deepEqual(tree_info, result);
      });
    });
  });
});
