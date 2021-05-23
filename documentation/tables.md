# Tables

Note: I'm used to integer identies, Jack uses UUIDs. Worth a discussion.

## enums

### QuestStatus

* draft
* registration
* ongoing
* scoring
* finished

### Permissions

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

Under consideration:

* extraCreditForMove could have issues with favoritism

### Roles

Should we have an enum or a table?
The latter would make it easier to extend.
Assuming an enum for now, otherwise use fk(Role) below.
TBD.

### GameMoveType

* add_node

Eventually refactorings, etc.

### ScoringCriterion

Will eventually be objects with computations (ScoringStrategies), but we need to start with an enum representing the axis of what is scored.
TBD

### BadgeType

An enum of badges. TBD.

### PubState

Game moves publication states

* draft
* proposed
* submitted
* visible

## public schema

### users

* handle varchar
* name varchar
* email varchar
* password
* permissions Permission[]

Do we want to bother renaming it "members"?

### guilds

* name varchar
* handle varchar (unique)
* public boolean
* open_for_applications boolean

unsure
* admin_id fk(user) (probably redundant with guild_membership)


public_guilds: view on guilds, with public=true

### quests

* name varchar
* handle varchar (unique)
* description text
* public boolean
* status QuestStatus

later maybe
* scoring ScoringStrategy
* turns TurnStrategy
* admin User

public_quests: view on quests, with public=true


### quest_membership

the user-quest join table

* quest_id fk(quests)
* user_id fk(users)
* confirmed boolean
* permissions Permission[]

todo: triggers for role membership

### guild_memberhsip

the guild-quest join table

* guild_id fk(guild)
* user_id fk(users)
* confirmed boolean
* permissions Permission[]
* available_roles Role[]
* leadership boolean

Is leadership a permission? I think not, because it directly entails role actions.
todo: triggers for role membership

### external_servers

future: there should be a table for known external servers

* name varchar
* server_api URL


## Quest-specific schema

The quest schemas will be created when a quest is created; and the following tables will be created there.

### participating_guilds

The guild as seen in the quest

* name varchar
* server_id fk(external_server)
* handle varchar


The server_api+handle should be a RESTful endpoint yielding the guild information. (There may be a constant string in the middle)
The server + handle should be jointly unique.
(Should we leave the server null for same-server guilds?)
Alternative: A single unique URL for the guild endpoint. But that needs parsing in some cases, so -1 (MAP).
Opinion: I (MAP) would tend to reuse the guild_list and guild_page routes for those endpoints, simply asking for mimetype json rather than HTML.
Question: What do we do with private guilds? If it does not belong to the same server, the quest must be given a secret token to access that information. probably V2.

### avatars

The player as seen in the quest

* guild_id fk(participating_guilds)
* handle varchar
* role Role

Should the avatar handle be the same as the user handle? For now yes.

Dubious: reference to Casting?
(in diagram but I want to avoid FK between guilds and quests.)

### game_moves

* creator_id fk(avatars)
* proposed_move_id varchar
* submitted timestamp
* made_visible timestamp
* about_node_id fk(conversation_node)

The proposed_move_id is the id in the guild's proposed_moves table. A string because in principle, we do not know that the guild uses numeric IDs. Nullable if this move was done in-quest, such as the initial question of the quest.
It might be appropriate to add the fk to the participating_guilds, as it defines the namespace for the proposed_move_id, but that is given indirectly by the creator.

### conversation_nodes

A conversation node. May have been imported from a guild or not.

* title varchar
* description text
* parent_id fk(conversation_nodes)
* ancestry ltree(conversation_nodes)
* imported_from_guild_id fk(participating_guilds)
* guild_identifier varchar

Note: Making the temporary choice to go with tree vs graph. May be refactored.
The author is given by the backlinks from the game_moves.
JP and MAP are having a deep conversation about transclusion vs reference: This version of the table handles neither as of yet.

### game_move_score

Score given to a game_move

* value float
* move_id fk(game_move)
* criterion ScoringCriterion
* badge BadgeType

Future: have the badge as a separate object, with cryptography

Q: Are badges usually given for a specific move, or for behaviour as a role?

### quest_badge

Badge given to a player

* avatar_id fk(avatars)
* badge BadgeType
* for_moves game_move_score[]

Eventually: cryptographic signature

### guild_score

Future, when we integrate cryptography.
For now, it's an aggregate on game_move_score

* guild_id fk(participating_guild)
* total float
* moves game_move_score[]
* criterion ScoringCriterion
* signature crypto

## Guild-specific schema

The guild schemas will be created when a guild is created; and the following tables will be created there.



visible and submitted are the same for v1

### quest_participation

* name varchar
* status quest_status
* server_id fk(external_server)
* handle varchar
* proposed timestamp
* accepted timestamp

Comments made for participating_guilds about the server_api+handle apply here. May correspond to quest_list, quest_page.

### castings

* quest_id fk(quest_participation)
* user_id fk(user)
* role Role

eventually maybe:
* alias varchar
for per-quest avatar alias (which would be used instead of handle. Controversial.)

### quest_scores

* quest_id fk(quest_participation)
* total float
* criterion ScoringCriterion

Eventually will have the crypto signature of the guild_score. 

### user_badges

* casting_id fk(castings)
* from_quest_id fk(quest_scores)
* criterion ScoringCriterion
* origin varchar

from_quest is implied in casting and could be omitted. The origin would be the public URL of the (eventually signed) quest_badge.

Q: Can there be badges assigned by guild leadership (vs quest)?

### turns

A set of proposed_game_moves

* quest_id fk(quest_participation)
* state PubState
* created timestamp
* submitted timestamp
* visible timestamp

### proposed_game_moves

* quest_id fk(quest_participation)
* turn_id fk(turns)
* contributors casting[]
* type GameMoveType
* state PubState
* created timestamp
* proposed timestamp
* submitted timestamp
* visible timestamp

### proposed_conversation_nodes

A conversation node. May have been imported from a quest or proposed locally.

* title varchar
* description text
* parent_id fk(proposed_conversation_nodes)
* ancestry ltree(proposed_conversation_nodes)
* imported_from_quest_id fk()
* guild_identifier varchar
* pub_state PubState

Note: Making the temporary choice to go with tree vs graph. May be refactored.
The author is given by the backlinks from the game_moves.

### global_guild_scores

Use aggregates on quest_scores for now...
