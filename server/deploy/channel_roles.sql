-- Deploy channel_roles
-- requires: conversation_node
-- requires: role

BEGIN;

--
-- Name: channel_roles; Type: TABLE

CREATE TABLE IF NOT EXISTS public.channel_roles (
  node_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  quest_id INTEGER NOT NULL,
  guild_id INTEGER NOT NULL,
  member_id INTEGER DEFAULT NULL,
  CONSTRAINT channel_role_node_pkey PRIMARY KEY(node_id, role_id),
  CONSTRAINT channel_role_fkey FOREIGN KEY(role_id)
    REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT channel_node_fkey FOREIGN KEY (node_id)
    REFERENCES public.conversation_node(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT channel_quest_id_fkey FOREIGN KEY (quest_id)
    REFERENCES public.quests(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT channel_guild_fkey FOREIGN KEY (guild_id)
    REFERENCES public.guilds(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT channel_member_fkey FOREIGN KEY (member_id)
    REFERENCES public.member(id) ON UPDATE CASCADE ON DELETE CASCADE
);

COMMIT;
