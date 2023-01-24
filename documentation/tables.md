# Enums

## quest_status

* draft
* registration
* ongoing
* scoring
* finished

## permissions

* superadmin
* viewGuild
* viewQuest
* createQuest
* createGuild
<!-- Guild permissions -->
* acceptGuildMembership
* revokeGuildMembership
* publishGameMove  <!-- replace with another mechanism -->
* retractGameMove <!-- within term time -->
<!-- Quest permissions -->
* acceptQuestMembership
* revokeQuestMembership
* rejectGameMove

Todo:

* addConvInFocus: create or move a conversation node within the focus neighbourhood
* addConvAnywhere: create or move a conversation node anywhere
* editConversationNode: (someone else's)
* mustQuote: needs to create nodes of quote subtype
* addMetaInFocus: can add meta nodes to focus
* addMetaAnywhere: can add meta nodes elsewhere in conversation
* createPlayChannel: can create a channel in the context of a game
* createGuildChannel: can create a guild-wide channel
* setPlayerRole: can change the casting role of another player
* addAvailableRole: can give an available role to a player
* changeFocus: change the focus of the gameplay
* moveDraftConv: Move someone else's draft conversation node
* intercalateConv: Move someone else's draft conversation node under my draft sibling
* createGuildRole
* createSystemRole

Under consideration or v2

* awardCreditForMove could have issues with favoritism
* mutateMetaToConv
* moveChannelBranchToConv

## TODO: scoring_criterion

Represents a criterion which will be used to score a game move (mostly introducing conversation nodes). A given game mode can be scored along multiple axes (or criteria.)

Will eventually be objects with computations (ScoringStrategies), but we need to start with an enum representing the axis of what is scored.

## publication_state

Conversation node publication states

1. obsolete
   * Previous version of a node. Will be elaborated as we record change history. Not normally visible.
2. private_draft
   * Visible only to you
3. guild_draft
   * Visible to your whole guild. Still WIP, open to collective editing.
4. proposed
   * The creator (or another guild member) thinks it's good enough to submit to the guild leaders for consideration
5. submitted
   * The guild leader is sending it to the quest.
6. published
   * The quest has accepted the node and it's visible to all

## confirmation_status

Used when a link between a member and a group (guild or quest) needs to be confirmed on both sides.

* requested  (by the member)
* invitation (by the group)
* confirmed (by both)

## ibis_node_type

* Question
* Answer
* Pro
* Con
* Reference
* Channel

## meta_state

* conversation
  * A node in the quest conversation
* meta
  * A meta node about the quest conversation, attached to it
* channel
  * A node in a conversation channel, detached from the quest conversation

## TODO: badge_type

An enum of badges. TBD.

## TODO: game_move_type

* add_node

Eventually refactorings, etc.

# Tables

## members

* handle varchar
* slug varchar (unique)
  * Computed from handle
* name varchar
* email varchar (unique)
* password
* permissions Permission[]
* created_at timestamp (now)
* updated_at timestamp (now)
* last_login timestamp
  * When did the member last login (or renew login token)
  * email login tokens will not be accepted after the last_login
* last_login_email_sent
  * When was the last password change request email sent
  * Used to avoid spamming: do not allow very close password change request
* confirmed boolean (false)
  * Whether the email was verified

## guilds

The teams playing the game

* name varchar
* handle varchar
* slug varchar (unique)
  * Computed from handle
* public boolean (true)
* description text
* open_for_applications boolean (true)
  * whether guilds can apply (default: true)
* application_needs_approval boolean (false)
  *  whether guild application approval is manual
* creator fk(members)
* created_at timestamp (now)
* updated_at timestamp (now)
* default_role_id fk(roles)
  * Which is the base allowed role you get when you join the guild

public_guilds: view on guilds, with public=true

## quests

* name varchar
* handle varchar
* slug varchar (unique)
  * Computed from handle
* description text
* public boolean (true)
* status QuestStatus
* start datetime (not null)
  * when should the quest start (1st turn)
* end datetime
  * when should the quest end
* creator fk(members)
* created_at timestamp (now)
* updated_at timestamp (now)

later maybe

* scoring ScoringStrategy
* turns TurnStrategy
* admin User

## public_quests

view on quests, with public=true

## quests_data

view on quests, with aggregate information

* last_node_published_at  timestamp
* node_count  int
* confirmed_guild_count  int
* interested_guild_count  int
* player_count  int
* is_playing  boolean
* my_confirmed_guild_count  int
* my_recruiting_guild_count  int
* is_quest_member  boolean

Note on turn-based: I'll need to note which turn was actually ended.

## role

* name varchar
* guild_id fk(guilds)
  * Null means system role, editable only by sysadmin
* permissions Permission[]
* max_pub_state publication_state
  * This role can give up to this status to conversation nodes (unless specified by a role_node_constraint)
* role_draft_target_role_id fk(role)
  * if that role puts a node in role_draft status, it has to be addressed to that other role

## role_node_constraint

This role can give up to this status to nodes of a given type

* role_id fk(role)
* node_type ibis_node_type
* max_pub_state
* role_draft_target_role_id
  * if that role puts a node of this type in role_draft status, it has to be addressed to that other role

## casting_role

Table that links what role a member is to play in a particular quest

* member_id integer NOT NULL
* quest_id integer NOT NULL
* guild_id integer NOT NULL
* role_id integer NOT NULL

Policies

* Insert - member_id is current member
* Update - member_id is current member
* Delete - member_id is current member
* Select - Anyone

## guild_member_available_role

Table that links the roles that the guild admin gives to a member

* guild_id integer NOT NULL
* member_id integer NOT NULL
* role_id integer NOT NULL

Policies

* Insert - guildAdmin
* Update - guildAdmin
* Delete - guildAdmin
* Select - guild_members

## quest_membership

the member-quest join table. Only for quest creator and moderators.

* quest_id fk(quests)
* member_id fk(members)
* status: confirmation_status
* permissions Permission[]
* created_at timestamp (now)
* updated_at timestamp (now)

my_quest_memberships: view on quest_membership, with member_id=current_user()

## guild_memberhsip

the guild-quest join table. All guild members.

* guild_id fk(guild)
* member_id fk(members)
* status: confirmation_status
* permissions Permission[]
* available_roles Role[]
* created_at timestamp (now)
* updated_at timestamp (now)

my_guild_memberships: view on guild_membership, with member_id=current_user()

## game_play

Join table for guilds that register to play a given quest.

* guild_id fk(guilds)
* quest_id fk(quests)
* status registration_status
* created_at timestamp (now)
* updated_at timestamp (now)
* accepted_at timestamp
* scores jsonb

## casting

The member as playing in a given quest (through a guild.). 3-way join table.

* guild_id fk(guilds)
* quest_id fk(quests)
* member_id fk(members)
* permissions Permission[]
* roles Role[]
* created_at timestamp (now)
* updated_at timestamp (now)

eventually maybe:

* alias varchar: for per-quest avatar alias (which would be used instead of handle. Controversial.)

## conversation_node

A conversation node.

* quest_id fk(quests)
* guild_id fk(guilds)
* creator_id fk(members)
* parent_id fk(conversation_node)
* ancestry ltree
  * Computed from parent_id
* node_type ibis_node_type
* status publication_state
* created_at timestamp (now)
* updated_at timestamp (now)
* published_at timestamp
* title String
* description Text
* meta meta_state
* url varchar
  * Mostly for reference nodes
* draft_for_role_id
  * If the status is role_draft, which role can see it?


Note: Making the temporary choice to go with tree vs graph. May be refactored.
The author is given by the backlinks from the game_moves.
JP and MAP are having a deep conversation about transclusion vs reference: This version of the table handles neither as of yet.

Near future:

* next_actor_role Role
* next_actor Member

Medium future:

* contributors Member[]
* node_action_type
* node_id integer
* state_history <publication_state, timestamp>[]
* previous_version fk(conversation_node)

## server_data

A singleton table with server data. In particular the elements of the nodemailer server information.


* smtp_server varchar
* smtp_port int
* smtp_auth_method varchar
* smtp_secure boolean (true)
* smtp_username
* smtp_password
* server_url
  * The public URL of the sensecraft server, that will be used for confirmation links
* confirm_account_mail_template_title
* confirm_account_mail_template_text
* confirm_account_mail_template_html
  * The templates of the letter that will be sent to new members to confirm their email
* reset_password_mail_template_title
* reset_password_mail_template_text
* reset_password_mail_template_html
  * The templates of the letter that will be sent to new members to reset their password

(The templates will probably have a default in a file, that can be overridden here. It should not be necessary to populate this table.)

# Coming soon (V1)

## game_move_score

Score given to a game_move

* value float
* moves ConversationNode[]
* metric Metric
* badge BadgeType
  * strategy ScoringStrategy
  * quest_signature crypto

Future: have the badge as a separate object, with cryptography

Q: Are badges usually given for a specific move, or for behaviour as a role?

## score_assignment

* from_score fk(game_move_score)
* casting_id fk(casting)
* value float
* badge BadgeType
  * guild_signature crypto

# Future

## quest_badge

Badge given to a player

* avatar_id fk(avatars)
* badge BadgeType
* for_moves game_move_score[]

Eventually: cryptographic signature

## guild_score

Future, when we integrate cryptography.
For now, it's an aggregate on game_move_score

* guild_id fk(participating_guild)
* total float
* moves game_move_score[]
* criterion ScoringCriterion
* signature crypto

visible and submitted are the same for v1

## quest_participation

* name varchar
* status quest_status
* server_id fk(external_server)
* handle varchar
* proposed timestamp
* accepted timestamp

Comments made for participating_guilds about the server_api+handle apply here. May correspond to quest_list, quest_page.

## quest_scores

* quest_id fk(quest_participation)
* total float
* criterion ScoringCriterion

Eventually will have the crypto signature of the guild_score.

## user_badges

* casting_id fk(castings)
* from_quest_id fk(quest_scores)
* criterion ScoringCriterion
* origin varchar

from_quest is implied in casting and could be omitted. The origin would be the public URL of the (eventually signed) quest_badge.

Q: Can there be badges assigned by guild leadership (vs quest)?

## turns

A set of proposed_game_moves

* quest_id fk(quest_participation)
* state publication_state
* created timestamp
* submitted timestamp
* visible timestamp

## proposed_game_moves

* quest_id fk(quest_participation)
* turn_id fk(turns)
* contributors casting[]
* type GameMoveType
* state publication_state
* created timestamp
* proposed timestamp
* submitted timestamp
* visible timestamp

## proposed_conversation_nodes

A conversation node. May have been imported from a quest or proposed locally.

* title varchar
* description text
* parent_id fk(proposed_conversation_nodes)
* ancestry ltree(proposed_conversation_nodes)
* imported_from_quest_id fk()
* guild_identifier varchar
* pub_state publication_state

Note: Making the temporary choice to go with tree vs graph. May be refactored.
The author is given by the backlinks from the game_moves.

## global_guild_scores

Use aggregates on quest_scores for now...

## external_server (v2)

future: there should be a table for known external servers

* name varchar
* server_api URL
* api_version String
