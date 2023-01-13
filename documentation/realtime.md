# Realtime design

Notifications:

We want to know C(R)UD status; object type; object id.
Also, we may want to know that this object is only relevant if looking at a given quest/guild/play
AND we may want to know whether this object is private to a given quest/guild/play/role/user.

syntax:
CUD <object_type> <id> <owner_id> <constraints>
owner_id is only specified if the owner needs to be reloaded by the dispatcher (hence memberships, castings, not conversation_nodes.) If unspecified, it is set to 0.

Individual permission constraints take one of these forms:

1. `M:<id>` (specific member)
2. `Q:<qid>` (quest member)
3. `G:<gid>[:r<rid>|p<permission>]` (guild member with role/permision)
4. `P:<qid>[:r<rid>|p<permission>]` (gamePlay member with role/permision)

We also have messages which are not notifications, currently the form `E user_id token` for emailing confirmation and password reset.

Focus restrictions constraints use the same form but use lower case (g/p/q) initially. Note that neither implies the other. (you can focus on a game you're not playing etc.) You can use "*" to have "universal focus" as opposed to no focus.

Multiple constraints are separated by " " (conjunction) or "|" (disjunction). Unusually, we will assume conjunctive normal form, i.e. a conjunction of disjunctions. (Note that the disjunction operator cannot be surrounded by space.)

List cases:
published game node only allowed if public quest or quest member (Q), only visible if looking at game (p)

non-published game node (or play channel node) only allowed if playing as that guild (P,P+R,M), only visible if looking at game (p)
guild channel node only allowed if guild member. (G)
(public guild channels?)
changes to public guild/quest always visible. (Have to be member if private.) (Q/G)
changes to quest/guild membership.... idem. (Only useful if looking at quest or more than that? See aggregates below.) (Q/G, maybe q/g)
casting etc. is play-level, so allowed/visible if public quest. (P; p if aggregates)
same with members... but when do I need to know? Only if shared guild (g) or (in-view) play (p). so based on membership/casting. send that instead.
available roles, new guild roles... if guild admin. (G+)
New system roles? Universal.


Note: computed aggregates (#members etc.) should be more visible than otherwise.
Maybe create a view with member number etc.
It makes no sense for a private guild to play a public quest.
