# Player-Driven Node Status Raise in Quest Play

## Context

In `QuestPlayPage`, each conversation node's status was originally a read-only `<span>` in the tree row, and the only way to change it was through `node-form.vue`'s edit mode — which requires being the creator (or holding `editConversationNode`). The desired workflow: a player with a higher-tier role (e.g. philosopher, max `proposed`) should be able to elevate a node that a lower-tier role (e.g. researcher, max `guild_draft`) authored, so long as they're a guild member playing in that quest.

This feature ships an inline status raise on every tree row and in the right-hand selected-node card, plus a server-side trigger relaxation so non-creators can actually persist a status-only raise. Several follow-up fixes were added once real-world testing exposed reactivity gaps, a router-induced scroll-to-top, a stale `QTreeNode` snapshot, and a parent-status ceiling that the client wasn't honouring.

## Final architecture

### New: `sc-client/src/components/node-status-selector.vue`

A small chip + menu component used in two places (tree row & selected-node card).

- **Live data lookup**: reads the node reactively from the store via `conversationStore.getConversationNodeById(props.node.id)` so the chip re-renders the moment `addToState` writes a new status. Falls back to the `props.node` snapshot until the store warms up.
- **Cap computation**: `effectiveMax = min(roleCap, parentStatus)`.
  - `roleCap` comes from `useQuestStore().getMaxPubStateForNodeType(...)`.
  - `parentStatus` is read live via `conversationStore.getConversationNodeById(currentNode.parent_id)` — needed because the server's `check_node_status_rules` enforces `status := least(status, parent_status)`. If the chip didn't apply this, picks would silently clamp.
- **Raise-only options**: `publication_state_list.slice(currentIdx + 1, maxIdx + 1)`, filtered to drop `submitted`/`published` for `meta` nodes (preserves existing rule).
- **No `q-select`/v-model plumbing**: the component renders the current status as a `<q-chip>` with a small dropdown caret; clicking opens a `<q-menu>` of `<q-item>`s, each with a direct `@click.stop="save(opt)"` handler. The same pattern that the existing `<q-btn icon="add" @click.stop="addChildToNode(node.id)">` uses in the q-tree slot — proven to fire reliably.
- **`canRaise` gate**: only renders the chip if the player is playing the quest in this guild *and* `raiseOptions` is non-empty. Otherwise renders the plain `<span>` (so the user can't pick something the server would reject).
- **Notify on save**:
  - **Success** (`stored === requested`) → positive "Status set to ..." toast.
  - **Server clamp** (`stored !== requested`) → warning "Server kept status at ... — raise the parent node first" toast (6s). Belt-and-braces: the parent-status cap in `effectiveMax` should normally prevent the user from picking a clampable value, but if any other server-side rule kicks in the user will see why.
  - **Error** → negative toast with `err.response.data.message || err.message`.

### Edit: `sc-client/src/stores/conversation.ts`

Added `updateNodeStatus(id, status)` action next to `updateConversationNode`:

- PATCHes `/conversation_node?id=eq.{id}` with `{ status }` only.
- If the response carries the row (PostgREST `Prefer: return=representation`, set by the axios interceptor at `boot/axios.ts:60-76`), `addToState(returned)` does the full merge (handles `neighbourhood` and `conversationRoot` linkage).
- If the response is empty (204 or stripped header), the action still updates the local state with `{ ...existing, status }` so the UI doesn't lag the DB.

Kept separate from `updateConversationNode` to keep intent explicit and bypass the `conversationNodePatchKeys` filter for the status-only path.

### Edit: `sc-client/src/components/node-tree.vue`

- Replaced the read-only `<span class="node-status">{{ node.status }}</span>` in the q-tree default-header slot with `<node-status-selector :node="node" />`. Imported the component near the existing imports.
- Added a watcher on the conversation store so the q-tree label/colour reflects status updates without a refresh:
  ```ts
  watch(
    () => conversationStore.conversation,
    () => {
      nodesTree.value = getNodesTree() ?? [];
    },
  );
  ```
  Needed because `nodesTree` is a snapshot built by `makeTree()` (`stores/conversation.ts:511-555`), not reactive to subsequent store updates. Shallow watch is enough — `addToState` reassigns the top-level `conversation` object reference, so it fires once per save without `deep: true`.

### Edit: `sc-client/src/pages/QuestPlayPage.vue`

- Added the same selector inside the selected-node card (after the Node ID row), using `:dense="false"` for a slightly larger control.
- Removed the manual `scrollIntoView({ block: 'start' })` call that was in the `selectedNodeId` watcher. The selected card is already `position: sticky; top: 20px` (`QuestPlayPage.vue:548-557`), so calling scrollIntoView on it was yanking the whole window to align the sticky card at the top — losing sight of the clicked node. The watcher now just clears edit/add state.

### Edit: `sc-client/src/router/index.ts` + `sc-client/src/router/routes.ts`

The router used to scroll to top on every navigation:
```ts
scrollBehavior: () => ({ left: 0, top: 0 })
```
That fired even on the `router.push(...)` that `quest-node-tree.vue:27-35` triggers when a node is selected (to keep URLs bookmarkable). Replaced with:

```ts
scrollBehavior: (to, from, savedPosition) => {
  if (savedPosition) return savedPosition;
  if (to.meta.samePage && to.meta.samePage === from.meta.samePage) {
    return false;
  }
  return { left: 0, top: 0 };
},
```

Both `quest_page` and `quest_page_node` routes now carry `meta: { samePage: 'quest_play' }`, so node selection no longer scrolls the page and the back button still restores prior scroll positions.

### Edit: `server/deploy/conversation_node_functions.sql`

Relaxed the `before_update_node` BEFORE-UPDATE trigger so non-creators can perform a status-only raise when playing the quest in the node's guild:

```sql
IF NEW.creator_id != current_member_id()
   AND NOT has_node_permission(NEW.quest_id, NEW.node_type, 'editConversationNode')
THEN
  -- Allow a status-only raise by a player in the node's guild for this quest.
  -- check_node_status_rules() runs after and clamps NEW.status to the caller's role max
  -- AND to the parent's status (so a child cannot outrank its parent).
  IF NEW.status > OLD.status
     AND NEW.title IS NOT DISTINCT FROM OLD.title
     AND NEW.description IS NOT DISTINCT FROM OLD.description
     AND NEW.url IS NOT DISTINCT FROM OLD.url
     AND NEW.node_type IS NOT DISTINCT FROM OLD.node_type
     AND NEW.meta IS NOT DISTINCT FROM OLD.meta
     AND NEW.parent_id IS NOT DISTINCT FROM OLD.parent_id
     AND NEW.draft_for_role_id IS NOT DISTINCT FROM OLD.draft_for_role_id
     AND NEW.guild_id IS NOT NULL
     AND NEW.guild_id = public.is_playing_quest_in_guild(NEW.quest_id) THEN
    NULL; -- permitted; fall through
  ELSE
    RAISE EXCEPTION 'permission editConversationNode / Cannot change node of other member';
  END IF;
END IF;
```

The `publication_state` postgres enum supports `>` ordering by declaration order, matching the client's `publication_state_list`. The existing `check_node_status_rules()` (`server/deploy/conversation_node_functions.sql:227-282`) still runs and clamps to the caller's role max and the parent's status — defence-in-depth.

## Files modified

- `sc-client/src/components/node-status-selector.vue` *(new)*
- `sc-client/src/components/node-tree.vue` *(replace status span; add conversation-watcher rebuild)*
- `sc-client/src/pages/QuestPlayPage.vue` *(selector in selected-node card; remove jump-to-top scroll)*
- `sc-client/src/stores/conversation.ts` *(`updateNodeStatus` action with optimistic merge fallback)*
- `sc-client/src/router/index.ts` *(samePage-aware `scrollBehavior`)*
- `sc-client/src/router/routes.ts` *(`meta: { samePage: 'quest_play' }` on both quest-play routes)*
- `server/deploy/conversation_node_functions.sql` *(relax `before_update_node` for status-only raises)*

## Reused

- `useQuestStore().getMaxPubStateForNodeType()` — `sc-client/src/stores/quests.ts:256-290`
- `conversationStore.getConversationNodeById()` — `sc-client/src/stores/conversation.ts:104-107`
- `conversationStore.addToState()` — `sc-client/src/stores/conversation.ts:310-325`
- `publication_state_list` / `publication_state_enum` — `sc-client/src/enums.ts:86-99`
- `memberStore.castingPerQuest` — `sc-client/src/stores/member.ts:53-56`
- `is_playing_quest_in_guild()` — `server/deploy/casting_functions.sql:18-23`
- Existing CSS classes `node-status-{state}` — `sc-client/src/components/node-tree.vue:1062-1090`
- Existing axios `Prefer: return=representation` interceptor — `sc-client/src/boot/axios.ts:60-76`

## Behaviour rules summary

| Scenario | Result |
|---|---|
| Player not playing in node's guild for this quest | Plain `<span>` only; no chip. |
| Player at or above role cap for this node | Plain `<span>`; nothing to raise to. |
| Parent node's status is the ceiling and child is already at it | Plain `<span>`; raise the parent first. |
| Meta node | Chip never offers `submitted` or `published`. |
| Player picks current status | No PATCH (guard in `save`). |
| Player picks a higher status within cap and parent | PATCH succeeds; chip + tree row both update reactively. |
| Non-creator updates a non-status field | Server still rejects with `permission editConversationNode / Cannot change node of other member`. |
| Edit form (existing path via `node-form.vue` + Update button) | Untouched; still works. |

## Verification

1. **Setup:** log in as a member playing a quest in a guild as a **researcher** (max `guild_draft`, with `reference → proposed` constraint). Create a reference node and save it as `guild_draft`. Tree shows the colour-coded status.
2. **Researcher-as-viewer:** the chip shows no raise options on `answer` nodes (researcher capped at `guild_draft` there), so the status renders as a plain `<span>`.
3. **Researcher on a reference, parent at `proposed`:** chip menu shows `proposed`. Pick it; expect `PATCH /conversation_node?id=eq.X` with body `{"status":"proposed"}`, 200 response, positive "Status set to proposed" toast, chip + tree row both update.
4. **Researcher on a reference, parent at `guild_draft`:** chip does NOT appear (effective max = `min(proposed, guild_draft) = guild_draft`). Raise the parent first, then the chip on the child reappears.
5. **Philosopher raise (non-creator):** log in as a **philosopher** (max `proposed`) playing the same quest+guild. On a researcher-authored `guild_draft` node whose parent allows it, the chip menu shows `proposed`. Pick it; PATCH succeeds via the relaxed trigger; UI updates.
6. **Selected-node card:** select a node; the same chip appears in the right-hand card.
7. **Non-player:** log in as a member NOT cast in this quest+guild. The chip never renders; status is plain text.
8. **Already-maxed:** on a `published` node, no role can raise further — no chip.
9. **Page does NOT scroll to top** when clicking nodes in the tree (router same-page rule).
10. **Selecting a node** keeps the right-hand selected-node card visible alongside the tree (sticky positioning preserved).
11. **Direct PATCH with non-status fields as non-creator** still fails with the original `permission editConversationNode / Cannot change node of other member` exception — the relaxation is status-only.
12. **Comment (meta) nodes** never offer `submitted` or `published`.
13. **Edit form regression:** open the Edit button, change Status in `node-form.vue`'s q-select, click Update — still works through `updateConversationNode`; the new conversation watcher also updates the tree row colour without a refresh.
14. **Vitest suite:** `cd sc-client && npx vitest run`. The pre-existing `guildStore.spec.ts` failures around `deleteGuildMemberAvailableRole` are not caused by these changes (confirmed on a clean stash); the `NodeFormComponent.spec.ts` tests still pass.

## Debugging history (lessons learned)

- The `q-select` + computed v-model pattern inside the q-tree `default-header` slot proved unreliable — `update:model-value` was being lost. The chip + `q-menu` + per-item `@click.stop="save(opt)"` pattern, matching the existing `addChildToNode` button in the same slot, was rock solid.
- `props.node` in the tree slot is a `QTreeNode` snapshot, not reactive. The selector must look the node up live from `conversationStore.getConversationNodeById(props.node.id)` to re-render on store updates.
- The q-tree's `nodesTree` ref also doesn't auto-rebuild on store updates; the explicit `watch(() => conversationStore.conversation, ...)` is what keeps the tree row's label colour in sync with the chip.
- The server's `check_node_status_rules` clamps status by both **role cap** *and* **parent status**. Forgetting the parent rule led to a user picking `proposed` on a child whose parent was still `guild_draft` — the chip offered the option, the PATCH "succeeded" with HTTP 200, but the row came back unchanged. The client cap now mirrors both server rules.
- The original `scrollBehavior: () => ({ left: 0, top: 0 })` was firing on every `router.push` triggered by node selection. `meta.samePage` + the savedPosition check fixed that without affecting cross-page navigation.
