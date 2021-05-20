# Routes

## General

### home

### register

### signin

### quest

quest index

### guild

guild index


## Guild

### guild/:guild_id/apply_for_membership
v2: for now, just join if the guild has open membership

### guild/:guild_id/member
### guild/:guild_id/member/me
### guild/:guild_id/member/:user_id
a user's status page in the guild. (Me for my own page)
Displays past quests with badges, active quests with roles.
v2: If the user is not in the guild yet, allows the leadership to invite or accept a request for membership.

### guild/:guild_id/
### guild/:guild_id/quest/:quest_id/prepare_roster

Here the guild leadership and members agree on the roster for that quest before registering to that quest. The register button is probably going to be on that page.

### guild/:guild_id/quest/:quest_id/roster

The reference page of the roster (immutable?) after you've submitted registration.

### guild/:guild_id/quest/:quest_id/  (game_conversation)

Default view: Start from the node-at-play in the current turn, show all children (whether part of the quest or our current proposals)

### guild/:guild_id/quest/:quest_id/tree

Show the whole quest tree from the root (and our proposals also)

### guild/:guild_id/quest/:quest_id/node/:node_id
### guild/:guild_id/quest/:quest_id/node/:node_id/edit

Edit an unpublished node

### guild/:guild_id/quest/:quest_id/node/:node_id/create_child

This is where you edit a new node (was called mmowglieditor.)
You can get there from either a node-centric view, or a tree view with one node selected.

### guild/:guild_id/quest/:quest_id/node/:node_id/conversation
### guild/:guild_id/quest/:quest_id/conversation

### guild/:guild_id/room
### guild/:guild_id/room/:room_id

Each guild has multiple chat rooms (ideally structured conversation, we may reuse a chat system to gain time.)
Among those chat rooms:
leadership (leaders only)
:rolename-based (per-role chat room)
meta (conversation about which quest to do next etc.)
:quest-based (conversation around a quest, has a separate route above)
:node-based (conversation around a node, has a separate route above)

### guild/:guild_id/room/leadership

## Quest

### quest/:quest_id/

the landing page of the quest.
Also show the involved guilds.

### quest/:quest_id/edit

Edit the quest data

### quest/:quest_id/tree

Show the quest's tree

### quest/:quest_id/node/:node_id

Single-node view in the quest
