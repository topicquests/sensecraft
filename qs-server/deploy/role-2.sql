-- Deploy role
-- requires: casting

BEGIN;
--
-- Name: role_id_seq; Type: SEQUENCE
--

CREATE SEQUENCE IF NOT EXISTS public.role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: role; Type: TABLE
--

CREATE TABLE IF NOT EXISTS public.role (
    id integer NOT NULL DEFAULT nextval('public.role_id_seq'::regclass),
    name character varying(255) NOT NULL,
    guild_id integer,
    permissions permission[],
    node_type_constraints ibis_node_type[],
    node_state_constraints publication_state[],
    CONSTRAINT role_pkey PRIMARY KEY (id),
    CONSTRAINT role_guild_id_fkey FOREIGN KEY (guild_id)
      REFERENCES public.guilds(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.guild_member_available_role (
    guild_id integer NOT NULL,
    member_id integer NOT NULL,
    role_id integer NOT NULL,
    CONSTRAINT guild_membership_available_role_pkey PRIMARY KEY (guild_id, member_id, role_id),
    CONSTRAINT guild_member_available_role_members_fkey FOREIGN KEY (member_id)
      REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT guild_member_available_role_guilds_fkey FOREIGN KEY (guild_id)
      REFERENCES public.guilds(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT guild_membership_available_role_membership_fkey FOREIGN KEY (guild_id, member_id)
      REFERENCES public.guild_membership(guild_id, member_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT guild_membership_available_role_role_id_fkey FOREIGN KEY (role_id)
      REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.casting_role (
    member_id integer NOT NULL,
    quest_id integer NOT NULL,
    guild_id integer NOT NULL,
    role_id integer NOT NULL,
    CONSTRAINT casting_role_pkey PRIMARY KEY (member_id,  quest_id, guild_id, role_id),
    CONSTRAINT casting_role_members_fkey FOREIGN KEY (member_id)
      REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT casting_role_quests_fkey FOREIGN KEY (quest_id)
      REFERENCES public.quests(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT casting_role_guilds_fkey FOREIGN KEY (guild_id)
      REFERENCES public.guilds(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT casting_role_casting_fkey FOREIGN KEY (quest_id, member_id)
      REFERENCES public.casting(quest_id, member_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT casting_role_role_id_fkey FOREIGN KEY (role_id)
      REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT casting_role_available_role_fkey FOREIGN KEY (guild_id, member_id, role_id)
      REFERENCES public.guild_member_available_role(guild_id, member_id, role_id) ON UPDATE CASCADE ON DELETE CASCADE
);

--
-- Name: role_id_seq; Type: SEQUENCE OWNED BY
--

ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;


COMMIT;
