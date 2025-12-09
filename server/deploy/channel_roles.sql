-- Deploy channel_roles
-- requires: conversation_node
-- requires: role

BEGIN;

--
-- Name: channel_roles_id_seq; Type: SEQUENCE
--

CREATE SEQUENCE IF NOT EXISTS public.channel_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: channel_roles; Type: TABLE
--

CREATE TABLE IF NOT EXISTS public.channel_roles (
  id integer NOT NULL DEFAULT nextval('public.channel_roles_id_seq'::regclass),
  node_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  quest_id INTEGER NOT NULL,
  guild_id INTEGER NOT NULL,
  member_id INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT channel_role_node_pkey PRIMARY KEY(node_id, role_id),

  CONSTRAINT channel_role_id_fkey FOREIGN KEY(role_id)
    REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE CASCADE,

  CONSTRAINT channel_node_id_fkey FOREIGN KEY (node_id)
    REFERENCES public.conversation_node(id) ON UPDATE CASCADE ON DELETE CASCADE,

  CONSTRAINT channel_quest_id_fkey FOREIGN KEY (quest_id)
    REFERENCES public.quests(id) ON UPDATE CASCADE ON DELETE CASCADE,

  CONSTRAINT channel_guild_id_fkey FOREIGN KEY (guild_id)
    REFERENCES public.guilds(id) ON UPDATE CASCADE ON DELETE CASCADE,

  CONSTRAINT channel_member_fkey FOREIGN KEY (member_id)
    REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE
);

COMMIT;
