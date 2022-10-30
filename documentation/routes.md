# Routes

## General

### home `/`

The landing page; explains the concept, shows some lists:

* top guilds
* current quests
* recent quests
* near-future quests

If authenticated:

* top users
* my guilds
* my quests
* guilds I could join

### Admin-app `/admin/:member_id`

Administration page. Sets global permissions

* creatQuest
* CreateGuild

### register `/register`

Create a new user.

### signin `/signin`

Login to the system with a email/password combination.
TODO: Allow username?
TODO: provide an option to request a password reset.

### confirm `/confirm`

TODO: use the provided token to confirm the account, route to home and tell the user that their account is confirmed

### reset_pass `/reset_pass`

TODO: use the token to login the user, and provide a password reset form that does not require the old password.
If no token/a bad token was provided, put people back on login page, where they can request a password reset.
Open question: Do we request the old password otherwise? Do we want to distinguish the cases?

## Quest App pages

### quest_page `/quest/:quest_id`

the landing page of the quest.
Also show the involved guilds.

### create_quest `/quest/create`

Quest creation page (where quest_id will be determined)

### quest_edit `/quest/:quest_id/edit`

Edit the quest data.
(Start date of each phase; name and description)
Possibly here: mechanism for final scores.

### quest_tree `/quest/:quest_id/tree`

Show the quest's node tree, each node leads to quest_node_view.

### quest_node_view `/quest/:quest_id/node/:node_id`

Single-node view in the quest. Similar to node_view.
Also: mechanisms for scoring.

### quest_list `/quest`

List of public quests on the platform.
Q: Should this be in quest app?
Include private quests you are part of if logged in.
If you have appropriate permissions, also a form to create a quest. (separate page?)

### quest_roster `/guild/:guild_id/quest/:quest_id/roster`

The reference page of the roster (immutable?) after you've submitted registration.

### quest_conversation `/guild/:guild_id/quest/:quest_id/tree`

Show the whole quest tree from the root (and our proposals also)

## Guild App pages

### guild_create `/guild/create`

Create a new guild. Give it a name and a guild_id. You're automatically guild leader.
Requires the create_guild permission.

### guild_page `/guild/:guild_id`

Guild landing page, presenting the guild:

* Leadership
* Members
* Current quests (Highlight those you're part of, and your role therein)
* Past quests
* Past awards (points & badges)

If the guild is open, and you're logged in, "join" button. (Autojoin in v1)
v2: open for someone with minimal badges? Or does that make starting too difficult?

### guild_application `/guild/:guild_id/apply_for_membership`

v2 maybe: for now, just join if the guild has open membership

### guild_member_list `/guild/:guild_id/member`

The list of all members in the guild, including past members

### guild_member_page `/guild/:guild_id/member/:member_id`

The record of that member's activity in this guild.

* Past quests and role played (and scores and badges awarded)
* Current quests and role played
* a button to toggle your membership
* a button to show and toggle your leadership role

v2: If the member is not in the guild yet, allows the leadership to invite or accept a request for membership.

### guild_list `/guild`

List of public guilds on the platform
Q: Should this be in guild app?
Include private guilds you are part of if logged in.
If you have appropriate permissions, also a form to create a guild. (separate page?)

## Members page

### member_list `/member`

The list of KHub members. Only visible if authenticated.

### member_page `/member/:member_id`

The page of the KHub member

* All the guilds they belong(ed) to, leading to the guild_member_page
* All the quests they participated in, with awards (scores and badges). Link to quest_member_page

### quest_member_page `/guild/:guild_id/member/:member_id/quest/:quest_id`

All the moves of that member in that quest, and scores/badges awards for those moves. (Link to node_view)
Global score for the quest

### guild_quest_page `/guild/:guild_id/quest/`

* List of quests that the guild has played
* List of quests that the guild is playing
* List of quests that the guild could play (in registration phase)

v2: how is a guild aware of open quests on other servers? (gossip?)
Link to meta-quest chat channel

### game_conversation `/guild/:guild_id/quest/:quest_id/`

If we're not part of this quest:
  registration button. (leads to prepare roster form, or same page?)
  link to meta-quest chat channel
If we're registered, but quest has not started: Start date
If the quest is active:
  Structured conversation: Start from the node-at-play in the current turn, show all children (whether part of the quest or our current proposals)
    Each node is clickable and will lead to node_view; another button will lead to node_create
  Link to quest chat channel
  Link to quest_conversation
If the quest is finished: scores

### prepare_roster `/guild/:guild_id/quest/:quest_id/prepare_roster`

Here the guild leadership and members agree on the roster for that quest before registering to that quest. The register button is probably going to be on that page.
Note: May be on game_conversation page.


### node_view `/guild/:guild_id/quest/:quest_id/node/:node_id`

Show one specific node of the quest tree. Mostly used for nodes considered for play in this turn.
Show the node description, show author, link to parent and children nodes, link to game_conversation
Link to (or embed?) node chat channel.

### node_edit `/guild/:guild_id/quest/:quest_id/node/:node_id/edit`

Edit an unpublished node
Q: do we allow editing someone else's node? Should edits take the form of proposals (and how do we integrate them?)
Meta-conversation flux TBD
Link to (or embed?) node chat channel.

### node_create `/guild/:guild_id/quest/:quest_id/node/:node_id/create_child`

This is where you edit a new node (was called mmowglieditor.) The node will be a child of the node_id given.
You can get there from either a node-centric view, or a tree view with one node selected.

### guild_channel_list `/guild/:guild_id/channel`

Each guild has multiple permanent chat channels (ideally structured conversation, we may reuse a chat system to gain time.)
The list of chat channels (or structured conversations if we get there that I can participate in), links to below.
Among those chat channels:
leadership (leaders only)
:rolename-based (per-role chat channel)
meta (conversation about which quest to do next etc.)

Question1: channels are known as channels in the code. We should probably reflect that in URLs?
Question2: Do we want to have a page with all permanent and all gameplay specific channels, or keep them separate?

### game_channel_list `/guild/:guild_id/quest/:quest_id/channel/`

A list of game-play specific conversation channels
:rolename-based (per-role chat channel)
:node-based (conversation around a node, has a separate route above)

### guild_channel_conversation `/guild/:guild_id/channel/:channel_id`
### game_channel_conversation `/guild/:guild_id/quest/:quest_id/channel/:channel_id`

The conversation of a guild channel (permanent or game-specific)
