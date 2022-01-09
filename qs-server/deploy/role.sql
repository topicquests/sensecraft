-- Deploy role
-- requires: guilds

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
    max_pub_state public.publication_state,
    role_draft_target_role_id integer,
    CONSTRAINT role_pkey PRIMARY KEY (id),
    CONSTRAINT role_guild_id_fkey FOREIGN KEY (guild_id)
      REFERENCES public.guilds(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT role_role_draft_target_role_id_fkey FOREIGN KEY (role_draft_target_role_id)
      REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE SET NULL
);

--
-- Name: role_id_seq; Type: SEQUENCE OWNED BY
--

ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;

ALTER TABLE guilds ADD CONSTRAINT guilds_default_role_id_fkey FOREIGN KEY (default_role_id)
  REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE SET NULL;


CREATE TABLE IF NOT EXISTS public.role_node_constraint (
    role_id integer NOT NULL,
    node_type public.ibis_node_type NOT NULL,
    max_pub_state public.publication_state,
    role_draft_target_role_id integer,
    CONSTRAINT role_node_constraint_pkey PRIMARY KEY (role_id, node_type),
    CONSTRAINT role_node_constraint_role_id_fkey FOREIGN KEY (role_id)
      REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT role_node_constraint_role_draft_target_role_id_fkey FOREIGN KEY (role_draft_target_role_id)
      REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE SET NULL
);

COMMIT;
