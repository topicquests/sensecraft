# Database roles

Note: All those roles are database-specific, and are prefixed with the database's name. We must ensure that the database name does not contain `__` or end with `_` to avoid collisions. Similarly, usernames should not begin with `_`.


* `<dbname>__owner`: the database owner. Also used for server admins (for now.)
* `<dbname>__client`: This is the view that the web server uses to connect to the database. It corresponds to the view of a non-logged-in user. For now, it can read public views of the quest, guild and user tables. It must be a member of all other roles, so that the client can `SET ROLE` to those roles.
* `<dbname>__member` This corresponds to the view of a logged-in user. All server members will belong to this. Unclear if they will see more through this specific role, but it makes it convenient to change membership.
* `<dbname>__m_<memberid>` the members. Will belong to `__member`, and specific guilds and quests.
* `<dbname>__q_<questid>`  the quest as a role. Allows putting members in that group. Has full access to the quest schema.
* `<dbname>__g_<guildid>`  the guild as a role. allows putting members in that group. Has partial access to the guild schema. (full access to chat, creating a node, editing one own's nodes, avatar record.)
* `<dbname>__l_<guildid>`  the guild leadership as a role. allows putting members in that group. Has full access to the guild schema.
