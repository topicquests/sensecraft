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
* publishGameMove
* retractGameMove <!-- within term time -->
<!-- Quest permissions -->
* acceptQuestMembership
* revokeQuestMembership
* rejectGameMove

Todo:

* createConversationNode
* editConversationNode : (someone else's)
* must_quote boolean  : needs to create nodes of quote subtype
* add_to_focus boolean  : can add nodes to focus
* add_meta_to_focus boolean  : can add nodes to focus
* add_meta_to_conversation boolean  : can add nodes to conversation



Under consideration:

* extraCreditForMove could have issues with favoritism
## scoring_criterion

Represents a criterion which will be used to score a game move (mostly introducing conversation nodes). A given game mode can be scored along multiple axes (or criteria.)

Will eventually be objects with computations (ScoringStrategies), but we need to start with an enum representing the axis of what is scored.
TBD

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
* Channel (later)

## badge_type

An enum of badges. TBD.

## game_move_type (v2)

* add_node

Eventually refactorings, etc.

# Tables

## members

* handle varchar (unique)
* name varchar
* email varchar (unique)
* password
* permissions Permission[]

## guilds

* name varchar
* handle varchar (unique)
* public boolean
* open_for_applications boolean : whether guilds can apply (default: true)
* application_needs_approval boolean : whether guild application approval is manual (default: false)
* creator fk(members)
* created_at timestamp
* updated_at timestamp


public_guilds: view on guilds, with public=true

## quests

* name varchar
* handle varchar (unique)
* description text
* public boolean
* status QuestStatus
* start datetime : when should the quest start (1st turn)
* end datetime : when should the quest end
* creator fk(members)
* created_at timestamp
* updated_at timestamp

later maybe

* scoring ScoringStrategy
* turns TurnStrategy
* admin User

public_quests: view on quests, with public=true

## roles

* name varchar
* guild_id fk(guilds) : Null means system role, editable only by sysadmin
* permissions Permission[]
* node_type_constraints ibis_node_type[]
* node_state_constraints publication_state[]
* next_role_constraint integer[] fk(roles) : when adding a role_draft, who can you address it to?

## casting_role

Table that links what role a member is to play in a particular quest

* member_id integer NOT NULL
* quest_id integer NOT NULL
* guild_id integer NOT NULL
* role_id integer NOT NULL

Policies

* Insert - member_in_guild, superadmin
* Update - member_in_guild, superadmin
* Delete - member_in_guild, superadmin
* Select - Anyone

## guild_member_available_role

Table that links the roles that the guild admin gives to a member

* guild_id integer NOT NULL
* member_id integer NOT NULL
* role_id integer NOT NULL

Policies

* Insert - guildAdmin, superadmin
* Update - guildAdmin, superadmin
* Delete - guildAdmin, superadmin
* Select - guild_members

## quest_membership

the member-quest join table. Only for quest creator and moderators.

* quest_id fk(quests)
* member_id fk(members)
* status: confirmation_status
* permissions Permission[]
* created_at timestamp
* updated_at timestamp

my_quest_memberships: view on quest_membership, with member_id=current_user()

## guild_memberhsip

the guild-quest join table. All guild members.

* guild_id fk(guild)
* member_id fk(members)
* status: confirmation_status
* permissions Permission[]
* available_roles Role[]
* created_at timestamp
* updated_at timestamp

my_guild_memberships: view on guild_membership, with member_id=current_user()


## game_play

Join table for guilds that register to play a given quest.

* guild_id fk(guilds)
* quest_id fk(quests)
* status registration_status
* created_at timestamp
* updated_at timestamp
* accepted_at timestamp
* scores jsonb

## casting

The member as playing in a given quest (through a guild.). 3-way join table.

* guild_id fk(guilds)
* quest_id fk(quests)
* member_id fk(members)
* permissions Permission[]
* roles Role[]
* created_at timestamp
* updated_at timestamp


eventually maybe:
* alias varchar
for per-quest avatar alias (which would be used instead of handle. Controversial.)
## conversation_node

A conversation node.

* quest_id fk(quests)
* guild_id fk(guilds)
* creator_id fk(members)
* parent_id fk(conversation_node)
* ancestry ltree
* node_type ibis_node_type
* status publication_state
* created_at timestamp
* published_at timestamp
* title String
* description Text

Note: Making the temporary choice to go with tree vs graph. May be refactored.
The author is given by the backlinks from the game_moves.
JP and MAP are having a deep conversation about transclusion vs reference: This version of the table handles neither as of yet.

Near future:

* meta_conversation boolean
* next_actor_role Role
* next_actor Member

Medium future:

* contributors Member[]
* node_action_type
* node_id integer
* state_history <publication_state, timestamp>[]
* previous_version fk(conversation_node)

# Coming soon (V1)

## game_move_score

Score given to a game_move

* value float
* moves ConversationNode[]
* metric Metric
* badge BadgeType
* - strategy ScoringStrategy
* - quest_signature crypto

Future: have the badge as a separate object, with cryptography

Q: Are badges usually given for a specific move, or for behaviour as a role?


## score_assignment

* from_score fk(game_move_score)
* casting_id fk(casting)
* value float
* badge BadgeType
* - guild_signature crypto

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
