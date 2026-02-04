# Channel Roles Implementation Plan

## Overview
Channel roles allow players in a guild playing the same quest to have conversations about the quest within their role. The conversation links are displayed in the right drawer under the selected quest from the guild page, and conversations occur in the channel page.

## Current System
- **Channels**: Conversation nodes with `meta='channel'` stored in the `conversation_node` table
- **Channel Roles**: Links between channels, roles, quests, and guilds in the `channel_roles` table
- **Right Drawer**: Shows guild channels and game channels (when quest selected)
- **Quest Joining**: When players join quests, `casting_role` records are created

## Requirements

### Channel Roles Creation
1. When a player selects a quest in guild page (radio button), check if `channel_role` exists for each of their roles in that quest
2. If not, create the channel (conversation_node) if it doesn't exist, then create the `channel_role`
3. Load all channel roles for the guild when visiting the guild page
4. Display role channels in right drawer only when player has a current quest selected

### Game Leader Role Display
5. When a game leader selects a quest, show all roles being played in that quest for that guild in the right drawer

## Implementation Plan

### 1. Channel Role Creation on Quest Selection
- **Trigger**: When `questStore.setCurrentQuest(quest_id)` is called (from active-quests radio button)
- **Logic**: For each of the player's casting_roles in the quest, ensure channel_role exists
- **New Function**: `ensureChannelRolesForQuestSelection(member_id, quest_id, guild_id)`
  - Get all casting_roles for member/quest
  - For each role, check/create channel → check/create channel_role

### 2. Game Leader Role Display
- **Condition**: Member has "Game leader" role for current quest/guild
- **Display**: Add "Quest Roles" section in right drawer showing all unique roles from casting_roles
- **New Getters**:
  - `getAllRolesInQuestForGuild(quest_id, guild_id)` - Aggregate unique roles
  - `isGameLeaderForQuestInGuild(member_id, quest_id, guild_id)` - Check game leader status

### 3. Update Channel Store (`sc-client/src/stores/channel.ts`)
- Ensure `createChannelNode` properly creates role-based channels with:
  - `meta='channel'`
  - `quest_id`, `guild_id`
  - Title based on role name
  - Appropriate permissions

### 4. Fix ChannelRole Store (`sc-client/src/stores/channelRole.ts`)
- Correct `fetchChannelRoles` API call:
  - Change URL from `/channel` to `/channel_roles`
  - Fix params: `guild_id: 'eq.${params.guild_id}'`
- Add `createChannelRole` method

### 5. Update Right Drawer Display (`sc-client/src/components/right-drawer.vue`)
- Add "Quest Roles" section for game leaders when quest is selected
- Ensure game channels only show when current quest is selected
- Verify member permission checks

## Database Schema
- **channel_roles table**:
  - `id`: Primary key
  - `node_id`: References conversation_node.id (the channel)
  - `role_id`: References role.id
  - `quest_id`: References quests.id
  - `guild_id`: References guilds.id
  - `member_id`: Optional member reference

## Key Considerations
- **Channel Creation**: Channels should be created per role per quest per guild
- **Channel Titles**: Use role name as channel title for clarity
- **Permissions**: Channel access controlled by role membership via channel_roles
- **Display Logic**: Role channels only visible when quest is current

## Files to Modify
- `sc-client/src/stores/quests.ts`
- `sc-client/src/stores/channel.ts`
- `sc-client/src/stores/channelRole.ts`
- `sc-client/src/components/right-drawer.vue`

## Open Questions
- Should channels be shared across members with same role, or individual?
- Should `member_id` be populated in `channel_roles`?
- Any special handling for channel permissions beyond role membership?